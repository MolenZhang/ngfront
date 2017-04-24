/*Package watcher 主要用于前端监控集群信息以及节点信息
主要有以下功能：
	1、新增一个监视计划
	2、删除一个监视计划
	3、编辑一个监视计划
	3、获取一个监视计划
	4、租户筛选
*/
package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"github.com/emicklei/go-restful"
	"html/template"
	"net/http"
	"ngfront/communicate"
	"ngfront/config"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	//	"os"
	"sort"
	"strconv"
)

// 租户列表
type watcherNamespaceSets struct {
	WatchNamespaceSets []string
}

// NamespaceAppInfo 单个租户下的所有服务
type NamespaceAppInfo struct {
	Namespace   string
	AppInfoList []AppInfo
}

// NamespaceAppInfoList  单个watcherID下所有的租户以及所有服务列表
type NamespaceAppInfoList struct {
	NamespaceAppsList []NamespaceAppInfo
}

//前端单个watcher需展示的信息
type watcherInfo struct {
	Client  nodes.ClientInfo
	Watcher nodes.WatchManagerCfg
}

//前端需批量操作的节点信息
type watcherNodeInfo struct {
	NodeIP   string
	ClientID string
}

type watcherStatusInfo struct {
	NodeIP     string
	ClientID   string
	WatcherCfg nodes.WatchManagerCfg
}

//BatchWatcherWebMsg 前端需批量操作的节点内容
type BatchWatcherWebMsg struct {
	BatchNodesInfo []watcherNodeInfo
	WatcherCfg     nodes.WatchManagerCfg
}

//CfgWebMsg 监视器配置的web消息
type CfgWebMsg struct {
	NodeIP     string
	ClientID   string
	WatcherCfg nodes.WatchManagerCfg
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//ResponseBody 用于衡量每次restful请求的执行结果(通常是PUT)
type ResponseBody struct {
	Result       bool
	ErrorMessage string
	ErrCode      int32
	WatcherCfg   nodes.WatchManagerCfg
}

func mapConvertToArray(kubengWatchersMap map[int]nodes.WatchManagerCfg) []nodes.WatchManagerCfg {

	sortKeys := make([]int, 0)
	for mapKey := range kubengWatchersMap {
		sortKeys = append(sortKeys, mapKey)
	}

	sort.Ints(sortKeys)

	webWatchersArray := make([]nodes.WatchManagerCfg, 0)
	for _, mapKey := range sortKeys {
		webWatchersArray = append(webWatchersArray, kubengWatchersMap[mapKey])

	}
	return webWatchersArray
}

//加载界面
func loadWatcherPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<<加载watcher页面>>>>>>>>>>>>>")
	//加载模板 显示内容是 批量操作client
	templateDir := config.NgFrontCfg.TemplateDir
	t, err := template.ParseFiles(templateDir + "template/views/nginx/watcher.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	t.Execute(w, nil)

	return
}

//获取前端特指的某个监视器配置
func getWatcherInfoByID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "根据前端提供的WatcherID获取相应监视器信息")
	watcherID := request.PathParameter("watcherID")

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	getWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + "/" + watcherID

	resp, _ := communicate.SendRequestByJSON(communicate.GET, getWatcherCfgURL, nil)

	webMsg := ResponseBody{}
	json.Unmarshal(resp, &webMsg)

	response.WriteHeaderAndJson(200, webMsg, "application/json")

	return

}

type deleteWatcherCfg struct {
	JobZoneType  string
	WatcherIDSet []string
}

func deleteWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "删除对应监视器信息")

	reqMsg := deleteWatcherCfg{}
	err := request.ReadEntity(&reqMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	for _, watcherID := range reqMsg.WatcherIDSet {

		allNodesInfo := nodes.GetAllNodesInfo()
		for _, singleNodeInfo := range allNodesInfo {

			if singleNodeInfo.Client.JobZoneType != reqMsg.JobZoneType {
				continue
			}

			deleteWatcherURL := "http://" +
				singleNodeInfo.Client.NodeIP +
				singleNodeInfo.Client.APIServerPort +
				"/" +
				singleNodeInfo.Client.WatchManagerAPIServerPath +
				"/" +
				watcherID
			communicate.SendRequestByJSON(communicate.DELETE, deleteWatcherURL, nil)
		}
	}

	webRespMsg := ResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, webRespMsg, "application/json")

	return
}

