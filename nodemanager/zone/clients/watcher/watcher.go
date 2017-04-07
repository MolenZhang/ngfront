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

//前端需批量操作的节点信息
type watcherNodeInfo struct {
	NodeIP   string
	ClientID string
}

type watcherStatusInfo struct {
	NodeIP     string
	ClientID   string
	WatcherID  string
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

	/*
		//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
		webMsg := nodes.NodeInfo{}
		key := client.CreateKey()

		webMsg.Client = nodes.GetClientInfo(key)
		webMsg.Watcher = nodes.GetWatcherData(key)
	*/
	webMsg := nodes.WatchManagerCfgs
	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherAPIServerURL, nil)
	json.Unmarshal(resp, &webMsg)

	response.WriteHeaderAndJson(200, webMsg, "application/json")

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

	client := nodes.ClientInfo{
		NodeIP:   webMsg.NodeIP,
		ClientID: webMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	createWatcherURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

	communicate.SendRequestByJSON(communicate.POST, createWatcherURL, webMsg.WatcherCfg)
	/*
		resp, _ := communicate.SendRequestByJSON(communicate.POST, createWatcherURL, webMsg.WatcherCfg)
		//根据kubeng通信返回的信息存储watcher配置
		respBody := ResponseBody{}
		json.Unmarshal(resp, &respBody)
		watcherKey := respBody.WatcherCfg.WatcherID
		watcherValue := respBody.WatcherCfg
		watcherCfgs := map[int]nodes.WatchManagerCfg{
			watcherKey: watcherValue,
		}
		nodes.AddWatcherData(key, watcherCfgs)
	*/
	webRespMsg := ResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, webRespMsg, "application/json")
	return

}

//对应前端编辑按钮
//putWatcherInfo 处理前端PUT过来的消息 更新
func putWatcherInfoByID(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新指定watcherID的状态")
	watcherID := request.PathParameter("watcherID")

	webMsg := CfgWebMsg{}

	/*intTypeWatcherID, err := strconv.Atoi(watcherID)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}
	*/
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
	/*
		//更新watcher信息
		watcherKey := webMsg.WatcherCfg.WatcherID
		watcherValue := webMsg.WatcherCfg
		watcherCfgs := map[int]nodes.WatchManagerCfg{
			watcherKey: watcherValue,
		}
		nodes.AddWatcherData(key, webMsg.WatcherCfgs)
	*/
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
func startWatcherManager(request *restful.Request, response *restful.Response) {
	reqMsg := watcherStatusInfo{}

	err := request.ReadEntity(&reqMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	reqMsg.WatcherCfg.K8sWatcherStatus = "start"

	client := nodes.ClientInfo{
		NodeIP:   reqMsg.NodeIP,
		ClientID: reqMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	startWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + reqMsg.WatcherID

	//暂时未做处理失败的逻辑判断
	communicate.SendRequestByJSON(communicate.PUT, startWatcherCfgURL, reqMsg.WatcherCfg.K8sWatcherStatus)
	return
}

//对应前端停止按钮
func stopWatcherManager(request *restful.Request, response *restful.Response) {
	reqMsg := watcherStatusInfo{}

	err := request.ReadEntity(&reqMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	reqMsg.WatcherCfg.K8sWatcherStatus = "stop"

	client := nodes.ClientInfo{
		NodeIP:   reqMsg.NodeIP,
		ClientID: reqMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	startWatcherCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath + reqMsg.WatcherID

	//暂时未做处理失败的逻辑判断
	communicate.SendRequestByJSON(communicate.PUT, startWatcherCfgURL, reqMsg.WatcherCfg.K8sWatcherStatus)
	return
}

//对应前端 重启按钮，实则为启动按钮
func restartWatcherManager(request *restful.Request, response *restful.Response) {
	startWatcherManager(request, response)
	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", loadWatcherPage)
	//http.HandleFunc("/watcher", dealWatcherInfo)
	http.HandleFunc("/namespaces", getWatchNamespacesDetailInfo)

	ws := new(restful.WebService)

	ws.
		Path("/watcher").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well

	//获取所有的监视管理器配置 GET http://localhost:8888/watcher
	ws.Route(ws.GET("/").To(getAllWatcherInfo).
		// docs
		Doc("get watch manager config").
		Operation("findWatchManagerConfig").
		Reads(nodes.ClientInfo{}).
		Returns(200, "OK", nodes.NodeInfo{}))

	//更新下发监视管理器配置 PUT http://localhost:8888/watcher/watcherID
	ws.Route(ws.PUT("/{WatcherID}").To(putWatcherInfoByID).
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
	ws.Route(ws.DELETE("/{WatcherID}").To(deleteWatcherInfoByID).
		Doc("delete a specific watcher cfg").
		Operation("deleteSpecificWatcherInfo").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")).
		Reads(CfgWebMsg{}))

	//获取某个特定的监视器配置
	ws.Route(ws.GET("/{WatcherID}").To(getWatcherInfoByID).
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

	//停止监视器
	ws.Route(ws.POST("/stop").To(stopWatcherManager).
		// docs
		Doc("stop watcher manager").
		Operation("stopWatcherManager").
		Reads(BatchWatcherWebMsg{})) // from the request

	//开启监视器
	ws.Route(ws.POST("/start").To(startWatcherManager).
		// docs
		Doc("start watcher manager").
		Operation("startWatcherManager").
		Reads(BatchWatcherWebMsg{})) // from the request

	//重启监视器
	ws.Route(ws.POST("/start").To(restartWatcherManager).
		// docs
		Doc("start watcher manager").
		Operation("startWatcherManager").
		Reads(BatchWatcherWebMsg{})) // from the request

	restful.Add(ws)

	return
}
