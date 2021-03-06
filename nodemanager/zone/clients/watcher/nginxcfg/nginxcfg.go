/*Package nginxcfg 主要用于前端进行服务的nginx配置相关操作
1、同一区域下的所有节点 新增一套nginx配置
2、同一区域下的所有节点 删除一套nginx配置
3、同一区域下的所有节点 更新一套nginx配置
4、同一区域下的所有节点 获取一套nginx配置
5、同一区域下的所有节点 获取所有nginx配置
*/
package nginxcfg

import (
	"encoding/json"
	"html/template"
	"net/http"

	"github.com/emicklei/go-restful"

	"ngfront/communicate"
	"ngfront/config"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
)

//AppSrcTypeKubernetes 服务源于k8s
const (
	AppSrcTypeKubernetes = "k8s"
	AppSrcTypeExtern     = "extern"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

type webResponseBody struct {
	Result       bool
	ErrorMessage string
	NginxConf    KubeNGConfig
	ErrCode      int32
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
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<<loadding nginx page>>>>>>>>>>>>>")
	//加载模板 显示内容是 批量操作nginx配置
	templateDir := config.NgFrontCfg.TemplateDir
	t, err := template.ParseFiles(templateDir + "template/views/nginx/nginxcfg.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	t.Execute(w, nil)

	return
}

func getAppCfgsURL(request *restful.Request, response *restful.Response) (clientInfo nodes.ClientInfo, getK8sAppCfgsURL, getExternAppCfgsURL string) {

	request.Request.ParseForm()

	watcherID := request.PathParameter("watcherID")

	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	key := client.CreateKey()
	clientInfo = nodes.GetClientInfo(key)

	getK8sAppCfgsURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		AppSrcTypeKubernetes +
		"/watchers/" +
		watcherID

	getExternAppCfgsURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		AppSrcTypeExtern +
		"/watchers/" +
		watcherID
	logdebug.Println(logdebug.LevelDebug, "getK8sAppCfgsURL ", getK8sAppCfgsURL)
	logdebug.Println(logdebug.LevelDebug, "getExternAppCfgsURL ", getExternAppCfgsURL)
	return
}

//get all
func (svc *ServiceInfo) getAllNginxCfgs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<getting all of the nginx config!>>>>>>>>>")

	clientInfo, k8sAppCfgsURL, externAppCfgsURL := getAppCfgsURL(request, response)

	webAppCfgs := WebNginxCfgs{
		NodeIP:        clientInfo.NodeIP,
		ClientID:      clientInfo.ClientID,
		APIServerPort: clientInfo.APIServerPort,
	}

	k8sCfgList := NginxCfgsList{
		CfgType:  AppSrcTypeKubernetes,
		CfgsList: getNginxCfgsListFromKubeNG(k8sAppCfgsURL, AppSrcTypeKubernetes),
	}

	externCfgList := NginxCfgsList{
		CfgType:  AppSrcTypeExtern,
		CfgsList: getNginxCfgsListFromKubeNG(externAppCfgsURL, AppSrcTypeExtern),
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

	recvData, err := communicate.SendRequestByJSON(communicate.GET, appCfgURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		response.WriteErrorString(http.StatusNotFound, "App could not be found.")

		return
	}

	kubeNGCfgsList := make(map[string]KubeNGConfig, 0)

	json.Unmarshal(recvData, &kubeNGCfgsList)

	cfgsList := []WebConfig{}

	logdebug.Println(logdebug.LevelDebug, "the message recieved is:", kubeNGCfgsList)

	for _, kubeNGCfg := range kubeNGCfgsList {
		webCfg := kubeNGCfg.convertToWebCfg()

		logdebug.Println(logdebug.LevelDebug, "get单个nginx配置时发给前端的nginx配置是:", webCfg)

		cfgsList = append(cfgsList, webCfg)
	}

	resp.NginxList[0].CfgsList = cfgsList

	response.WriteHeaderAndJson(200, resp, "application/json")

	return
}

func getServerName(watcherID, jobZoneType, ns string) string {

	nodesInfo := nodes.GetAllNodesInfo()
	for _, nodeInfo := range nodesInfo {

		client := nodeInfo.Client

		if client.JobZoneType != jobZoneType {
			continue
		}
		requestURL := "http://" +
			client.NodeIP +
			client.APIServerPort +
			"/" +
			client.WatchManagerAPIServerPath +
			"/" +
			watcherID
		respData, _ := communicate.SendRequestByJSON(communicate.GET, requestURL, nil)
		watcherCfg := nodes.WatchManagerCfg{}

		json.Unmarshal(respData, &watcherCfg)

		if watcherCfg.DefaultNginxServerType == domain {
			return ns + "." + watcherCfg.DomainSuffix
		}
		return ""
	}
	return ""
}

const (
	domain string = "domain"
	ip     string = "ip"
)

// put
func (svc *ServiceInfo) updateNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<update nginx config>>>>>>>>>")

	request.Request.ParseForm()
	watcherID := request.Request.Form.Get("WatcherID")

	logdebug.Println(logdebug.LevelDebug, "WatcherID is :", watcherID)
	nginxCfg, jobZoneType := getWebInfo(request, response)

	logdebug.Println(logdebug.LevelDebug, "UPATE INFO :", nginxCfg)

	kubeNGCfg := nginxCfg.convertToKubeNGCfg()

	kubeNGCfg.ServerName = getServerName(watcherID, jobZoneType, kubeNGCfg.Namespace)

	nodesInfo := nodes.GetAllNodesInfo()
	for _, nodeInfo := range nodesInfo {

		client := nodeInfo.Client

		if client.JobZoneType != jobZoneType {
			continue
		}

		nginxCfg.ServerName = kubeNGCfg.ServerName
		appCfgURL, _, serverType := getAppInfo(client, nginxCfg, watcherID)

		if serverType == "ip" {
			nginxCfgURL := "http://" +
				client.NodeIP +
				client.APIServerPort +
				"/" +
				client.NginxCfgsAPIServerPath +
				"/" +
				nginxCfg.AppSrcType

			appCfgURL = nginxCfgURL +
				"/" +
				nginxCfg.Namespace +
				"-" +
				nginxCfg.AppName +
				"/" +
				client.NodeIP +
				":" +
				nginxCfg.ListenPort

			kubeNGCfg.ServerName = client.NodeIP
		}

		logdebug.Println(logdebug.LevelDebug, "when update nginx config,the URL from web is", appCfgURL)
		recvData, err := communicate.SendRequestByJSON(communicate.PUT, appCfgURL, kubeNGCfg)

		logdebug.Println(logdebug.LevelDebug, "更新时 发给后端的nginx配置是:", kubeNGCfg)
		if err != nil {
			logdebug.Println(logdebug.LevelError, err)

			response.WriteError(http.StatusInternalServerError, err)

			return
		}

		resp := parseRespFromKubeNG(recvData)
		if resp.Result != true {
			response.WriteHeaderAndJson(200, resp, "application/json")
			return
		}
	}

	webResp := ResponseBody{
		Result: true,
		WebCfg: nginxCfg,
	}

	response.WriteHeaderAndJson(200, webResp, "application/json")

	return
}

func getWebInfo(request *restful.Request, response *restful.Response) (nginxCfg WebConfig, jobZoneType string) {

	request.Request.ParseForm()
	jobZoneType = request.Request.Form.Get("JobZoneType")

	//	nginxCfg := WebConfig{}
	if err := request.ReadEntity(&nginxCfg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	return
}

func getAppInfo(client nodes.ClientInfo, nginxCfg WebConfig, watcherID string) (
	appCfgURL, nginxCfgURL, serverType string) {

	nginxCfgURL = "http://" +
		client.NodeIP +
		client.APIServerPort +
		"/" +
		client.NginxCfgsAPIServerPath +
		"/" +
		nginxCfg.AppSrcType

	appCfgURL = nginxCfgURL +
		"/" +
		nginxCfg.Namespace +
		"-" +
		nginxCfg.AppName +
		"/" +
		nginxCfg.ServerName +
		":" +
		nginxCfg.ListenPort

	requestURL := "http://" +
		client.NodeIP +
		client.APIServerPort +
		"/" +
		client.WatchManagerAPIServerPath +
		"/" +
		watcherID
	respData, _ := communicate.SendRequestByJSON(communicate.GET, requestURL, nil)
	watcherCfg := nodes.WatchManagerCfg{}

	json.Unmarshal(respData, &watcherCfg)
	serverType = watcherCfg.DefaultNginxServerType
	return

}

func getAppInfoURL(client nodes.ClientInfo, nginxCfg WebConfig) (
	appCfgURL, nginxCfgURL string) {

	nginxCfgURL = "http://" +
		client.NodeIP +
		client.APIServerPort +
		"/" +
		client.NginxCfgsAPIServerPath +
		"/" +
		nginxCfg.AppSrcType

	appCfgURL = nginxCfgURL +
		"/" +
		nginxCfg.Namespace +
		"-" +
		nginxCfg.AppName +
		"/" +
		nginxCfg.ServerName +
		":" +
		nginxCfg.ListenPort

	return
}

//delete
func (svc *ServiceInfo) deleteNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<delete nginx config>>>>>>>>>")

	request.Request.ParseForm()
	watcherID := request.Request.Form.Get("WatcherID")

	nginxCfg, jobZoneType := getWebInfo(request, response)

	kubeNGCfg := nginxCfg.convertToKubeNGCfg()

	kubeNGCfg.ServerName = getServerName(watcherID, jobZoneType, kubeNGCfg.Namespace)

	allNodesInfo := nodes.GetAllNodesInfo()
	for _, singleNodeInfo := range allNodesInfo {

		client := singleNodeInfo.Client

		if client.JobZoneType != jobZoneType {
			continue
		}

		nginxCfg.ServerName = kubeNGCfg.ServerName
		appCfgURL, _, serverType := getAppInfo(client, nginxCfg, watcherID)
		if serverType == "ip" {
			nginxCfgURL := "http://" +
				client.NodeIP +
				client.APIServerPort +
				"/" +
				client.NginxCfgsAPIServerPath +
				"/" +
				nginxCfg.AppSrcType

			appCfgURL = nginxCfgURL +
				"/" +
				nginxCfg.Namespace +
				"-" +
				nginxCfg.AppName +
				"/" +
				client.NodeIP +
				":" +
				nginxCfg.ListenPort
			kubeNGCfg.ServerName = client.NodeIP

		}

		logdebug.Println(logdebug.LevelDebug, "when delete one nginx config, the URL is: ", appCfgURL)

		recvData, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, kubeNGCfg)
		if err != nil {
			logdebug.Println(logdebug.LevelError, err)
			response.WriteError(http.StatusInternalServerError, err)

			return
		}

		resp := parseRespFromKubeNG(recvData)
		if resp.Result != true {
			response.WriteHeaderAndJson(200, resp, "application/json")
			return
		}
	}

	respMsg := webResponseBody{
		Result: true,
	}
	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
}

