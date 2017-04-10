package nodes

//关于Node的所有信息以及数据结构都在此保存 操作
//一个Node上 可以有多个kubeng 一个kubeng由client信息和watcherManagerCfg以及NginxCfg信息3个成员构成 目前仅实现了2个成员

import (
	//"fmt"
	//"log"
	"ngfront/config"
	"ngfront/logdebug"
	"sync"
	"time"
)

//WatchManagerCfg 监视器配置(kubeng 的一个功能 就是监视k8s)
type WatchManagerCfg struct {
	KubernetesMasterHost   string
	KubernetesAPIVersion   string
	NginxReloadCommand     string
	JobZoneType            string
	NginxListenPort        string
	WatchNamespaceSets     []string
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
	WatcherID              int
}

var WatchManagerCfgs map[int]WatchManagerCfg

//ClientInfo 客户端信息(kubeng名义上是ngfront的客户端 实际上它提供了多个APIServer)
type ClientInfo struct {
	NodeIP                    string
	ClientID                  string
	NodeName                  string
	APIServerPort             string
	NginxCfgsAPIServerPath    string
	TestToolAPIServerPath     string
	NodeInfoAPIServerPath     string
	DownloadCfgAPIServerPath  string
	WatchManagerAPIServerPath string
	JobZoneType               string
	K8sMasterHost             string
	K8sAPIVersion             string
	//k8s api version and master
}

//NodeInfo 单个节点的所有信息
type NodeInfo struct {
	Client  ClientInfo
	Watcher map[int]WatchManagerCfg
	timer   *time.Timer
}

//AllNodesInfo 所有节点信息
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

//CreateKey 构造key
func (client *ClientInfo) CreateKey() string {
	return client.NodeIP + "-" + client.ClientID
}

//CheckClientInfo 检查客户端信息是否被删除
func CheckClientInfo(client ClientInfo) bool {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	key := client.CreateKey()

	//上线存进来的clientID 不存在 校验失败
	if _, ok := allNodesInfo.allNodesInfoMap[key]; !ok {
		return false
	}

	//停止上一个定时器
	allNodesInfo.allNodesInfoMap[key].timer.Stop()

	currentNodeInfo := allNodesInfo.allNodesInfoMap[key]
	//开启器新的定时器 刷新超时时间
	currentNodeInfo.timer = time.AfterFunc(config.DefaultHeartTimeout*time.Second, func() {
		allNodesInfo.mutexLock.Lock()

		defer allNodesInfo.mutexLock.Unlock()

		delete(allNodesInfo.allNodesInfoMap, key)

		logdebug.Println(logdebug.LevelInfo, "------心跳超时 删除客户端信息----key !", key)

		return
	})

	allNodesInfo.allNodesInfoMap[key] = currentNodeInfo

	return true
}

//AddClientData 添加一个客户端信息进NodesInfo
func AddClientData(client ClientInfo) {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	key := client.CreateKey()

	//ADD操作key = ClientID value = clientInfo
	newNodeInfo := allNodesInfo.allNodesInfoMap[key]

	newNodeInfo.Client = client

	newNodeInfo.timer = time.AfterFunc(config.DefaultHeartTimeout*time.Second, func() {

		allNodesInfo.mutexLock.Lock()

		defer allNodesInfo.mutexLock.Unlock()

		delete(allNodesInfo.allNodesInfoMap, key)

		logdebug.Println(logdebug.LevelInfo, "------心跳超时 删除客户端信息----key =!", key)

		return
	})
	//newNodeInfo.isTimerReset = false //新定时器 没有被刷新

	allNodesInfo.allNodesInfoMap[key] = newNodeInfo

	return
}

//AddWatcherData 保存监视器配置数据
func AddWatcherData(key string, watcher map[int]WatchManagerCfg) {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	//logdebug.Println(logdebug.LevelDebug, "----add watcher data---", watcher)

	currentNodeInfo := allNodesInfo.allNodesInfoMap[key]
	currentNodeInfo.Watcher = watcher
	allNodesInfo.allNodesInfoMap[key] = currentNodeInfo

	return
}

//GetWatcherData 获取监视器配置
func GetWatcherData(key string) map[int]WatchManagerCfg {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	currentNodeInfo := allNodesInfo.allNodesInfoMap[key]

	return currentNodeInfo.Watcher
}

//GetClientInfo 在前端展示client info
func GetClientInfo(key string) ClientInfo {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	currentClientInfo := allNodesInfo.allNodesInfoMap[key].Client

	return currentClientInfo
}

//GetAllNodesInfo 在前端展示所有的Node的信息
func GetAllNodesInfo() (allNodes map[string]NodeInfo) {
	allNodesInfo.mutexLock.Lock()

	defer allNodesInfo.mutexLock.Unlock()

	allNodes = allNodesInfo.allNodesInfoMap

	//logdebug.Println(logdebug.LevelDebug, "---get all nodes---", allNodes)

	return
}
