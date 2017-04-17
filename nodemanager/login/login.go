package login

import (
	"encoding/json"
	"github.com/emicklei/go-restful"
	"io/ioutil"
	"net/http"
	"ngfront/communicate"
	"ngfront/config"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
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
	syncWatcherCfgInfo(reqMsg.ReqBody.NodeIP, reqMsg.ReqBody.APIServerPort, reqMsg.ReqBody.WatchManagerAPIServerPath, reqMsg.ReqBody.JobZoneType)

	// 将新上线的节点信息 以及 watcher 信息 保存到nodesInfo中
	nodes.AddClientData(clientInfo) //将IP+clientID 为key add进map
	url := "http://" + reqMsg.ReqBody.NodeIP + reqMsg.ReqBody.APIServerPort + "/" + reqMsg.ReqBody.WatchManagerAPIServerPath
	watcherCfgs := getWatcherCfgs(url)
	if watcherCfgs != nil {
		key := clientInfo.CreateKey()
		nodes.AddWatcherData(key, watcherCfgs)
	}
	// http GET---->AddWatcherData(clientInfo.CreateKey(), Value....) 存

	logdebug.Println(logdebug.LevelDebug, "上线报文=", reqMsg)
	response.WriteHeaderAndJson(200, reqMsg, "application/json")

	return
}

func syncWatcherCfgInfo(nodeIP, apiServerPort, watchManagerAPIServerPath, jobZoneType string) {
	//删除新上线的client信息的watcher信息 ---> 获取watcherID ---> 删除对应监控信息
	newClientWatcherURL := "http://" + nodeIP + apiServerPort + "/" + watchManagerAPIServerPath
	newWatcherInfo := map[int]nodes.WatchManagerCfg{}

	resp, _ := communicate.SendRequestByJSON(communicate.GET, newClientWatcherURL, nil)
	json.Unmarshal(resp, &newWatcherInfo)

	allNodesInfo := nodes.GetAllNodesInfo()
	//如果集群中没有节点信息 则添加 不删除
	if 0 != len(allNodesInfo) {
		for _, singleNodeInfo := range allNodesInfo {
			if singleNodeInfo.Client.JobZoneType == jobZoneType {
				for watcherID := range newWatcherInfo {
					newClientSingleWatcherURL := newClientWatcherURL + "/" + strconv.Itoa(watcherID)
					communicate.SendRequestByJSON(communicate.DELETE, newClientSingleWatcherURL, nil)
				}
				break
			}
		}
	}
	// 判断区域 从旧的NodesInfo中选区域相同的任一client信息上的watcher信息同步给新上线的client
	for _, nodeInfo := range nodes.GetAllNodesInfo() {

		addWatchersToNewClient(nodeInfo, jobZoneType, newClientWatcherURL)
		break
	}
}

func addWatchersToNewClient(nodeInfo nodes.NodeInfo, jobZoneType, newWatcherInfoURL string) {
	keyForMap := make([]int, 0)

	if nodeInfo.Client.JobZoneType != jobZoneType {
		return
	}

	getOldWatcherInfoURL := "http://" +
		nodeInfo.Client.NodeIP +
		nodeInfo.Client.APIServerPort +
		"/" +
		nodeInfo.Client.WatchManagerAPIServerPath

	syncWatcherInfo := map[int]nodes.WatchManagerCfg{}
	resp, _ := communicate.SendRequestByJSON(communicate.GET, getOldWatcherInfoURL, nil)
	json.Unmarshal(resp, &syncWatcherInfo)
	//获取map的key值
	for key, _ := range syncWatcherInfo {
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

func getWatcherCfgs(url string) map[int]nodes.WatchManagerCfg {
	//logdebug.Println(logdebug.LevelInfo,"-----请求watcher 数据 url=", url)

	resp, err := http.Get(url)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return nil
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return nil
	}

	watcherCfgs := nodes.WatchManagerCfgs
	json.Unmarshal(body, &watcherCfgs)

	return watcherCfgs
}