//post
func (svc *ServiceInfo) createNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<add one nginx config>>>>>>>>>")
	request.Request.ParseForm()
	watcherID := request.Request.Form.Get("WatherID")

	nginxCfg, jobZoneType := getWebInfo(request, response)

	kubeNGCfg := nginxCfg.convertToKubeNGCfg()

	nodesInfo := nodes.GetAllNodesInfo()
	for _, nodeInfo := range nodesInfo {

		client := nodeInfo.Client
		if client.JobZoneType != jobZoneType {
			continue
		}

		_, nginxCfgURL, serverType := getAppInfo(client, nginxCfg, watcherID)
		logdebug.Println(logdebug.LevelDebug, "when add one nginx config, the URL is:", nginxCfgURL)

		if serverType == "ip" {
			kubeNGCfg.ServerName = client.NodeIP
		}

		recvData, err := communicate.SendRequestByJSON(communicate.POST, nginxCfgURL, kubeNGCfg)
		if err != nil {
			logdebug.Println(logdebug.LevelError, err)

			response.WriteError(http.StatusInternalServerError, err)

			return
		}

		resp := parseRespFromKubeNG(recvData)
		if resp.Result != true {
			response.WriteHeaderAndJson(200, resp, "application/json")
			return
		}
	}

	webResp := ResponseBody{
		Result: true,
		WebCfg: nginxCfg,
	}

	response.WriteHeaderAndJson(200, webResp, "application/json")

	return
}

