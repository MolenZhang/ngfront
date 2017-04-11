package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"html/template"
	//"io/ioutil"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	//"strconv"

	"github.com/emicklei/go-restful"
)

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

//前端需批量操作的节点内容
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

// WebWatcherManagerCfgs 将后端的监视信息由map转换成前端所需的arry
var WebWatcherManagerCfgs []nodes.WatchManagerCfg

//WatcherCfgConvertToWebCfg map转换arry函数
func WatcherCfgConvertToWebCfg(watchManagerCfgs map[int]nodes.WatchManagerCfg) []nodes.WatchManagerCfg {

	webWatcherManagerCfgs := make([]nodes.WatchManagerCfg, len(watchManagerCfgs))

	for k, watcherCfg := range watchManagerCfgs {
		//webWatcherManagerCfgs = append(webWatcherManagerCfgs, watcherCfg)
		webWatcherManagerCfgs[k-1] = watcherCfg
	}

	return webWatcherManagerCfgs
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

	getWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + watcherID

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

	deleteWatcherAPIServerURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + watcherID
	communicate.SendRequestByJSON(communicate.DELETE, deleteWatcherAPIServerURL, nil)
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

	respMsg := WatcherCfgConvertToWebCfg(webMsg)
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

//createWatcherInfo 处理前端生成的信息 创建
func postWatcherInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 创建watcherCfg")
	webMsg := CfgWebMsg{}
	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}
	logdebug.Println(logdebug.LevelDebug, "新增时 前端传来的数据：", webMsg)
	client := nodes.ClientInfo{
		NodeIP:   webMsg.NodeIP,
		ClientID: webMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	createWatcherURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

	resp, _ := communicate.SendRequestByJSON(communicate.POST, createWatcherURL, webMsg.WatcherCfg)
	respBody := ResponseBody{}
	json.Unmarshal(resp, &respBody)

	getNamespacesFromWeb(respBody.WatcherCfg.WatchNamespaceSets)

	logdebug.Println(logdebug.LevelDebug, "返回给前端时 后台传来的数据：", respBody)
	response.WriteHeaderAndJson(200, respBody, "application/json")
	return

}

// SaveNamespacesFromWeb 保存前端已经选择的租户集合
type SaveNamespacesFromWeb struct {
	namespaceSets []string
}

var saveNamespacesFromWeb SaveNamespacesFromWeb

func getNamespacesFromWeb(namespaces []string) {
	for _, namespace := range namespaces {
		saveNamespacesFromWeb.namespaceSets = append(saveNamespacesFromWeb.namespaceSets, namespace)
	}
}

//对应前端编辑按钮
//putWatcherInfo 处理前端PUT过来的消息 更新
//同时 前端的重启、停止、开启按钮的实现也是基于更新函数实现
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

	updateWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + watcherID

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

//使用界面传过来的IP VERSION获取所要监控的k8s集群租户的详细信息(统计有多少服务)
func getWatchNamespacesDetailInfo(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	kubernetesMasterHost := r.Form.Get("KubernetesMasterHost")
	kubernetesAPIVersion := r.Form.Get("KubernetesAPIVersion")
	jobZoneType := r.Form.Get("JobZoneType")

	getNamespacesURL := kubernetesMasterHost + "/" + kubernetesAPIVersion + "/namespaces"

	namespaces := getNamespacesDetailInfoFromK8s(getNamespacesURL, jobZoneType)

	logdebug.Println(logdebug.LevelDebug, "从后台获取到的租户详细信息:", namespaces)
	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(namespaces)
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

	startWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + watcherID

	//get 对应watcherID的信息
	respMsg := ResponseBody{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, startWatcherCfgURL, nil)
	json.Unmarshal(resp, &respMsg)
	respMsg.WatcherCfg.K8sWatcherStatus = watcherStatus

	//put 更新监控状态位 并发给k8s
	respWeb, _ := communicate.SendRequestByJSON(communicate.PUT, startWatcherCfgURL, respMsg.WatcherCfg)
	json.Unmarshal(resp, &respMsg)

	response.WriteHeaderAndJson(200, respWeb, "application/json")

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
	ws.Route(ws.POST("/{watcherID}/{status}").To(changeWatcherManagerStatus).
		// docs
		Doc("change watcher manager watcherStatus").
		Operation("stopWatcherManager").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Param(ws.PathParameter("status", "前端监控状态").DataType("string")))

	restful.Add(ws)

	return
}
