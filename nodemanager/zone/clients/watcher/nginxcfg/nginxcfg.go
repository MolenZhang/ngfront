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

//UserDefinedNginxRules 用户自定义nginx规则
type UserDefinedNginxRules struct {
	RulesSet      map[string][]string
	OperationType string //操作类型(本字段尚未启用)
}

//LogRulesInfo log规则信息
type LogRulesInfo struct {
	LogRuleName     string //log 规则名
	LogFileDirPath  string //log 产生日志路径
	LogTemplateName string //log 模板名
}

//AppSrcTypeKubernetes 服务源于k8s
const (
	AppSrcTypeKubernetes = "k8s"
	AppSrcTypeExtern     = "extern"
)

//Config nginx 配置
type Config struct {
	ServerName            string                //nginx配置server_name选项(域名 IP方式均可)
	ListenPort            string                //nginx配置listen选项
	RealServerPath        string                //真实提供服务的路径
	Namespace             string                //namespace租户 应该从k8s集群获得
	AppName               string                //app名字 用于制作路径 文件名等 应从k8s集群获得
	Location              string                //nginx配置loction选项(相当于原来的proxy_path)
	ProxyRedirectSrcPath  string                //nginx配置proxy_redirect选项 源路径
	ProxyRedirectDestPath string                //nginx配置proxy_redirect选项 目路径
	UpstreamIPs           []string              //nginx配置upstream IP (不支持界面配置该选项 但支持获取该选项)
	UpstreamPort          string                //nginx配置upstream Port (不支持界面配置该选项 但支持获取该选项)
	IsUpstreamIPHash      bool                  //是否需要ip_hash
	IsAppActivity         bool                  //app活动位
	OperationType         string                //操作类型
	IsK8sNotify           bool                  //k8s通知位
	UpstreamUserRules     UserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	ServerUserRules       UserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	LocationUserRules     UserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	LogRule               LogRulesInfo          //日志规则相关信息
	DeleteUserCfgs        bool                  //应用停止时 是否删除个性化配置
	IsDefaultCfg          bool                  //本条配置是否是默认配置
	AppSrcType            string                //服务来源类型 k8s 或者 extern 根据访问的路径填充(暂未启用)
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//WebNginxCfgs 返回给web端的nginx配置信息
type WebNginxCfgs struct {
	NodeIP        string
	ClientID      string
	APIServerPort string
	NginxList     []NginxCfgsList
}

//NginxCfgsList 所有的k8s/extern nginx 配置列表
type NginxCfgsList struct {
	CfgType  string
	CfgsList []Config
}

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

//从kubeng获取nginx配置集合
func getNginxCfgsListFromKubeNG(getCfgsURL string, appSrcType string) (cfgsList []Config) {
	//logdebug.Println(logdebug.LevelDebug, "URL= !", getCfgsURL)

	resp, err := communicate.SendRequestByJSON(communicate.GET, getCfgsURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	allAppsCfgs := make(map[string]map[string]Config, 0)
	if err = json.Unmarshal(resp, &allAppsCfgs); err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	for _, eachAppCfgs := range allAppsCfgs {
		for _, singleCfg := range eachAppCfgs {
			//遍历出最小单位的一条配置 追加至数组中 添加app来源类型字段
			singleCfg.AppSrcType = appSrcType
			cfgsList = append(cfgsList, singleCfg)
		}
	}

	logdebug.Println(logdebug.LevelDebug, "--------cfgsList = ", cfgsList)

	return
}

func (svc *ServiceInfo) getNginxInfo(request *restful.Request, response *restful.Response) {
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
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<post nginxCfg>>>>>>>>>>>>")

	URL, updateNginxCfg := getCommunicateInfo(request, response)
	appCfgURL := URL +
		"/" +
		updateNginxCfg.Namespace +
		"-" +
		updateNginxCfg.AppName +
		"/" +
		updateNginxCfg.ServerName +
		":" +
		updateNginxCfg.ListenPort

	_, err := communicate.SendRequestByJSON(communicate.PUT, appCfgURL, updateNginxCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
}

func (svc *ServiceInfo) deleteSingleNginxCfg(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<del Single nginxCfg>>>>>>>>>>>>")

	URL, delSingleNginxCfg := getCommunicateInfo(request, response)
	appCfgURL := URL +
		"/" +
		delSingleNginxCfg.Namespace +
		"-" +
		delSingleNginxCfg.AppName +
		"/" +
		delSingleNginxCfg.ServerName +
		":" +
		delSingleNginxCfg.ListenPort

	_, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, delSingleNginxCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
}

//post
func (svc *ServiceInfo) createNginxCfg(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<put nginxCfg>>>>>>>>>>>>")

	appCfgURL, createNginxCfg := getCommunicateInfo(request, response)

	_, err := communicate.SendRequestByJSON(communicate.POST, appCfgURL, createNginxCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
}

func (svc *ServiceInfo) deleteAllNginxCfgs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<del All nginxCfgs>>>>>>>>>>>>")

	URL, deleteAllNginxCfgs := getCommunicateInfo(request, response)
	appCfgURL := URL +
		"/" +
		deleteAllNginxCfgs.Namespace +
		"-" +
		deleteAllNginxCfgs.AppName
	_, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
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
	ws.Route(ws.GET("/").To(svc.getNginxInfo).
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
		Reads(Config{})) // from the request
	//
	ws.Route(ws.PUT("/").To(svc.updateNginxCfg).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(Config{})) // from the request
	//
	ws.Route(ws.DELETE("/").To(svc.deleteSingleNginxCfg).
		// docs
		Doc("删除一个服务的单个Nginx配置").
		Operation("deleteSingleNginxConfig").
		Reads(Config{})) // from the request

	ws.Route(ws.DELETE("/").To(svc.deleteAllNginxCfgs).
		// docs
		Doc("删除一个服务的所有Nginx配置").
		Operation("deleteAllNginxConfig"))

	restful.Add(ws)

	return
}

func getCommunicateInfo(request *restful.Request, response *restful.Response) (url string, nginxCfg Config) {

	if err := request.ReadEntity(&nginxCfg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)
	url = "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/" + nginxCfg.AppSrcType
	return
}
