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

func compareContent(clientA, clientB map[string]map[string]KubeNGConfig) bool {
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
