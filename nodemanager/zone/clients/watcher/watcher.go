package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	//"strconv"
	"github.com/emicklei/go-restful"
	"sort"
)

//SaveNamespaceInfo 保存已经监控的租户
type SaveNamespaceInfo struct {
	WatchNamespaceSets []string
}

// NamespaceInfo 租户信息
type NamespaceInfo struct {
	Namespace string
	IsUsed    bool
}

/*
// WebWatcherManagerCfgs 将后端的监视信息由map转换成前端所需的arry
var WebWatcherManagerCfgs []nodes.WatchManagerCfg
*/
type namespacesUseMark struct {
	NamespacesInfo []NamespaceInfo
	AppList        [][]AppInfo
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
	t, err := template.ParseFiles("template/views/nginx/watcher.html")
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

func deleteWatcherInfoByID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "根据前端提供的watcherID删除对应监视器信息")
	watcherID := request.PathParameter("watcherID")

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	deleteWatcherAPIServerURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + "/" + watcherID
	communicate.SendRequestByJSON(communicate.DELETE, deleteWatcherAPIServerURL, nil)
	logdebug.Println(logdebug.LevelDebug, "删除watcher URL", deleteWatcherAPIServerURL)
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

	webMsg := nodes.WatchManagerCfgs
	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherAPIServerURL, nil)
	json.Unmarshal(resp, &webMsg)

	respMsg := mapConvertToArray(webMsg)
	logdebug.Println(logdebug.LevelDebug, "获取所有监视器信息：", webMsg)
	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
}

