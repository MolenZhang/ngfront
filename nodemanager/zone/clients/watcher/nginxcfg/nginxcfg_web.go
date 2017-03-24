package nginxcfg

//"encoding/json"
//"html/template"
//"net/http"
//"ngfront/communicate"
//"ngfront/logdebug"
//"ngfront/nodemanager/nodes"

//"github.com/emicklei/go-restful"

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

func addCMDToList(rulesCMDList []string, ruleCMD string) []string {
	for _, alreadyExistedRuleCMD := range rulesCMDList {
		if alreadyExistedRuleCMD == ruleCMD {
			return rulesCMDList
		}
	}

	rulesCMDList = append(rulesCMDList, ruleCMD)

	return rulesCMDList
}

//将从js拿到的数据提取 转换成kubeng所需的数据结构
func (webCfg *WebConfig) convertToKubeNGCfg() (kubeNGCfg KubeNGConfig) {
	kubeNGCfg = KubeNGConfig{
		ServerName:            webCfg.ServerName,
		ListenPort:            webCfg.ListenPort,
		RealServerPath:        webCfg.RealServerPath,
		Namespace:             webCfg.Namespace,
		AppName:               webCfg.AppName,
		Location:              webCfg.Location,
		ProxyRedirectSrcPath:  webCfg.ProxyRedirectSrcPath,
		ProxyRedirectDestPath: webCfg.ProxyRedirectDestPath,
		//UpstreamIPs:           webCfg.UpstreamIPs,
		//UpstreamPort:          webCfg.UpstreamPort,
		IsUpstreamIPHash: webCfg.IsUpstreamIPHash,
		//IsAppActivity:         webCfg.IsAppActivity,
		OperationType: webCfg.OperationType,
		//IsK8sNotify:           webCfg.IsK8sNotify,
		LogRule:        webCfg.LogRule,
		DeleteUserCfgs: webCfg.DeleteUserCfgs,
		IsDefaultCfg:   webCfg.IsDefaultCfg,
		AppSrcType:     webCfg.AppSrcType,
	}

	kubeNGCfg.UpstreamUserRules.RulesSet = make(map[string][]string, 0)

	for _, userRules := range webCfg.UpstreamUserRules.UserRuleSet {
		kubeNGCfg.UpstreamUserRules.RulesSet[userRules.RuleCMD] = append(kubeNGCfg.UpstreamUserRules.RulesSet[userRules.RuleCMD], userRules.RuleParam)
	}

	kubeNGCfg.ServerUserRules.RulesSet = make(map[string][]string, 0)
	for _, userRules := range webCfg.ServerUserRules.UserRuleSet {
		kubeNGCfg.ServerUserRules.RulesSet[userRules.RuleCMD] = append(kubeNGCfg.ServerUserRules.RulesSet[userRules.RuleCMD], userRules.RuleParam)
	}

	kubeNGCfg.LocationUserRules.RulesSet = make(map[string][]string, 0)
	for _, userRules := range webCfg.LocationUserRules.UserRuleSet {
		kubeNGCfg.LocationUserRules.RulesSet[userRules.RuleCMD] = append(kubeNGCfg.LocationUserRules.RulesSet[userRules.RuleCMD], userRules.RuleParam)
	}

	return
}
