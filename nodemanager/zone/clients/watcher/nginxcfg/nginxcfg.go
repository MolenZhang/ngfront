package nginxcfg

import (
	//"encoding/json"
	"html/template"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"

	"github.com/emicklei/go-restful"
)

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

//get
func (svc *ServiceInfo) getAllNginxInfo(request *restful.Request, response *restful.Response) {
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
	logdebug.Println(logdebug.LevelDebug, "删除服务的一条nginx配置!")

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

	_, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, kubeNGCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

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
	//
	ws.Route(ws.GET("/").To(svc.getAllNginxInfo).
		// docs
		Doc("get nginx manager config").
		Operation("findNginxManagerConfig"))
	//		Reads(nodes.ClientInfo{}).
	//Returns(200, "OK", AllAppCfgs{}))
	//
	ws.Route(ws.POST("/").To(svc.createNginxCfg).
		// docs
		Doc("post nginx manager config").
		Operation("postNginxManagerConfig").
		Reads(WebConfig{})) // from the request
	//
	ws.Route(ws.PUT("/").To(svc.updateNginxCfg).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(WebConfig{})) // from the request
	//
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

	restful.Add(ws)

	return
}
