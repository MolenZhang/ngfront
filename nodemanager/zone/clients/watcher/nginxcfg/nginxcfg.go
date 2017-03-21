package nginxcfg

import (
	"encoding/json"
	"github.com/emicklei/go-restful"
	"html/template"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
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
	AppSrcType            string                //服务来源类型 k8s 或者 extern 根据访问的路径填充
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

/*
type AppCfgs struct {
	appCfgs map[string]Config
}
*/
type AllAppCfgs struct {
	allAppCfgsMap map[string]map[string]Config
}

func showNginxCfgPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<<加载nginx页面>>>>>>>>>>>>>")
	//加载模板 显示内容是 批量操作nginx配置
	t, err := template.ParseFiles("template/views/nginx/nginxcfg.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	t.Execute(w, nil)

	return
}

func (svc *ServiceInfo) getNginxInfo(request *restful.Request, response *restful.Response) {

	var allAppCfgs AllAppCfgs

	allAppCfgs.allAppCfgsMap = make(map[string]map[string]Config, 0)

	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<get nginxCfg>>>>>>>>>>>>")
	//
	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	//
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	getK8sAppCfgsUrl := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/k8s"
	resp, err := communicate.SendRequestByJSON(communicate.GET, getK8sAppCfgsUrl, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	allK8sCfgs := make(map[string]map[string]Config, 0)
	if err = json.Unmarshal(resp, &allK8sCfgs); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	for k, v := range allK8sCfgs {
		for key, cfg := range v {
			cfg.AppSrcType = "k8s"
			v[key] = cfg
		}
		//k = namespace2-app1
		allAppCfgs.allAppCfgsMap[k] = v //map[string]Config
	}

	getExternAppcfgsUrl := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/extern"
	resp, err = communicate.SendRequestByJSON(communicate.GET, getExternAppcfgsUrl, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	allExternCfgs := make(map[string]map[string]Config, 0)
	if err = json.Unmarshal(resp, &allExternCfgs); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	for k, v := range allExternCfgs {
		for key, cfg := range v {
			cfg.AppSrcType = "extern"
			v[key] = cfg
		}

		//k = namespace2-app2
		allAppCfgs.allAppCfgsMap[k] = v //map[string]Config
	}

	logdebug.Println(logdebug.LevelDebug, allAppCfgs.allAppCfgsMap)

	err = response.WriteHeaderAndJson(200, allAppCfgs.allAppCfgsMap, "application/json")

}

func (svc *ServiceInfo) postNginxInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<post nginxCfg>>>>>>>>>>>>")
}

func (svc *ServiceInfo) delNginxInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<del nginxCfg>>>>>>>>>>>>")
}

func (svc *ServiceInfo) putNginxInfo(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelInfo, "<<<<<<<<<<<<put nginxCfg>>>>>>>>>>>>")
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
	ws.Route(ws.POST("/").To(svc.postNginxInfo).
		// docs
		Doc("post nginx manager config").
		Operation("postNginxManagerConfig").
		Reads(Config{})) // from the request
	//
	ws.Route(ws.PUT("/").To(svc.putNginxInfo).
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
