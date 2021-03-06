package nginxcfg

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/emicklei/go-restful"

	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
)

//CompareResponse 前端界面对比接口返回消息结构
type CompareResponse struct {
	Result   bool
	ErrorMsg string
}

func deepCompareContent(cfgA, cfgB KubeNGConfig) (bool, string) {
	errMsg := ""

	if cfgA.RealServerPath != cfgB.RealServerPath {
		errMsg = fmt.Sprintf(`RealServerPath不一致:%s<====>%s`, cfgA.RealServerPath, cfgB.RealServerPath)

		return false, errMsg
	}

	if cfgA.Location != cfgB.Location {
		errMsg = fmt.Sprintf(`Location不一致:%s<====>%s`, cfgA.Location, cfgB.Location)

		return false, errMsg
	}

	if cfgA.ProxyRedirectSrcPath != cfgB.ProxyRedirectSrcPath {
		errMsg = fmt.Sprintf(`ProxyRedirectSrcPath不一致:%s<====>%s`, cfgA.ProxyRedirectSrcPath, cfgB.ProxyRedirectSrcPath)

		return false, errMsg
	}

	if cfgA.ProxyRedirectDestPath != cfgB.ProxyRedirectDestPath {
		errMsg = fmt.Sprintf(`ProxyRedirectDestPath不一致:%s<====>%s`, cfgA.ProxyRedirectDestPath, cfgB.ProxyRedirectDestPath)

		return false, errMsg
	}

	if len(cfgA.UpstreamIPs) != len(cfgB.UpstreamIPs) {
		errMsg = fmt.Sprintf(`[服务%s] UpstreamIPs列表内IP个数不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamIPs, cfgB.UpstreamIPs)

		return false, errMsg
	}

	for k, upstreamIP := range cfgA.UpstreamIPs {
		if cfgB.UpstreamIPs[k] != upstreamIP {
			errMsg = fmt.Sprintf(`[服务%s] UpstreamIPs列表内IP不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamIPs, cfgB.UpstreamIPs)

			return false, errMsg
		}
	}

	if cfgA.UpstreamPort != cfgB.UpstreamPort {
		errMsg = fmt.Sprintf(`[服务%s] UpstreamPort不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamPort, cfgB.UpstreamPort)

		return false, errMsg
	}

	if cfgA.IsUpstreamIPHash != cfgB.IsUpstreamIPHash {
		errMsg = fmt.Sprintf(`[服务%s] IsUpstreamIPHash不一致:%s<====>%s`, cfgA.AppName, cfgA.IsUpstreamIPHash, cfgB.IsUpstreamIPHash)

		return false, errMsg
	}

	if len(cfgA.UpstreamUserRules.RulesSet) != len(cfgB.UpstreamUserRules.RulesSet) {
		errMsg = fmt.Sprintf(`[服务%s] UpstreamUserRules规则个数不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamUserRules, cfgB.UpstreamUserRules)

		return false, errMsg
	}

	for rule, params := range cfgA.UpstreamUserRules.RulesSet {
		if len(params) != len(cfgB.UpstreamUserRules.RulesSet[rule]) {
			errMsg = fmt.Sprintf(`[服务%s] UpstreamUserRules规则参数个数不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamUserRules, cfgB.UpstreamUserRules)

			return false, errMsg
		}

		for k, param := range params {
			if param != cfgB.UpstreamUserRules.RulesSet[rule][k] {
				errMsg = fmt.Sprintf(`[服务%s] UpstreamUserRules规则参数内容不一致:%s<====>%s`, cfgA.AppName, cfgA.UpstreamUserRules, cfgB.UpstreamUserRules)

				return false, errMsg
			}
		}
	}

	if len(cfgA.ServerUserRules.RulesSet) != len(cfgB.ServerUserRules.RulesSet) {
		errMsg = fmt.Sprintf(`[服务%s] ServerUserRules规则个数不一致:%s<====>%s`, cfgA.AppName, cfgA.ServerUserRules, cfgB.ServerUserRules)

		return false, errMsg
	}

	for rule, params := range cfgA.ServerUserRules.RulesSet {
		if len(params) != len(cfgB.ServerUserRules.RulesSet[rule]) {
			errMsg = fmt.Sprintf(`[服务%s] ServerUserRules规则参数个数不一致:%s<====>%s`, cfgA.AppName, cfgA.ServerUserRules, cfgB.ServerUserRules)

			return false, errMsg
		}

		for k, param := range params {
			if param != cfgB.ServerUserRules.RulesSet[rule][k] {
				errMsg = fmt.Sprintf(`[服务%s] ServerUserRules规则参数内容不一致:%s<====>%s`, cfgA.AppName, cfgA.ServerUserRules, cfgB.ServerUserRules)

				return false, errMsg
			}
		}
	}

	if len(cfgA.LocationUserRules.RulesSet) != len(cfgB.LocationUserRules.RulesSet) {
		errMsg = fmt.Sprintf(`[服务%s] LocationUserRules规则个数不一致:%s<====>%s`, cfgA.AppName, cfgA.LocationUserRules, cfgB.LocationUserRules)

		return false, errMsg
	}

	for rule, params := range cfgA.LocationUserRules.RulesSet {
		if len(params) != len(cfgB.LocationUserRules.RulesSet[rule]) {
			errMsg = fmt.Sprintf(`[服务%s] LocationUserRules规则参数个数不一致:%s<====>%s`, cfgA.AppName, cfgA.LocationUserRules, cfgB.LocationUserRules)

			return false, errMsg
		}

		for k, param := range params {
			if param != cfgB.LocationUserRules.RulesSet[rule][k] {
				errMsg = fmt.Sprintf(`[服务%s] LocationUserRules规则参数内容不一致:%s<====>%s`, cfgA.AppName, cfgA.LocationUserRules, cfgB.LocationUserRules)

				return false, errMsg
			}
		}
	}

	//if cfgA.LogRule.LogFileDirPath != cfgB.LogRule.LogFileDirPath {
	//	errMsg = fmt.Sprintf(`LogRule规则不一致:%s<====>%s`, cfgA.LogRule, cfgB.LogRule)
	//
	//	return false, errMsg
	//}

	if cfgA.LogRule.LogRuleName != cfgB.LogRule.LogRuleName {
		errMsg = fmt.Sprintf(`LogRule规则不一致:%s<====>%s`, cfgA.LogRule, cfgB.LogRule)

		return false, errMsg
	}

	if cfgA.LogRule.LogTemplateName != cfgB.LogRule.LogTemplateName {
		errMsg = fmt.Sprintf(`LogRule规则不一致:%s<====>%s`, cfgA.LogRule, cfgB.LogRule)

		return false, errMsg
	}

	if cfgA.DeleteUserCfgs != cfgB.DeleteUserCfgs {
		errMsg = fmt.Sprintf(`[服务%s] 是否删除个性化配置规则不一致:%s<====>%s`, cfgA.AppName, cfgA.DeleteUserCfgs, cfgB.DeleteUserCfgs)

		return false, errMsg
	}

	return true, ""
}

func deepCompareIPServerType(
	appAllCfgsA,
	appAllCfgsB map[string]KubeNGConfig,
	clientBNodeIP,
	clientBListenPort,
	appKey string,
) (bool, string) {

	errMsg := ""
	result := true

	//配置个数一致 比较内容s
	for _, appCfg := range appAllCfgsA {
		clientBAppServerKey := appKey + "-" + clientBNodeIP + ":" + clientBListenPort
		if _, ok := appAllCfgsB[clientBAppServerKey]; !ok {
			errMsg = fmt.Sprintf(`配置B中没有appServerKey=%s`, clientBAppServerKey)

			return false, errMsg
		}

		//appServer表项都有值 比较内容
		result, errMsg = deepCompareContent(appCfg, appAllCfgsB[clientBAppServerKey])
		if result != true {
			return false, errMsg
		}
	}

	return true, ""
}

func deepCompare(
	appAllCfgsA,
	appAllCfgsB map[string]KubeNGConfig,
	clientBNodeIP,
	clientBListenPort,
	clientAWatcherServerType,
	clientBWatcherServerType,
	appKey string,
) (bool, string) {
	errMsg := ""
	result := true

	if len(appAllCfgsA) != len(appAllCfgsB) {
		return false, "同一app的配置个数不一致"
	}

	if clientAWatcherServerType != clientBWatcherServerType {
		return false, "2个wathcer代理方式不一致"
	}

	if clientAWatcherServerType == "ip" {
		return deepCompareIPServerType(appAllCfgsA, appAllCfgsB, clientBNodeIP, clientBListenPort, appKey)
	}

	//配置个数一致 比较内容s
	for appServerKey, appCfg := range appAllCfgsA {
		if _, ok := appAllCfgsB[appServerKey]; !ok {
			errMsg = fmt.Sprintf(`配置B中没有appServerKey=%s`, appServerKey)

			return false, errMsg
		}

		//appServer表项都有值 比较内容
		result, errMsg = deepCompareContent(appCfg, appAllCfgsB[appServerKey])
		if result != true {
			return false, errMsg
		}
	}

	return true, ""
}

func compareContent(clientA,
	clientB map[string]map[string]KubeNGConfig,
	clientBNodeIP,
	clientBListenPort,
	clientAWatcherServerType,
	clientBWatcherServerType string,
) (bool, string) {
	errMsg := ""
	result := true

	if len(clientA) != len(clientB) {
		return false, "两套配置app个数不一致"
	}

	//首先比较appKey = 租户名+服务名,
	//在appKey个数一致的前提下 遍历A 如果B中都有 则进行下一步深度比较 反之结束比较
	for appKey, appAllCfgs := range clientA {
		if _, ok := clientB[appKey]; !ok {
			errMsg = fmt.Sprintf(`配置B中没有appKey=%s`, appKey)

			return false, errMsg
		}
		//appKey表项都有值 则比较appServerKey
		result, errMsg = deepCompare(
			appAllCfgs,
			clientB[appKey],
			clientBNodeIP,
			clientBListenPort,
			clientAWatcherServerType,
			clientBWatcherServerType,
			appKey,
		)
		if result != true {
			return false, errMsg
		}

	}

	//appKey表项相同 则比较appServerKey

	return true, errMsg
}

func getClientWatcherNginxInfo(clientInfo nodes.ClientInfo, watcherID string) (string, string) {
	watcher := nodes.WatchManagerCfg{}

	getWatcherURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.WatchManagerAPIServerPath +
		"/" +
		watcherID

	resp, _ := communicate.SendRequestByJSON(communicate.GET, getWatcherURL, nil)

	json.Unmarshal(resp, &watcher)

	logdebug.Println(logdebug.LevelDebug, "----从kubeng获取watcher信息-----", watcher)

	return watcher.DefaultNginxServerType, watcher.NginxListenPort
}

func getNginxCfgByWatcherURL(clientsSet []string, watcherID string, request *restful.Request) (
	clientAURL string,
	clientBURL string,
	clientBNodeIP string,
	clientBListenPort string,
	clientAWatcherServerType string,
	clientBWatcherServerType string,
) {

	request.Request.ParseForm()
	clientA := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPA"),
		ClientID: clientsSet[0],
	}

	appSrcType := request.Request.Form.Get("AppSrcType")

	key := clientA.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	clientAURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		appSrcType +
		"/watchers/" +
		watcherID

	clientAWatcherServerType, _ = getClientWatcherNginxInfo(clientInfo, watcherID)

	logdebug.Println(logdebug.LevelDebug, "the URL of getting ClientA config from kubeng is:", clientAURL)

	clientB := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPB"),
		ClientID: clientsSet[1],
	}

	key = clientB.CreateKey()
	clientInfo = nodes.GetClientInfo(key)
	clientBNodeIP = clientInfo.NodeName

	clientBURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.NginxCfgsAPIServerPath +
		"/" +
		appSrcType +
		"/watchers/" +
		watcherID

	logdebug.Println(logdebug.LevelDebug, "the URL of getting ClientB config from kubeng is:", clientBURL)

	clientBWatcherServerType, clientBListenPort = getClientWatcherNginxInfo(clientInfo, watcherID)

	return
}

func getAllWatcherURL(clientsSet []string, request *restful.Request, response *restful.Response) (clientAURL string, clientBURL string) {
	request.Request.ParseForm()
	clientA := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPA"),
		ClientID: clientsSet[0],
	}

	key := clientA.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	clientAURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.WatchManagerAPIServerPath

	logdebug.Println(logdebug.LevelDebug, "the URL of getting clientA config is :", clientAURL)

	clientB := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIPB"),
		ClientID: clientsSet[1],
	}

	key = clientB.CreateKey()
	clientInfo = nodes.GetClientInfo(key)

	clientBURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.WatchManagerAPIServerPath

	logdebug.Println(logdebug.LevelDebug, "the URL of getting clientB config is:", clientBURL)

	return
}

func (svc *ServiceInfo) compareAllWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "the clientIDSet which were compared: ", clientsSet)

	clienAGetAllWatcherURL, clienBGetAllWatcherURL := getAllWatcherURL(clientsSet, request, response)

	respA, errA := communicate.SendRequestByJSON(communicate.GET, clienAGetAllWatcherURL, nil)
	if errA != nil {
		response.WriteError(http.StatusInternalServerError, errA)

		return
	}

	clientAWatchers := make(map[string]nodes.WatchManagerCfg, 0)
	json.Unmarshal(respA, &clientAWatchers)

	respB, errB := communicate.SendRequestByJSON(communicate.GET, clienBGetAllWatcherURL, nil)
	if errB != nil {
		response.WriteError(http.StatusInternalServerError, errB)

		return
	}
	clientBWatchers := make(map[string]nodes.WatchManagerCfg, 0)
	json.Unmarshal(respB, &clientBWatchers)

	responseMsg := CompareResponse{
		Result:   true,
		ErrorMsg: "",
	}

	if len(clientAWatchers) != len(clientAWatchers) {
		responseMsg.Result = false
		responseMsg.ErrorMsg = "2个client的watcher数量不一致"

		response.WriteHeaderAndJson(200, responseMsg, "application/json")

		return
	}

	for watcherID := range clientAWatchers {
		clientANginxCfgURL, clientBNginxCfgURL, clientBNodeIP, clientBListenPort, clientAWatcherServerType, clientBWatcherServerType := getNginxCfgByWatcherURL(clientsSet, watcherID, request)

		respA, _ := communicate.SendRequestByJSON(communicate.GET, clientANginxCfgURL, nil)
		clientAMap := make(map[string]map[string]KubeNGConfig, 0)
		json.Unmarshal(respA, &clientAMap)

		respB, _ := communicate.SendRequestByJSON(communicate.GET, clientBNginxCfgURL, nil)
		clientBMap := make(map[string]map[string]KubeNGConfig, 0)
		json.Unmarshal(respB, &clientBMap)

		newErrMsg := ""
		errMsg := ""
		responseMsg.Result, errMsg = compareContent(clientAMap, clientBMap, clientBNodeIP, clientBListenPort, clientAWatcherServerType, clientBWatcherServerType)
		if responseMsg.Result != true {
			//responseMsg.ErrorMsg = responseMsg.ErrorMsg + "[watcherID] = " + watcherID + "\n"
			newErrMsg = newErrMsg + "[watcherID] = " + watcherID + "配置不一致 \n "
			responseMsg.ErrorMsg += newErrMsg
			logdebug.Println(logdebug.LevelError, errMsg)
			//break
		}
	}

	if responseMsg.ErrorMsg != "" {
		responseMsg.Result = false
	}

	logdebug.Println(logdebug.LevelDebug, "end of comparing", responseMsg.ErrorMsg)

	response.WriteHeaderAndJson(200, responseMsg, "application/json")

	return
}

func (svc *ServiceInfo) compareSingleWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "the clientIDSet which were compared: ", clientsSet)

	watcherID := request.PathParameter("watcherID")

	logdebug.Println(logdebug.LevelDebug, "the clientID which were compared: ", watcherID)

	clientANginxCfgURL, clientBNginxCfgURL, clientBNodeIP, clientBListenPort, clientAWatcherServerType, clientBWatcherServerType := getNginxCfgByWatcherURL(clientsSet, watcherID, request)

	respA, errA := communicate.SendRequestByJSON(communicate.GET, clientANginxCfgURL, nil)
	if errA != nil {
		response.WriteError(http.StatusInternalServerError, errA)

		return
	}

	clientAMap := make(map[string]map[string]KubeNGConfig, 0)
	json.Unmarshal(respA, &clientAMap)

	respB, errB := communicate.SendRequestByJSON(communicate.GET, clientBNginxCfgURL, nil)
	if errB != nil {
		response.WriteError(http.StatusInternalServerError, errB)

		return
	}

	clientBMap := make(map[string]map[string]KubeNGConfig, 0)
	json.Unmarshal(respB, &clientBMap)

	responseMsg := CompareResponse{
		Result:   true,
		ErrorMsg: "",
	}

	responseMsg.Result, responseMsg.ErrorMsg = compareContent(clientAMap, clientBMap, clientBNodeIP, clientBListenPort, clientAWatcherServerType, clientBWatcherServerType)

	response.WriteHeaderAndJson(200, responseMsg, "application/json")

	return
}
