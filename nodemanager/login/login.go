//Package login 用于跟KubeNg通信，将上线的节点信息保存起来用于后续操作
package login

import (
	"encoding/json"
	"github.com/emicklei/go-restful"
	"net/http"
	"ngfront/communicate"
	"ngfront/config"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	kubeNGCfg "ngfront/nodemanager/zone/clients/watcher/nginxcfg"
	"sort"
	"strconv"
	"time"
)

//RequestBody 请求报文体
type RequestBody struct {
	ClientID                  string
	NodeName                  string
	NodeIP                    string
	APIServerPort             string
	NginxCfgsAPIServerPath    string
	TestToolAPIServerPath     string
	NodeInfoAPIServerPath     string
	DownloadCfgAPIServerPath  string
	WatchManagerAPIServerPath string
	JobZoneType               string
	K8sMasterHost             string
	K8sAPIVersion             string
}

//RequestResult 回复成功与否报文原因
type RequestResult struct {
	ErrCode   int
	ResultMsg string
	ErrReason string
}

//ResponseBody 回复报文体
type ResponseBody struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	LoginStatus     int
}

//RequestMsg 回复登录信息
type RequestMsg struct {
	ReqBody   RequestBody
	RespBody  ResponseBody
	ReqResult RequestResult
}

//ServiceInfo 服务信息
type ServiceInfo struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	//xxxx            string
}

// 同步nginx配置和watcher配置时所需参数
type syncCfgInfo struct {
	nodeIP                    string
	apiServerPort             string
	nginxCfgsAPIServerPath    string
	watchManagerAPIServerPath string
	jobZoneType               string
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	svc.HeartCycle = config.NgFrontCfg.HeartCycle
	//svc.HeartServerAddr = "http://192.168.0.75:8083/ngfront/heart"
	svc.HeartServerAddr = config.NgFrontCfg.HeartServerAddr

	svc.register()

	return
}

//register 注册登录函数
func (svc *ServiceInfo) register() {
	ws := new(restful.WebService)
	ws.
		//Path("/ngfront/login").
		Path("/ngfront/login").
		Doc("nginx web configure").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML)

	ws.Route(ws.POST("/").To(svc.login).
		Doc("show nginx configure to the web").
		Operation("login").
		Reads(RequestMsg{}))

	restful.Add(ws)

	return
}

func (svc *ServiceInfo) login(request *restful.Request, response *restful.Response) {
	reqMsg := RequestMsg{}
	if err := request.ReadEntity(&reqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}

	reqMsg.RespBody = ResponseBody{
		HeartServerAddr: svc.HeartServerAddr,
		HeartCycle:      svc.HeartCycle,
		LoginStatus:     1,
	}

	reqMsg.ReqResult = RequestResult{
		ErrCode:   1,
		ResultMsg: "",
		ErrReason: "",
	}

	clientInfo := nodes.ClientInfo{
		NodeIP:                    reqMsg.ReqBody.NodeIP,
		ClientID:                  reqMsg.ReqBody.ClientID,
		NodeName:                  reqMsg.ReqBody.NodeName,
		APIServerPort:             reqMsg.ReqBody.APIServerPort,
		NginxCfgsAPIServerPath:    reqMsg.ReqBody.NginxCfgsAPIServerPath,
		TestToolAPIServerPath:     reqMsg.ReqBody.TestToolAPIServerPath,
		NodeInfoAPIServerPath:     reqMsg.ReqBody.NodeInfoAPIServerPath,
		DownloadCfgAPIServerPath:  reqMsg.ReqBody.DownloadCfgAPIServerPath,
		WatchManagerAPIServerPath: reqMsg.ReqBody.WatchManagerAPIServerPath,
		JobZoneType:               reqMsg.ReqBody.JobZoneType,
		K8sMasterHost:             reqMsg.ReqBody.K8sMasterHost,
		K8sAPIVersion:             reqMsg.ReqBody.K8sAPIVersion,
	}

	//同步监控数据信息到新的client
	syncData := syncCfgInfo{
		nodeIP:                    reqMsg.ReqBody.NodeIP,
		apiServerPort:             reqMsg.ReqBody.APIServerPort,
		nginxCfgsAPIServerPath:    reqMsg.ReqBody.NginxCfgsAPIServerPath,
		watchManagerAPIServerPath: reqMsg.ReqBody.WatchManagerAPIServerPath,
		jobZoneType:               reqMsg.ReqBody.JobZoneType,
	}
	syncCfgInfoToNewClient(syncData)

	// 将新上线的节点信息 以及 watcher 信息 保存到nodesInfo中
	nodes.AddClientData(clientInfo) //将IP+clientID 为key add进map
	watcherCfgURL := "http://" +
		reqMsg.ReqBody.NodeIP +
		reqMsg.ReqBody.APIServerPort +
		"/" +
		reqMsg.ReqBody.WatchManagerAPIServerPath

	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherCfgURL, nil)
	var watcherCfgs map[int]nodes.WatchManagerCfg
	json.Unmarshal(resp, &watcherCfgs)
	if watcherCfgs != nil {
		key := clientInfo.CreateKey()
		nodes.AddWatcherData(key, watcherCfgs)
	}

	logdebug.Println(logdebug.LevelDebug, "上线报文=", reqMsg)
	response.WriteHeaderAndJson(200, reqMsg, "application/json")

	return
}

