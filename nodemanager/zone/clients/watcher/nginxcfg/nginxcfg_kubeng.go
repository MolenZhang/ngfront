package nginxcfg

import (
	"encoding/json"
	"github.com/emicklei/go-restful"

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
	UpstreamUserText      []string              //保留字段 用于用户自定义nginx规则
	ServerUserText        []string              //保留字段 用于用户自定义nginx规则
	LocationUserText      []string              //保留字段 用于用户自定义nginx规则
	AccessServerName      string
}

//构造与kubeng通讯的信息
func buildCommunicateInfo(request *restful.Request, response *restful.Response) (nginxCfgURL string, nginxCfg WebConfig) {
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

//解析kubeNG的回复
func parseRespFromKubeNG(recvData []byte) ResponseBody {
	var respMsg ResponseBody

	json.Unmarshal(recvData, &respMsg)

	respMsg.WebCfg = respMsg.NginxConf.convertToWebCfg()

	logdebug.Println(logdebug.LevelDebug, "the message which recieved is:", respMsg)

	return respMsg
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
		UpstreamUserText:      kubeNGCfg.UpstreamUserText,
		ServerUserText:        kubeNGCfg.ServerUserText,
		LocationUserText:      kubeNGCfg.LocationUserText,
	}

	if kubeNGCfg.AccessServerName != "" {
		webCfg.ServerName = kubeNGCfg.AccessServerName
	}

	for ruleCMD, ruleParams := range kubeNGCfg.UpstreamUserRules.RulesSet {
		for _, ruleParam := range ruleParams {
			webCfg.UpstreamUserRules.UserRuleSet = append(webCfg.UpstreamUserRules.UserRuleSet, UserRules{
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
