package nginxcfg

import (
	"encoding/json"

	"html/template"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"

	"github.com/emicklei/go-restful"
)

type clientInfo struct {
	NodeIP   string
	ClientID string
}

//BatchNginxCfgInfo 批量配置下发信息
type BatchNginxCfgInfo struct {
	NodesInfo   []clientInfo
	WebNginxCfg WebConfig
}

//AppSrcTypeKubernetes 服务源于k8s
const (
	AppSrcTypeKubernetes = "k8s"
	AppSrcTypeExtern     = "extern"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//ResponseBody 用于衡量每次restful请求的执行结果(通常是PUT POST)
type ResponseBody struct {
	Result       bool
	ErrorMessage string
	NginxConf    KubeNGConfig
	WebCfg       WebConfig
	ErrCode      int32
}

//显示nginx配置主页
func showNginxCfgPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<<加载nginx页面>>>>>>>>>>>>>")
	//加载模板 显示内容是 批量操作nginx配置
	t, err := template.ParseFiles("template/views/nginx/nginxcfg.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	t.Execute(w, nil)

	return
}

//get all
func (svc *ServiceInfo) getAllNginxCfgs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "获取完整的app nginx配置集合!")

	request.Request.ParseForm()

	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	getK8sAppCfgsURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		AppSrcTypeKubernetes

	getExternAppCfgsURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		AppSrcTypeExtern

	webAppCfgs := WebNginxCfgs{
		NodeIP:        clientInfo.NodeIP,
		ClientID:      client.ClientID,
		APIServerPort: clientInfo.APIServerPort,
	}

	k8sCfgList := NginxCfgsList{
		CfgType:  AppSrcTypeKubernetes,
		CfgsList: getNginxCfgsListFromKubeNG(getK8sAppCfgsURL, AppSrcTypeKubernetes),
	}

	externCfgList := NginxCfgsList{
		CfgType:  AppSrcTypeExtern,
		CfgsList: getNginxCfgsListFromKubeNG(getExternAppCfgsURL, AppSrcTypeExtern),
	}

	webAppCfgs.NginxList = append(webAppCfgs.NginxList, k8sCfgList)
	webAppCfgs.NginxList = append(webAppCfgs.NginxList, externCfgList)

	response.WriteHeaderAndJson(200, webAppCfgs, "application/json")

	return
}

//get single
func (svc *ServiceInfo) getSingleNginxCfg(request *restful.Request, response *restful.Response) {
	appKey := request.PathParameter("namespace-appname")

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	appSrcType := request.Request.Form.Get("AppSrcType")

	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	//先去k8s路径下去拿 如果没有 去extern路径拿
	appCfgURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		appSrcType +
		"/" +
		appKey

	resp := WebNginxCfgs{
		NodeIP:        clientInfo.NodeIP,
		ClientID:      clientInfo.ClientID,
		APIServerPort: clientInfo.APIServerPort,
	}

	resp.NginxList = make([]NginxCfgsList, 1)

	resp.NginxList[0].CfgType = appSrcType

	logdebug.Println(logdebug.LevelDebug, "获取单个的app nginx配置!-----appkey=", appKey, " appCfgURL = ", appCfgURL)

	recvData, err := communicate.SendRequestByJSON(communicate.GET, appCfgURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		response.WriteErrorString(http.StatusNotFound, "App could not be found.")

		return
	}

	kubeNGCfgsList := make(map[string]KubeNGConfig, 0)

	json.Unmarshal(recvData, &kubeNGCfgsList)

	cfgsList := []WebConfig{}

	logdebug.Println(logdebug.LevelDebug, "收到的数据流", kubeNGCfgsList)

	for _, kubeNGCfg := range kubeNGCfgsList {
		webCfg := kubeNGCfg.convertToWebCfg()

		cfgsList = append(cfgsList, webCfg)
	}

	resp.NginxList[0].CfgsList = cfgsList

	response.WriteHeaderAndJson(200, resp, "application/json")

	return
}

// put
func (svc *ServiceInfo) updateNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "更新服务的一条nginx配置")

	nginxCfgURL, updateNginxCfg := buildCommunicateInfo(request, response)
	appCfgURL := nginxCfgURL +
		"/" +
		updateNginxCfg.Namespace +
		"-" +
		updateNginxCfg.AppName +
		"/" +
		updateNginxCfg.ServerName +
		":" +
		updateNginxCfg.ListenPort

	kubeNGCfg := updateNginxCfg.convertToKubeNGCfg()

	recvData, err := communicate.SendRequestByJSON(communicate.PUT, appCfgURL, kubeNGCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	resp := parseRespFromKubeNG(recvData)

	response.WriteHeaderAndJson(200, resp, "application/json")

	return
}