func (webMsg *CfgWebMsg) getWatcherAPIServerURL() (watcherAPIServerURL string) {
	client := nodes.ClientInfo{
		NodeIP:   webMsg.NodeIP,
		ClientID: webMsg.ClientID,
	}

	key := client.CreateKey()

	clientInfo := nodes.GetClientInfo(key)

	watcherAPIServerURL = "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

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

	//	getNamespacesFromWeb(webMsg.WatcherCfg.WatchNamespaceSets)

	//给每一个client 发送watcher信息
	allNodesInfo := nodes.GetAllNodesInfo()
	for _, singleNodeInfo := range allNodesInfo {

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

//对应前端编辑按钮
//putWatcherInfo 处理前端PUT过来的消息 更新
func putWatcherInfoByID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新指定watcherID的状态")
	watcherID := request.PathParameter("watcherID")

	webMsg := CfgWebMsg{}

	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	client := nodes.ClientInfo{
		NodeIP:   webMsg.NodeIP,
		ClientID: webMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	updateWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + "/" + watcherID

	//暂时未做处理失败的逻辑判断
	communicate.SendRequestByJSON(communicate.PUT, updateWatcherCfgURL, webMsg.WatcherCfg)

	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新watcher状态 收到的web前端消息内容:", webMsg)

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

/*
//保存前端已经勾选过的租户信息
func getNamespacesFromWeb(namespaces []string) {
	for _, namespace := range namespaces {
		saveNamespacesFromWeb.NamespaceSets = append(saveNamespacesFromWeb.NamespaceSets, namespace)
	}
}
*/
//使用界面传过来的IP VERSION获取所要监控的k8s集群租户的详细信息(统计有多少服务)
func getWatchNamespacesDetailInfo(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	var (
		namespacesInfo        []NamespaceInfo
		watcherNamespaceSet   map[int]SaveNamespaceInfo
		saveNamespacesFromWeb []string
	)

	kubernetesMasterHost := r.Form.Get("KubernetesMasterHost")
	kubernetesAPIVersion := r.Form.Get("KubernetesAPIVersion")
	jobZoneType := r.Form.Get("JobZoneType")

	getNamespacesURL := kubernetesMasterHost + "/" + kubernetesAPIVersion + "/namespaces"
	logdebug.Println(logdebug.LevelDebug, "获取租户请求的URL", getNamespacesURL)
	namespaces := getNamespacesDetailInfoFromK8s(getNamespacesURL, jobZoneType)

	//将kubeng传来的租户 保存 并置标志位为false
	for _, namespace := range namespaces.NamespacesList {
		newNamespace := NamespaceInfo{
			Namespace: namespace,
			IsUsed:    false,
		}
		namespacesInfo = append(namespacesInfo, newNamespace)
	}

	logdebug.Println(logdebug.LevelDebug, "******保存的租户信息*****:", namespacesInfo)
	//筛选前端已经勾选过的租户 并将标志位置为true
	namespaceUsedMap := nodes.GetAllNodesInfo()
	var watcherURL string
	for _, nodeInfo := range namespaceUsedMap {
		watcherURL = "http://" +
			nodeInfo.Client.NodeIP +
			nodeInfo.Client.APIServerPort +
			"/" +
			nodeInfo.Client.WatchManagerAPIServerPath
		break //循环一次即可
	}
	resp, err := http.Get(watcherURL)
	if err != nil {
		logdebug.Println(logdebug.LevelDebug, err)
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	json.Unmarshal(body, &watcherNamespaceSet)

	//将map 转换成 arry
	for _, watcherNamespace := range watcherNamespaceSet {
		saveNamespacesFromWeb = watcherNamespace.WatchNamespaceSets
	}

	//将前端已经勾选过的租户进行标记
	for _, namespaceUsed := range saveNamespacesFromWeb {
		for index := range namespacesInfo {
			if namespaceUsed == namespacesInfo[index].Namespace {
				namespacesInfo[index].IsUsed = true
			}
		}
	}

	logdebug.Println(logdebug.LevelDebug, "******保存的租户信息并标记显示*****:", namespacesInfo)
	//将所有标记过的租户传给前端使用
	webNamespacesResp := namespacesUseMark{
		NamespacesInfo: namespacesInfo,
		AppList:        namespaces.AppInfoList,
	}

	logdebug.Println(logdebug.LevelDebug, "从后台获取到的租户详细信息:", namespaces)
	logdebug.Println(logdebug.LevelDebug, "发送给前端的租户详细信息:", webNamespacesResp)
	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(webNamespacesResp)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	w.Write(jsonTypeMsg)

	return
}

//对应前端 启动 按钮
func changeWatcherManagerStatus(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<更改监视器状态>>>>>>>>")

	watcherID := request.PathParameter("watcherID")
	watcherStatus := request.PathParameter("status")

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	startWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + "/" + watcherID
	logdebug.Println(logdebug.LevelDebug, "startWatcherCfgURL", startWatcherCfgURL)
	//get 对应watcherID的信息
	respMsg := ResponseBody{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, startWatcherCfgURL, nil)
	json.Unmarshal(resp, &respMsg.WatcherCfg)
	respMsg.WatcherCfg.K8sWatcherStatus = watcherStatus

	//put 更新监控状态位 并发给k8s
	respWeb, _ := communicate.SendRequestByJSON(communicate.PUT, startWatcherCfgURL, respMsg.WatcherCfg)
	json.Unmarshal(respWeb, &respMsg)
	logdebug.Println(logdebug.LevelDebug, "watcherCfg", respMsg)

	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
}

func getSingleWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "获取具体watcherID监视器信息")

	watcherID := request.PathParameter("watcherID")

	request.Request.ParseForm()

	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
	webMsg := watcherInfo{}

	key := client.CreateKey()

	clientInfo := nodes.GetClientInfo(key)
	webMsg.Client = clientInfo

	watcherAPIServerURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + "/" + watcherID

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
	ws.Route(ws.DELETE("/{watcherID}").To(deleteWatcherInfoByID).
		Doc("delete a specific watcher cfg").
		Operation("deleteSpecificWatcherInfo").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Reads(CfgWebMsg{}))

	//获取某个特定的监视器配置
	ws.Route(ws.GET("/{watcherID}").To(getWatcherInfoByID).
		Doc("get a specific  watcher cfg").
		Operation("getSpecificWatcherInfo").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Reads(CfgWebMsg{}))

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

	restful.Add(ws)

	return
}