func getServerType(client nodes.ClientInfo, watcherID string) string {
	requestURL := "http://" +
		client.NodeIP +
		client.APIServerPort +
		"/" +
		client.WatchManagerAPIServerPath +
		"/" +
		watcherID
	respData, _ := communicate.SendRequestByJSON(communicate.GET, requestURL, nil)
	watcherCfg := nodes.WatchManagerCfg{}

	json.Unmarshal(respData, &watcherCfg)
	return watcherCfg.DefaultNginxServerType

}

func (svc *ServiceInfo) deleteUserCfgs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<delete USER_NGINX config>>>>>>>>>")

	request.Request.ParseForm()
	jobZoneType := request.Request.Form.Get("JobZoneType")

	userNginxCfg := WebConfig{}
	if err := request.ReadEntity(&userNginxCfg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	nodesInfo := nodes.GetAllNodesInfo()
	for _, nodeInfo := range nodesInfo {
		client := nodeInfo.Client
		if client.JobZoneType != jobZoneType {
			continue
		}
		appCfgURL, _ := getAppInfoURL(client, userNginxCfg)

		communicate.SendRequestByJSON(communicate.PUT, appCfgURL, userNginxCfg)
	}
	webResp := webResponseBody{
		Result: true,
	}

	response.WriteHeaderAndJson(200, webResp, "application/json")

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
	ws.Route(ws.GET("/all/{watcherID}").To(svc.getAllNginxCfgs).
		// docs
		Doc("get all nginx cfgs").
		Operation("getAllNginxCfgs").
		Param(ws.PathParameter("watcherID", "watcherID由监控的租户列表组成").DataType("int")))
	//	Reads(CfgWebMsg{}))

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

	//put update
	ws.Route(ws.PUT("/").To(svc.updateNginxCfg).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(WebConfig{})) // from the request

	//delete 删除同一个区域下所有client上同一watcherID 下的某个nginx配置
	ws.Route(ws.DELETE("/").To(svc.deleteNginxCfg).
		// docs
		Doc("删除一个服务的单个Nginx配置").
		Operation("deleteNginxConfig").
		Reads(WebConfig{})) // from the request

	ws.Route(ws.GET("/compare/{clientA-clientB}").To(svc.compareAllWatchersNginxCfgs).
		Doc("对比2个client的所有watcher下的nginx配置").
		Operation("compareAllWatchersNginxCfgs").
		Param(ws.PathParameter("clientA-clientB", "需要对比的2个clientID").DataType("string")))

	ws.Route(ws.GET("/compare/{clientA-clientB}/{watcherID}").To(svc.compareSingleWatchersNginxCfgs).
		Doc("对比2个client的指定watcher下的nginx配置").
		Operation("downloadfile").
		Param(ws.PathParameter("clientA-clientB watcherID", "需要对比的2个clientID watcherID").DataType("string")))
	//Reads(WebReqMsg{}))
	ws.Route(ws.POST("/singleClientDownload").To(downloadSingleClientNginxCfgsByWatcherIDs).
		Doc("download single client nginxCfg by watcherID").
		Operation("downloadfile"))

	ws.Route(ws.POST("/allClientDownload").To(downloadClientsNginxCfgsByWatcherIDs).
		Doc("download all client nginxCfg").
		Operation("downloadfile"))

	ws.Route(ws.GET("/singleClientDownload/tarDownload").To(svc.realDownload).
		Doc("download nginx config").
		Operation("downloadfile"))

	ws.Route(ws.PUT("/deleteUserCfgs").To(svc.deleteUserCfgs).
		Doc("delete user nginxCfg").
		Operation("deleteUserCfgs"))

	restful.Add(ws)

	return
}
