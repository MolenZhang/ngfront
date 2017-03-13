package nodes

import (
	config "NgFront/startconfig"
	"fmt"
	"sync"
	"time"
)

type WatchManagerCfg struct {
	KubernetesMasterHost   string
	KubernetesAPIVersion   string
	NginxReloadCommand     string
	JobZoneType            string
	NginxListenPort        string
	WatchNamespaceSets     string
	NginxRealCfgDirPath    string
	NginxTestCfgDirPath    string
	DownloadCfgDirPath     string
	LogPrintLevel          string
	DefaultNginxServerType string
	DomainSuffix           string
	WorkMode               string
	Langurage              string
	NginxTestCommand       string
	StandbyUpstreamNodes   []string
	K8sWatcherStatus       string
}

//ClientInfo 客户端信息
type ClientInfo struct {
	NodeIP                   string
	ClientID                 string
	NodeName                 string
	APIServerPort            string
	NginxCfgsAPIServerPath   string
	TestToolAPIServerPath    string
	NodeInfoAPIServerPath    string
	DownloadCfgAPIServerPath string
	WatchManagerAPIServer    string
	JobZoneType              string
}

//NodeInfo 节点的所有信息
type NodeInfo struct {
	clientInfo   ClientInfo
	watcher      WatchManagerCfg
	timer        *time.Timer
	isTimerReset bool
}

type AllNodesInfo struct {
	allNodesInfoMap map[string]NodeInfo
	mutexLock       *sync.Mutex //只有读操作 可能不需要锁
}

var allNodesInfo AllNodesInfo

//Init 初始化NodesInfo
func Init() {
	allNodesInfo.allNodesInfoMap = make(map[string]NodeInfo, 0)
	allNodesInfo.mutexLock = new(sync.Mutex)

	return
}

//CheckClientInfo
func CheckClientInfo(client ClientInfo) bool {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	//上线存进来的clientID 还在
	if _, ok := allNodesInfo.allNodesInfoMap[client.ClientID]; ok {

		fmt.Println("------找到客户端信息 刷新定时器-----", allNodesInfo.allNodesInfoMap[client.ClientID].timer)

		//allNodesInfo.allNodesInfoMap[client.ClientID].timer.Reset(config.DefaultHeartCycle)
		//停止上一个定时器
		allNodesInfo.allNodesInfoMap[client.ClientID].timer.Stop()

		newNodeInfo := allNodesInfo.allNodesInfoMap[client.ClientID]

		//开启器新的定时器 刷新超时时间
		newNodeInfo.timer = time.AfterFunc(config.DefaultHeartTimeout*time.Second, deleteClientInfo)
		//newNodeInfo.isTimerReset = false //新定时器 没有被刷新

		allNodesInfo.allNodesInfoMap[client.ClientID] = newNodeInfo

		return true
	}

	return false
}

func deleteClientInfo() {
	fmt.Println("------心跳超时 删除客户端信息----!")

	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	//delete(allNodesInfo.allNodesInfoMap, )

	return
}

//AddClientData 添加一个客户端信息进NodesInfo
func AddClientData(client ClientInfo) {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	//ADD操作key = ClientID value = clientInfo
	newNodeInfo := allNodesInfo.allNodesInfoMap[client.ClientID]

	newNodeInfo.clientInfo = client

	newNodeInfo.timer = time.AfterFunc(config.DefaultHeartTimeout*time.Second, deleteClientInfo)
	//newNodeInfo.isTimerReset = false //新定时器 没有被刷新

	allNodesInfo.allNodesInfoMap[client.ClientID] = newNodeInfo

	fmt.Println("------添加客户端信息 开启定时器-----", newNodeInfo.timer)

	//timer.Create()

	return
}