//同步watcher配置和nginx配置给新的节点
func syncCfgInfoToNewClient(syncData syncCfgInfo) {
	//删除新上线的client信息的watcher信息 ---> 获取watcherID ---> 删除对应监控信息
	newClientWatcherURL := "http://" +
		syncData.nodeIP +
		syncData.apiServerPort +
		"/" +
		syncData.watchManagerAPIServerPath

	newWatcherInfo := map[int]nodes.WatchManagerCfg{}

	resp, _ := communicate.SendRequestByJSON(communicate.GET, newClientWatcherURL, nil)
	json.Unmarshal(resp, &newWatcherInfo)

	allNodesInfo := nodes.GetAllNodesInfo()
	//如果集群中没有节点信息 则添加 不删除
	if 0 != len(allNodesInfo) {
		for _, singleNodeInfo := range allNodesInfo {
			if singleNodeInfo.Client.JobZoneType == syncData.jobZoneType {
				for watcherID := range newWatcherInfo {
					newClientSingleWatcherURL := newClientWatcherURL + "/" + strconv.Itoa(watcherID)
					communicate.SendRequestByJSON(communicate.DELETE, newClientSingleWatcherURL, nil)
					logdebug.Println(logdebug.LevelDebug, "删除新上线节点的之前信息")
				}
				break
			}
		}
	}
	// 判断区域 从旧的NodesInfo中选区域相同的任一client信息上的watcher信息同步给新上线的client
	// 判断区域 从旧的NodesInfo中选区域相同的任一client信息上的nginx信息同步给新上线的client
	for _, nodeInfo := range allNodesInfo {
		if nodeInfo.Client.JobZoneType != syncData.jobZoneType {
			continue
		}
		logdebug.Println(logdebug.LevelDebug, "新上线节点 watcher URL", newClientWatcherURL)
		//同步watcher配置
		addWatchersToNewClient(nodeInfo, syncData.jobZoneType, newClientWatcherURL)
		//同步nginx配置
		syncNginxCfg(nodeInfo, syncData)

		break
	}

}

// 同步nginx配置
func syncNginxCfg(nodeInfo nodes.NodeInfo, syncData syncCfgInfo) {

	var allK8sNginxCfgs map[string]map[string]kubeNGCfg.KubeNGConfig

	allK8sNginxCfgsURL := "http://" +
		nodeInfo.Client.NodeIP +
		nodeInfo.Client.APIServerPort +
		"/" +
		nodeInfo.Client.NginxCfgsAPIServerPath +
		"/k8s"
	logdebug.Println(logdebug.LevelDebug, "同步nginx操作时 获取同一区域下任一旧节点上所有的k8s服务URL", allK8sNginxCfgsURL)

	resp, _ := communicate.SendRequestByJSON(communicate.GET, allK8sNginxCfgsURL, nil)
	json.Unmarshal(resp, &allK8sNginxCfgs)

	logdebug.Println(logdebug.LevelDebug, "所有的k8s服务", allK8sNginxCfgs)

	for _, nginxCfgMap := range allK8sNginxCfgs {
		//更新新上线节点的nginx配置信息
		updateNginxcfgToNewclient(nginxCfgMap, syncData)
	}
}

//更新nginx配置到新上线节点
func updateNginxcfgToNewclient(nginxCfgMap map[string]kubeNGCfg.KubeNGConfig, syncData syncCfgInfo) {

	for _, nginxCfg := range nginxCfgMap {

		//只同步被个性化配置过的nginx配置
		if nginxCfg.IsDefaultCfg == false {
			//更新 新上线的节点上的nginx配置
			nginxCfgURL := "http://" +
				syncData.nodeIP +
				syncData.apiServerPort +
				"/" +
				syncData.nginxCfgsAPIServerPath +
				"/" +
				//					nginxCfg.AppSrcType
				"k8s"

			appCfgURL := nginxCfgURL +
				"/" +
				nginxCfg.Namespace +
				"-" +
				nginxCfg.AppName +
				"/" +
				nginxCfg.ServerName +
				":" +
				nginxCfg.ListenPort
				//http://192.168.85.130:7777/nginxcfgs/k8s/clyxys-usertoolvass/clyxys.yz.local:80
			logdebug.Println(logdebug.LevelDebug, "同步nginx配置给新上线的节点时的URL", appCfgURL)

			_, err := communicate.SendRequestByJSON(communicate.PUT, appCfgURL, nginxCfg)
			if err != nil {
				logdebug.Println(logdebug.LevelDebug, err)

				return
			}
		}
	}
}

// 同步监控信息到新节点
func addWatchersToNewClient(nodeInfo nodes.NodeInfo, jobZoneType, newWatcherInfoURL string) {
	keyForMap := make([]int, 0)

	getOldWatcherInfoURL := "http://" +
		nodeInfo.Client.NodeIP +
		nodeInfo.Client.APIServerPort +
		"/" +
		nodeInfo.Client.WatchManagerAPIServerPath

	syncWatcherInfo := map[int]nodes.WatchManagerCfg{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, getOldWatcherInfoURL, nil)
	json.Unmarshal(resp, &syncWatcherInfo)
	//获取map的key值
	for key := range syncWatcherInfo {
		keyForMap = append(keyForMap, key)
	}

	// 排序map的key值  同步时因map无序 导致节点之间的配置信息所对应的watcherID 不一致，因此需事先固定好顺序
	sort.Ints(keyForMap)
	logdebug.Println(logdebug.LevelDebug, "排序后的watcherID", keyForMap)

	for _, key := range keyForMap {
		logdebug.Println(logdebug.LevelDebug, "同步增加时的URL:", newWatcherInfoURL, key)

		communicate.SendRequestByJSON(communicate.POST, newWatcherInfoURL, syncWatcherInfo[key])
	}
}