//处理前端的get请求
func getAllWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "获取所有监视器信息")

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	watcherAPIServerURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

	logdebug.Println(logdebug.LevelDebug, "获取所有的监视器信息URL", watcherAPIServerURL)
	webMsg := nodes.WatchManagerCfgs
	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherAPIServerURL, nil)
	json.Unmarshal(resp, &webMsg)

	respMsg := mapConvertToArray(webMsg)
	logdebug.Println(logdebug.LevelDebug, "Arr 获取所有监视器信息：", respMsg)
	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
}

//createWatcherInfo 处理前端生成的信息 创建 自动同步配置给其他client
func postWatcherInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 创建watcherCfg")

	webMsg := CfgWebMsg{}
	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}
	logdebug.Println(logdebug.LevelDebug, "新增时 前端传来的数据：", webMsg)
	/*
		//保存前端传来的nginxListenPort
		nginxListenPort := webMsg.WatcherCfg.NginxListenPort
		addNginxListenPort(nginxListenPort)
	*/
	//给每一个client 发送watcher信息
	allNodesInfo := nodes.GetAllNodesInfo()
	for _, singleNodeInfo := range allNodesInfo {

		if singleNodeInfo.Client.JobZoneType != webMsg.WatcherCfg.JobZoneType {
			continue
		}

		createWatcherURL := "http://" +
			singleNodeInfo.Client.NodeIP +
			singleNodeInfo.Client.APIServerPort +
			"/" +
			singleNodeInfo.Client.WatchManagerAPIServerPath

		communicate.SendRequestByJSON(communicate.POST, createWatcherURL, webMsg.WatcherCfg)

		logdebug.Println(logdebug.LevelDebug, "前端创建watcher时发给kubeng的URL：", createWatcherURL)
	}

	respBody := ResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, respBody, "application/json")
	return
}

/*
var nginxListenPortSet []string

//保存前端已经选择过的nginx监听端口
func addNginxListenPort(port string) {
	//	nginxListenPortSet = append(nginxListenPortSet, port)
	fileDir := "/etc/ngfront"
	if _, err := os.Stat(fileDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(fileDir, os.ModePerm)
		}
	}
	fileName := fileDir + "nginxListenPortSet"
	file, err := os.OpenFile(fileName, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0666)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer file.Close()

	file.WriteString(port)
}
*/
//对应前端编辑按钮
//putWatcherInfo 处理前端PUT过来的消息 更新
func putWatcherInfoByID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新指定watcherID的状态")
	watcherID := request.PathParameter("watcherID")

	intTypeWatcherID, err := strconv.Atoi(watcherID)

	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	webMsg := CfgWebMsg{}

	err = request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}
	webMsg.WatcherCfg.WatcherID = intTypeWatcherID

	allNodesInfo := nodes.GetAllNodesInfo()
	for _, singleNodeInfo := range allNodesInfo {

		client := singleNodeInfo.Client
		if client.JobZoneType != webMsg.WatcherCfg.JobZoneType {
			continue
		}

		updateWatcherCfgURL := "http://" +
			client.NodeIP +
			client.APIServerPort +
			"/" +
			client.WatchManagerAPIServerPath +
			"/" +
			watcherID

		communicate.SendRequestByJSON(communicate.PUT, updateWatcherCfgURL, webMsg.WatcherCfg)
	}
	webRespMsg := ResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, webRespMsg, "application/json")
	return
}

// 处理前端批量POST过来的消息
func batchPostWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 批量创建watcher状态")

	webMsg := BatchWatcherWebMsg{}
	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	logdebug.Println(logdebug.LevelDebug, "前端watcher信息", webMsg)

	for _, batchNodeInfo := range webMsg.BatchNodesInfo {

		client := nodes.ClientInfo{
			NodeIP:   batchNodeInfo.NodeIP,
			ClientID: batchNodeInfo.ClientID,
		}
		key := client.CreateKey()
		clientInfo := nodes.GetClientInfo(key)

		//更新watcher信息
		//		nodes.AddWatcherData(key, webMsg.WatcherCfg)

		createWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

		//暂时未做处理失败的逻辑判断
		communicate.SendRequestByJSON(communicate.POST, createWatcherCfgURL, webMsg.WatcherCfg)
	}
	return
}

func getWatcherInfoCfg(request *restful.Request) (requestURL string, clientInfo nodes.ClientInfo) {

	watcherID := request.PathParameter("watcherID")
	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo = nodes.GetClientInfo(key)

	requestURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.WatchManagerAPIServerPath +
		"/" +
		watcherID

	return
}

