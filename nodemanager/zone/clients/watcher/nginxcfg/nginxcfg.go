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

//KubeNGConfig nginx 配置 用于从kubeng获取json格式数据
type KubeNGConfig struct {
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

//UserRules 用户自定义的规则结构
type UserRules struct {
	RuleCMD   string
	RuleParam string
}

//JSUserDefinedNginxRules js所需配置结构
type JSUserDefinedNginxRules struct {
	UserRuleSet []UserRules
}

//WebConfig nginx 配置 用于与js通讯 (json格式数据)
type WebConfig struct {
	ServerName            string                  //nginx配置server_name选项(域名 IP方式均可)
	ListenPort            string                  //nginx配置listen选项
	RealServerPath        string                  //真实提供服务的路径
	Namespace             string                  //namespace租户 应该从k8s集群获得
	AppName               string                  //app名字 用于制作路径 文件名等 应从k8s集群获得
	Location              string                  //nginx配置loction选项(相当于原来的proxy_path)
	ProxyRedirectSrcPath  string                  //nginx配置proxy_redirect选项 源路径
	ProxyRedirectDestPath string                  //nginx配置proxy_redirect选项 目路径
	UpstreamIPs           []string                //nginx配置upstream IP (不支持界面配置该选项 但支持获取该选项)
	UpstreamPort          string                  //nginx配置upstream Port (不支持界面配置该选项 但支持获取该选项)
	IsUpstreamIPHash      bool                    //是否需要ip_hash
	IsAppActivity         bool                    //app活动位
	OperationType         string                  //操作类型
	IsK8sNotify           bool                    //k8s通知位
	UpstreamUserRules     JSUserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	ServerUserRules       JSUserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	LocationUserRules     JSUserDefinedNginxRules //保留字段 用于用户自定义nginx规则
	LogRule               LogRulesInfo            //日志规则相关信息
	DeleteUserCfgs        bool                    //应用停止时 是否删除个性化配置
	IsDefaultCfg          bool                    //本条配置是否是默认配置
	AppSrcType            string                  //服务来源类型 k8s 或者 extern 根据访问的路径填充(暂未启用)
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//NginxCfgsList 所有的k8s/extern nginx 配置列表
type NginxCfgsList struct {
	CfgType  string
	CfgsList []WebConfig
}

//WebNginxCfgs 返回给web端的nginx配置信息
type WebNginxCfgs struct {
	NodeIP        string
	ClientID      string
	APIServerPort string
	NginxList     []NginxCfgsList
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

//从kubeng数据结构中提取出部分字段 转换成js所需的数据结构
func (kubeNGCfg *KubeNGConfig) convertToWebCfg() (webCfg WebConfig) {
	webCfg = WebConfig{
		ServerName:            kubeNGCfg.ServerName,
		ListenPort:            kubeNGCfg.ListenPort,
		RealServerPath:        kubeNGCfg.RealServerPath,
		Namespace:             kubeNGCfg.Namespace,
		AppName:               kubeNGCfg.AppName,
		Location:              kubeNGCfg.Location,
		ProxyRedirectSrcPath:  kubeNGCfg.ProxyRedirectSrcPath,
		ProxyRedirectDestPath: kubeNGCfg.ProxyRedirectDestPath,
		UpstreamIPs:           kubeNGCfg.UpstreamIPs,
		UpstreamPort:          kubeNGCfg.UpstreamPort,
		IsUpstreamIPHash:      kubeNGCfg.IsUpstreamIPHash,
		IsAppActivity:         kubeNGCfg.IsAppActivity,
		OperationType:         kubeNGCfg.OperationType,
		IsK8sNotify:           kubeNGCfg.IsK8sNotify,
		LogRule:               kubeNGCfg.LogRule,
		DeleteUserCfgs:        kubeNGCfg.DeleteUserCfgs,
		IsDefaultCfg:          kubeNGCfg.IsDefaultCfg,
		AppSrcType:            kubeNGCfg.AppSrcType,
	}

	for ruleCMD, ruleParams := range kubeNGCfg.UpstreamUserRules.RulesSet {
		for _, ruleParam := range ruleParams {
			webCfg.UpstreamUserRules.UserRuleSet = append(webCfg.UpstreamUserRules.UserRuleSet,
				UserRules{
					RuleCMD:   ruleCMD,
					RuleParam: ruleParam,
				})
		}
	}

	for ruleCMD, ruleParams := range kubeNGCfg.ServerUserRules.RulesSet {
		for _, ruleParam := range ruleParams {
			webCfg.ServerUserRules.UserRuleSet = append(webCfg.ServerUserRules.UserRuleSet, UserRules{
				RuleCMD:   ruleCMD,
				RuleParam: ruleParam,
			})
		}
	}

	for ruleCMD, ruleParams := range kubeNGCfg.LocationUserRules.RulesSet {
		for _, ruleParam := range ruleParams {
			webCfg.LocationUserRules.UserRuleSet = append(webCfg.LocationUserRules.UserRuleSet, UserRules{
				RuleCMD:   ruleCMD,
				RuleParam: ruleParam,
			})
		}
	}

	return
}

//从kubeng获取nginx配置集合
func getNginxCfgsListFromKubeNG(getCfgsURL string, appSrcType string) (cfgsList []WebConfig) {
	//logdebug.Println(logdebug.LevelDebug, "URL= !", getCfgsURL)

	resp, err := communicate.SendRequestByJSON(communicate.GET, getCfgsURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	allAppsCfgs := make(map[string]map[string]KubeNGConfig, 0)
	if err = json.Unmarshal(resp, &allAppsCfgs); err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	for _, eachAppCfgs := range allAppsCfgs {
		for _, singleCfg := range eachAppCfgs {
			//遍历出最小单位的一条配置 追加至数组中 添加app来源类型字段
			singleCfg.AppSrcType = appSrcType
			webCfg := singleCfg.convertToWebCfg()
			//组织 WebConfig 结构
			cfgsList = append(cfgsList, webCfg)
		}
	}

	//logdebug.Println(logdebug.LevelDebug, "--------cfgsList = ", cfgsList)

	return
}

//get
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

//构造与kubeng通讯的信息
func buildCommunicateInfo(request *restful.Request, response *restful.Response) (nginxCfgURL string, nginxCfg KubeNGConfig) {
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

	nginxCfgURL = "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.NginxCfgsAPIServerPath + "/" + nginxCfg.AppSrcType

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

	_, err := communicate.SendRequestByJSON(communicate.PUT, appCfgURL, updateNginxCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

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

	_, err := communicate.SendRequestByJSON(communicate.DELETE, appCfgURL, delSingleNginxCfg)
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

	_, err := communicate.SendRequestByJSON(communicate.POST, appCfgURL, createNginxCfg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

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
		Reads(KubeNGConfig{})) // from the request
	//
	ws.Route(ws.PUT("/").To(svc.updateNginxCfg).
		// docs
		Doc("put nginx manager config").
		Operation("putNginxManagerConfig").
		Reads(KubeNGConfig{})) // from the request
	//
	ws.Route(ws.DELETE("/").To(svc.deleteSingleNginxCfg).
		// docs
		Doc("删除一个服务的单个Nginx配置").
		Operation("deleteSingleNginxConfig").
		Reads(KubeNGConfig{})) // from the request

	ws.Route(ws.DELETE("/all").To(svc.deleteAllNginxCfgs).
		// docs
		Doc("删除一个服务的所有Nginx配置").
		Operation("deleteAllNginxConfig"))

	ws.Route(ws.GET("/download").To(svc.nginxCfgDownload).
		Doc("download nginx config").
		Operation("downloadfile").
		Reads(WebReqMsg{}))

	restful.Add(ws)

	return
}
