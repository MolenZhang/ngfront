package nginxcfg

import (
	//"fmt"
	"encoding/json"
	"github.com/emicklei/go-restful"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"strings"
)

func deepCompareContent(cfgA, cfgB KubeNGConfig) bool {
	if cfgA.RealServerPath != cfgB.RealServerPath {
		logdebug.Println(logdebug.LevelError, "RealServerPath不一致:", cfgA.RealServerPath, "<---->", cfgB.RealServerPath)

		return false
	}

	if cfgA.Location != cfgB.Location {
		logdebug.Println(logdebug.LevelError, "Location不一致:", cfgA.Location, "<---->", cfgB.Location)

		return false
	}

	if cfgA.ProxyRedirectSrcPath != cfgB.ProxyRedirectSrcPath {
		logdebug.Println(logdebug.LevelError, "ProxyRedirectSrcPath不一致:", cfgA.ProxyRedirectSrcPath, "<---->", cfgB.ProxyRedirectSrcPath)

		return false
	}

	if cfgA.ProxyRedirectDestPath != cfgB.ProxyRedirectDestPath {
		logdebug.Println(logdebug.LevelError, "ProxyRedirectDestPath不一致:", cfgA.ProxyRedirectDestPath, "<---->", cfgB.ProxyRedirectDestPath)

		return false
	}

	if len(cfgA.UpstreamIPs) != len(cfgB.UpstreamIPs) {
		logdebug.Println(logdebug.LevelError, "UpstreamIPs列表内IP个数不一致:", cfgA.UpstreamIPs, "<---->", cfgB.UpstreamIPs)

		return false
	}

	for k, upstreamIP := range cfgA.UpstreamIPs {
		if cfgB.UpstreamIPs[k] != upstreamIP {
			logdebug.Println(logdebug.LevelError, "UpstreamIPs列表内IP不一致:", cfgA.UpstreamIPs, "<---->", cfgB.UpstreamIPs)

			return false
		}
	}

	if cfgA.UpstreamPort != cfgB.UpstreamPort {
		logdebug.Println(logdebug.LevelError, "UpstreamPort不一致:", cfgA.UpstreamPort, "<---->", cfgB.UpstreamPort)

		return false
	}

	if cfgA.IsUpstreamIPHash != cfgB.IsUpstreamIPHash {
		logdebug.Println(logdebug.LevelError, "IsUpstreamIPHash不一致:", cfgA.IsUpstreamIPHash, "<---->", cfgB.IsUpstreamIPHash)

		return false
	}

	if len(cfgA.UpstreamUserRules.RulesSet) != len(cfgB.UpstreamUserRules.RulesSet) {
		logdebug.Println(logdebug.LevelError, "UpstreamUserRules规则个数不一致:", cfgA.UpstreamUserRules, "<---->", cfgB.UpstreamUserRules)

		return false
	}

	for rule, params := range cfgA.UpstreamUserRules.RulesSet {
		if len(params) != len(cfgB.UpstreamUserRules.RulesSet[rule]) {
			logdebug.Println(logdebug.LevelError, "UpstreamUserRules规则参数个数不一致:", cfgA.UpstreamUserRules, "<---->", cfgB.UpstreamUserRules)

			return false
		}

		for k, param := range params {
			if param != cfgB.UpstreamUserRules.RulesSet[rule][k] {
				logdebug.Println(logdebug.LevelError, "UpstreamUserRules规则参数内容不一致:", cfgA.UpstreamUserRules, "<---->", cfgB.UpstreamUserRules)

				return false
			}
		}
	}

	if len(cfgA.ServerUserRules.RulesSet) != len(cfgB.ServerUserRules.RulesSet) {
		logdebug.Println(logdebug.LevelError, "ServerUserRules规则个数不一致:", cfgA.ServerUserRules, "<---->", cfgB.ServerUserRules)

		return false
	}

	for rule, params := range cfgA.ServerUserRules.RulesSet {
		if len(params) != len(cfgB.ServerUserRules.RulesSet[rule]) {
			logdebug.Println(logdebug.LevelError, "ServerUserRules规则参数个数不一致:", cfgA.ServerUserRules, "<---->", cfgB.ServerUserRules)

			return false
		}

		for k, param := range params {
			if param != cfgB.ServerUserRules.RulesSet[rule][k] {
				logdebug.Println(logdebug.LevelError, "ServerUserRules规则参数内容不一致:", cfgA.ServerUserRules, "<---->", cfgB.ServerUserRules)

				return false
			}
		}
	}

	if len(cfgA.LocationUserRules.RulesSet) != len(cfgB.LocationUserRules.RulesSet) {
		logdebug.Println(logdebug.LevelError, "LocationUserRules规则个数不一致:", cfgA.LocationUserRules, "<---->", cfgB.LocationUserRules)

		return false
	}

	for rule, params := range cfgA.LocationUserRules.RulesSet {
		if len(params) != len(cfgB.LocationUserRules.RulesSet[rule]) {
			logdebug.Println(logdebug.LevelError, "LocationUserRules规则参数个数不一致:", cfgA.LocationUserRules, "<---->", cfgB.LocationUserRules)

			return false
		}

		for k, param := range params {
			if param != cfgB.LocationUserRules.RulesSet[rule][k] {
				logdebug.Println(logdebug.LevelError, "LocationUserRules规则参数内容不一致:", cfgA.LocationUserRules, "<---->", cfgB.LocationUserRules)

				return false
			}
		}
	}

	if cfgA.LogRule.LogFileDirPath != cfgB.LogRule.LogFileDirPath {
		logdebug.Println(logdebug.LevelError, "LogRule规则不一致:", cfgA.LogRule, "<---->", cfgB.LogRule)

		return false
	}

	if cfgA.LogRule.LogRuleName != cfgB.LogRule.LogRuleName {
		logdebug.Println(logdebug.LevelError, "LogRule规则不一致:", cfgA.LogRule, "<---->", cfgB.LogRule)

		return false
	}

	if cfgA.LogRule.LogTemplateName != cfgB.LogRule.LogTemplateName {
		logdebug.Println(logdebug.LevelError, "LogRule规则不一致:", cfgA.LogRule, "<---->", cfgB.LogRule)

		return false
	}

	if cfgA.DeleteUserCfgs != cfgB.DeleteUserCfgs {
		logdebug.Println(logdebug.LevelError, "是否删除个性化配置规则不一致:", cfgA.DeleteUserCfgs, "<---->", cfgB.DeleteUserCfgs)

		return false
	}

	return true
}