//对应前端 启动 按钮
func changeWatcherManagerStatus(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<更改监视器状态>>>>>>>>")

	watcherStatus := request.PathParameter("status")

	changeWatcherStatusURL, _ := getWatcherInfoCfg(request)

	logdebug.Println(logdebug.LevelDebug, "changeWatcherStatusURL", changeWatcherStatusURL)

	//get 对应watcherID的信息
	respMsg := ResponseBody{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, changeWatcherStatusURL, nil)
	json.Unmarshal(resp, &respMsg.WatcherCfg)
	respMsg.WatcherCfg.K8sWatcherStatus = watcherStatus

	//put 更新监控状态位 并发给k8s
	respWeb, _ := communicate.SendRequestByJSON(communicate.PUT, changeWatcherStatusURL, respMsg.WatcherCfg)
	json.Unmarshal(respWeb, &respMsg)

	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
}

func getSingleWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "获取具体watcherID监视器信息")

	//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
	webMsg := watcherInfo{}

	watcherAPIServerURL, clientInfo := getWatcherInfoCfg(request)

	webMsg.Client = clientInfo

	logdebug.Println(logdebug.LevelDebug, "watcher INFO URL", watcherAPIServerURL)

	respMsg := ResponseBody{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherAPIServerURL, nil)
	json.Unmarshal(resp, &respMsg.WatcherCfg)
	logdebug.Println(logdebug.LevelDebug, "kubng返回给的数据信息", respMsg.WatcherCfg)
	webMsg.Watcher = respMsg.WatcherCfg

	logdebug.Println(logdebug.LevelDebug, "getSingleWatcherInfo 获取前端数据：", webMsg)
	response.WriteHeaderAndJson(200, webMsg, "application/json")

	return

}

func getNamespaceInfoByWatcherID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<根据watcherID获取租户信息和服务信息>>>>>>")

	var (
		watcherCfg           watcherNamespaceSets
		namespaceAppInfoList NamespaceAppInfoList
		getEndpointsURL      string
	)

	endpointList := EndpointsList{}
	appInfoList := []AppInfo{}

	namespacesURL, clientInfo := getWatcherInfoCfg(request)
	logdebug.Println(logdebug.LevelDebug, "根据wacherID 获取租户信息的URL", namespacesURL)

	kubernetesMasterHost := clientInfo.K8sMasterHost
	kubernetesAPIVersion := clientInfo.K8sAPIVersion
	jobZoneType := clientInfo.JobZoneType

	//根据watcherID从路径watchmgr中获取前端已经勾选过的租户信息
	resp, _ := communicate.SendRequestByJSON(communicate.GET, namespacesURL, nil)

	json.Unmarshal(resp, &watcherCfg)

	logdebug.Println(logdebug.LevelDebug, "根据wacherID 获取的租户信息", watcherCfg)

	//根据各个租户信息获取每一个租户下的服务信息
	for _, namespace := range watcherCfg.WatchNamespaceSets {
		namespaceAppsList := NamespaceAppInfo{}
		namespaceAppsList.Namespace = namespace

		//获取单个租户下的所有服务信息
		getEndpointsURL = kubernetesMasterHost +
			"/" +
			kubernetesAPIVersion +
			"/namespaces" +
			"/" +
			namespace +
			"/endpoints"

		logdebug.Println(logdebug.LevelDebug, "根据namespace获取服务信息的URL", getEndpointsURL)
		endpointList = getServiceFromK8s(getEndpointsURL)

		appInfoList = getAppListFromEpList(endpointList, jobZoneType)
		namespaceAppsList.AppInfoList = appInfoList

		namespaceAppInfoList.NamespaceAppsList = append(namespaceAppInfoList.NamespaceAppsList, namespaceAppsList)

	}
	logdebug.Println(logdebug.LevelDebug, "发给前端的租户以及服务信息", namespaceAppInfoList)
	response.WriteHeaderAndJson(200, namespaceAppInfoList, "application/json")
	return
}

// watcherInitInfoResp watcher初始信息
type watcherInitInfoResp struct {
	K8sMasterHost string
	K8sAPIVersion string
}

func getWatcherInfo(request *restful.Request, response *restful.Response) {

	webResp := watcherInitInfoResp{}
	allNodesInfo := nodes.GetAllNodesInfo()
	for _, singleNodeInfo := range allNodesInfo {
		webResp.K8sMasterHost = singleNodeInfo.Client.K8sMasterHost
		webResp.K8sAPIVersion = singleNodeInfo.Client.K8sAPIVersion
		break
	}

	logdebug.Println(logdebug.LevelDebug, "watcher 初始化信息 ", webResp)
	response.WriteHeaderAndJson(200, webResp, "application/json")
	return

}