//delete
func (svc *ServiceInfo) deleteSingleNginxCfg(request *restful.Request, response *restful.Response) {

	nginxCfgURL, delSingleNginxCfg := buildCommunicateInfo(request, response)
	appCfgURL := nginxCfgURL +
		"/" +
		delSingleNginxCfg.Namespace +
		"-" +
		delSingleNginxCfg.AppName +
		"/" +
		delSingleNginxCfg.ServerName +
		":" +
		delSingleNginxCfg.ListenPort

	kubeNGCfg := delSingleNginxCfg.convertToKubeNGCfg()

	logdebug.Println(logdebug.LevelDebug, "删除服务的一条nginx配置!", appCfgURL)

	recvData, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, kubeNGCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	resp := parseRespFromKubeNG(recvData)

	response.WriteHeaderAndJson(200, resp, "application/json")

	return
}

//post
func (svc *ServiceInfo) createNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelInfo, "新增服务的一条nginx配置!")
	appCfgURL, createNginxCfg := buildCommunicateInfo(request, response)

	kubeNGCfg := createNginxCfg.convertToKubeNGCfg()

	recvData, err := communicate.SendRequestByJSON(communicate.POST, appCfgURL, kubeNGCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	resp := parseRespFromKubeNG(recvData)

	response.WriteHeaderAndJson(200, resp, "application/json")

	return
}

//post all
func (svc *ServiceInfo) createAllNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<nginx配置批量下发>>>>>>>>>>>>")

	batchNgCfg := BatchNginxCfgInfo{}

	if err := request.ReadEntity(&batchNgCfg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<前端批量配置信息>>>>>>>>>>>>", batchNgCfg.NodesInfo)
	for _, batchClientInfo := range batchNgCfg.NodesInfo {
		client := nodes.ClientInfo{
			NodeIP:   batchClientInfo.NodeIP,
			ClientID: batchClientInfo.ClientID,
		}

		key := client.CreateKey()
		clientInfo := nodes.GetClientInfo(key)

		nginxCfgURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/" + batchNgCfg.WebNginxCfg.AppSrcType

		kubeNGCfg := batchNgCfg.WebNginxCfg.convertToKubeNGCfg()

		_, err := communicate.SendRequestByJSON(communicate.POST, nginxCfgURL, kubeNGCfg)
		if err != nil {
			logdebug.Println(logdebug.LevelError, err)

			response.WriteError(http.StatusInternalServerError, err)

			return
		}

		return
	}
	resp := ResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, resp, "application/json")
}

//delete all
func (svc *ServiceInfo) deleteAllNginxCfgs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "删除一个服务的所有nginx配置")

	nginxCfgURL, deleteAllNginxCfgs := buildCommunicateInfo(request, response)
	appCfgURL := nginxCfgURL +
		"/" +
		deleteAllNginxCfgs.Namespace +
		"-" +
		deleteAllNginxCfgs.AppName

	_, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher/nginxcfg", showNginxCfgPage)

	ws := new(restful.WebService)

	ws.
		Path("/nginxcfg").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well
	//get all
	ws.Route(ws.GET("/").To(svc.getAllNginxCfgs).
		// docs
		Doc("get all nginx cfgs").
		Operation("getAllNginxCfgs"))

	//get single
	ws.Route(ws.GET("/{namespace-appname}").To(svc.getSingleNginxCfg).
		// docs
		Doc("get single nginx cfgs").
		Operation("getSingleNginxCfg"))

	//post - create
	ws.Route(ws.POST("/").To(svc.createNginxCfg).
		// docs
		Doc("post nginx manager config").
		Operation("postSingleNginxManagerConfig").
		Reads(WebConfig{})) // from the request

	//postAll - createAll
	ws.Route(ws.POST("/all").To(svc.createAllNginxCfg).
		// docs
		Doc("post nginx manager config").
		Operation("postAllNginxManagerConfig").
		Reads(BatchNginxCfgInfo{})) // from the request
	//put update
	ws.Route(ws.PUT("/").To(svc.updateNginxCfg).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(WebConfig{})) // from the request

	//delete
	ws.Route(ws.DELETE("/").To(svc.deleteSingleNginxCfg).
		// docs
		Doc("删除一个服务的单个Nginx配置").
		Operation("deleteSingleNginxConfig").
		Reads(WebConfig{})) // from the request

	ws.Route(ws.DELETE("/all").To(svc.deleteAllNginxCfgs).
		// docs
		Doc("删除一个服务的所有Nginx配置").
		Operation("deleteAllNginxConfig").
		Reads(WebConfig{})) // from the request

	ws.Route(ws.GET("/download").To(svc.nginxCfgDownload).
		Doc("download nginx config").
		Operation("downloadfile").
		Reads(WebReqMsg{}))

	restful.Add(ws)

	return
}