func deepCompare(appAllCfgsA, appAllCfgsB map[string]KubeNGConfig) bool {
	if len(appAllCfgsA) != len(appAllCfgsB) {
		logdebug.Println(logdebug.LevelError, "同一app的配置个数不一致")
		return false
	}

	//配置个数一致 比较内容
	for appServerKey, appCfg := range appAllCfgsA {
		if _, ok := appAllCfgsB[appServerKey]; !ok {
			logdebug.Println(logdebug.LevelError, "配置B中没有appServerKey=", appServerKey)
			return false
		}

		//appServer表项都有值 比较内容
		if !deepCompareContent(appCfg, appAllCfgsB[appServerKey]) {
			return false
		}
	}

	return true
}

func compareContent(clientA, clientB map[string]map[string]KubeNGConfig) bool {
	if len(clientA) != len(clientB) {
		logdebug.Println(logdebug.LevelError, "两套配置app个数不一致")

		return false
	}

	//首先比较appKey = 租户名+服务名,
	//在appKey个数一致的前提下 遍历A 如果B中都有 则进行下一步深度比较 反之结束比较
	for appKey, appAllCfgs := range clientA {
		if _, ok := clientB[appKey]; !ok {
			logdebug.Println(logdebug.LevelError, "配置B中没有appKey=", appKey)
			return false
		}
		//appKey表项都有值 则比较appServerKey
		if !deepCompare(appAllCfgs, clientB[appKey]) {
			return false
		}

	}

	//appKey表项相同 则比较appServerKey

	return true
}

func (svc *ServiceInfo) compareAllWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "对比的clientID = ", clientsSet)

	return
}

func (svc *ServiceInfo) compareSingleWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "对比的clientID = ", clientsSet)

	watcherID := request.PathParameter("watcherID")

	logdebug.Println(logdebug.LevelDebug, "对比的watcherID = ", watcherID)

	clientANginxCfgURL, clientBNginxCfgURL := getNginxCfgByWatcherURL(clientsSet, watcherID, request, response)

	respA, _ := communicate.SendRequestByJSON(communicate.GET, clientANginxCfgURL, nil)
	clientAMap := make(map[string]map[string]KubeNGConfig, 0)
	json.Unmarshal(respA, &clientAMap)

	logdebug.Println(logdebug.LevelDebug, "根据watcherID获取的数据", clientAMap)

	respB, _ := communicate.SendRequestByJSON(communicate.GET, clientBNginxCfgURL, nil)
	clientBMap := make(map[string]map[string]KubeNGConfig, 0)
	json.Unmarshal(respB, &clientBMap)

	logdebug.Println(logdebug.LevelDebug, "根据watcherID获取的数据", clientBMap)

	result := compareContent(clientAMap, clientBMap)

	response.WriteHeaderAndJson(200, result, "application/json")

	return
}

func getNginxCfgByWatcherURL(clientsSet []string, watcherID string, request *restful.Request, response *restful.Response) (clientAURL string, clientBURL string) {
	request.Request.ParseForm()
	clientA := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPA"),
		ClientID: clientsSet[0],
	}

	appSrcType := request.Request.Form.Get("AppSrcType")

	key := clientA.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	clientANginxCfgURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		appSrcType +
		"/" +
		watcherID

	logdebug.Println(logdebug.LevelDebug, "从kubeng获取ClientA的配置URL=", clientANginxCfgURL)

	clientB := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPB"),
		ClientID: clientsSet[1],
	}

	key = clientB.CreateKey()
	clientInfo = nodes.GetClientInfo(key)

	clientBNginxCfgURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		appSrcType +
		"/" +
		watcherID

	logdebug.Println(logdebug.LevelDebug, "从kubeng获取ClientA的配置URL=", clientBNginxCfgURL)

	return clientANginxCfgURL, clientBNginxCfgURL
}