func checkNginxListenPort(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<检查前端输入的nginx listen port>>>>>>")

	request.Request.ParseForm()
	nginxListenPort := request.Request.Form.Get("nginxListenPort")
	jobZoneType := request.Request.Form.Get("jobZoneType")

	webResp := ResponseBody{}

	logdebug.Println(logdebug.LevelDebug, "前端传来的端口值:", nginxListenPort)
	logdebug.Println(logdebug.LevelDebug, "前端传来的工作区域:", jobZoneType)

	for _, nodeInfo := range nodes.GetAllNodesInfo() {
		client := nodeInfo.Client
		if client.JobZoneType == jobZoneType {
			watcherURL := "http://" +
				client.NodeIP +
				client.APIServerPort +
				"/" +
				client.WatchManagerAPIServerPath
			logdebug.Println(logdebug.LevelDebug, "获取端口时所需的watcherURL:", watcherURL)
			resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherURL, nil)
			nginxListenPortInWatchers := map[int]nodes.WatchManagerCfg{}
			json.Unmarshal(resp, &nginxListenPortInWatchers)
			logdebug.Println(logdebug.LevelDebug, "已经存在的监视计划信息:", nginxListenPortInWatchers)

			for _, value := range nginxListenPortInWatchers {
				if value.NginxListenPort == nginxListenPort {
					logdebug.Println(logdebug.LevelDebug, "已经保存的端口值:", value.NginxListenPort)
					webResp.Result = false
					webResp.ErrorMessage = "端口已占用，请更换端口"

					response.WriteHeaderAndJson(200, webResp, "application/json")
					return
				}
			}
			break
		}
	}

	webResp.Result = true
	response.WriteHeaderAndJson(200, webResp, "application/json")
	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", loadWatcherPage)
	//http.HandleFunc("/watcher", dealWatcherInfo)
	http.HandleFunc("/namespaces", getWatchNamespacesDetailInfo)

	ws := new(restful.WebService)

	ws.
		Path("/watchers").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well

	ws.Route(ws.GET("/watcher/{watcherID}").To(getSingleWatcherInfo).
		// docs
		Doc("get watch manager config").
		Operation("findWatchManagerConfig").
		Writes(watcherInfo{}))
	//	Returns(200, "OK", nodes.NodeInfo{}))

	//获取所有的监视管理器配置 GET http://localhost:8888/watcher
	ws.Route(ws.GET("/").To(getAllWatcherInfo).
		// docs
		Doc("get watch manager config").
		Operation("findWatchManagerConfig").
		Reads(nodes.ClientInfo{}).
		Returns(200, "OK", nodes.NodeInfo{}))

	//更新下发监视管理器配置 PUT http://localhost:8888/watcher/watcherID
	ws.Route(ws.PUT("/{watcherID}").To(putWatcherInfoByID).
		// docs
		Doc("update watch manager config").
		Operation("updateWatchManagerConfig").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Reads(CfgWebMsg{})) // from the request

	//创建监视器配置 CREATE
	ws.Route(ws.POST("/").To(postWatcherInfo).
		Doc("create a watcher manager").
		Operation("createWatcherInfo").
		Reads(CfgWebMsg{}))

	//删除某个特定的监视器配置
	ws.Route(ws.DELETE("/").To(deleteWatcherInfo).
		Doc("delete a specific watcher cfg").
		Operation("deleteSpecificWatcherInfo").
		Reads(CfgWebMsg{}))

	//获取某个特定的监视器下所有的租户以及租户所对应的服务信息
	ws.Route(ws.GET("/{watcherID}").To(getNamespaceInfoByWatcherID).
		Doc("get a specific  watcher cfg").
		Operation("getSpecificWatcherInfo").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")))

	//批量下发监视管理器配置 POST http://localhost:8888/watcher
	ws.Route(ws.POST("/all").To(batchPostWatcherInfo).
		// docs
		Doc("batch update watch manager config").
		Operation("updateAllWatchManagerConfig").
		Reads(BatchWatcherWebMsg{})) // from the request

	//停止或开启监视器
	ws.Route(ws.PUT("/{watcherID}/{status}").To(changeWatcherManagerStatus).
		// docs
		Doc("change watcher manager watcherStatus").
		Operation("stopWatcherManager").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Param(ws.PathParameter("status", "前端监控状态").DataType("string")))

	ws.Route(ws.GET("/watcherInfo").To(getWatcherInfo).
		Doc("get watcher init information").
		Operation("getwatcherInfo"))
	//		Reads())

	ws.Route(ws.PUT("/portCheck").To(checkNginxListenPort).
		// docs
		Doc("check nginx listen port").
		Operation("checkNginxListenPort"))
	//	Reads(BatchWatcherWebMsg{})) // from the request

	restful.Add(ws)

	return
}
