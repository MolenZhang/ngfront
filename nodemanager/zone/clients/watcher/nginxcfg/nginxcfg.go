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

//WholeAppNginxCfgs 完整的所有服务的所有配置合集
type WholeAppNginxCfgs struct {
	ExternNginxCfgsList []Config
	K8sNginxCfgsList    []Config
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

	k8sNginxCfgsList := getNginxCfgsListFromKubeNG(getK8sAppCfgsURL, AppSrcTypeKubernetes)
	externNginxCfgsList := getNginxCfgsListFromKubeNG(getExternAppCfgsURL, AppSrcTypeExtern)

	wholeAppCfgs := WholeAppNginxCfgs{
		K8sNginxCfgsList:    k8sNginxCfgsList,
		ExternNginxCfgsList: externNginxCfgsList,
	}

	response.WriteHeaderAndJson(200, wholeAppCfgs, "application/json")

	return
}

// put
func (svc *ServiceInfo) updateNginxInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<post nginxCfg>>>>>>>>>>>>")
}

func (svc *ServiceInfo) delNginxInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<del nginxCfg>>>>>>>>>>>>")
}

//post
func (svc *ServiceInfo) createNginxInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<put nginxCfg>>>>>>>>>>>>")
	createNginxCfg := Config{}

	if err := request.ReadEntity(&createNginxCfg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	appCfgURl := getAppCfgURL(request, response, createNginxCfg.AppSrcType)

	_, err := communicate.SendRequestByJSON(communicate.POST, appCfgURl, createNginxCfg)
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
	ws.Route(ws.POST("/").To(svc.createNginxInfo).
		// docs
		Doc("post nginx manager config").
		Operation("postNginxManagerConfig").
		Reads(Config{})) // from the request
	//
	ws.Route(ws.PUT("/").To(svc.updateNginxInfo).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(Config{})) // from the request
	//
	ws.Route(ws.DELETE("/").To(svc.delNginxInfo).
		// docs
		Doc("delete nginx manager config").
		Operation("deleteNginxManagerConfig").
		Reads(Config{})) // from the request

	restful.Add(ws)

	return
}

func getAppCfgURL(request *restful.Request, response *restful.Response, ppType string) string {
	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	//
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)
	return "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/" + AppSrcTypeExtern
}
