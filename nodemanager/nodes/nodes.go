//Package nodes 主要保存了上线的节点信息以及跟kubeNg通信的各个API接口路径信息
package nodes

//关于Node的所有信息以及数据结构都在此保存 操作
//一个Node上 可以有多个kubeng 一个kubeng由client信息和watcherManagerCfg以及NginxCfg信息3个成员构成 目前仅实现了2个成员

import (
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"sync"
	"time"

	"ngfront/config"
	"ngfront/logdebug"
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

//WatchManagerCfgs 保存上线的监控信息
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
	WorkDir                   string
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

	//拷贝界面模板到部署所在用户
	if _, err := os.Stat(config.NgFrontCfg.TemplateDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(config.NgFrontCfg.TemplateDir, os.ModePerm)
		}
	}
	templateDir := "/opt/ngfront/template/"

	currentWorkDir, _ := user.Current()
	currentUser := currentWorkDir.Username
	logdebug.Println(logdebug.LevelDebug, "current user:", currentUser)

	cpCmd := "cp -r " + templateDir + " " + config.NgFrontCfg.TemplateDir
	chmodCmd := "chmod 777 " + config.NgFrontCfg.TemplateDir + " -R"
	if currentUser != "root" {
		cpCmd = "sudo cp -r " + templateDir + " " + config.NgFrontCfg.TemplateDir
		chmodCmd = "sudo chmod 777 " + config.NgFrontCfg.TemplateDir + " -R"
	}

	logdebug.Println(logdebug.LevelDebug, "when exec copy,the cmd is:", cpCmd)
	cmd := exec.Command("bash", "-c", cpCmd)
	cmd.Run()

	execCmd := exec.Command("bash", "-c", chmodCmd)
	execCmd.Run()

	//将工作信息传给js
	createCfgForJS(config.NgFrontCfg.ListenIP, config.NgFrontCfg.ListenPort)
	allNodesInfo.allNodesInfoMap = make(map[string]NodeInfo, 0)
	allNodesInfo.mutexLock = new(sync.Mutex)

	return
}

func createCfgForJS(IP, Port string) {

	//如果为localhost 则转换为js可识别的IP地址
	jsIP := IP
	if IP == "localhost" {
		jsIP = config.ConvertLocalhostToRealIP()
		if jsIP == "" {
			return
		}
	}
	templateDir := config.NgFrontCfg.TemplateDir
	logdebug.Println(logdebug.LevelDebug, "when change JSInfo the templateDir is:", templateDir)
	if _, err := os.Stat(templateDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(templateDir, os.ModePerm)
		}
	}

	fout, err := os.Create(templateDir + "template/js/customer/ipPort.js")

	if err != nil {
		logdebug.Println(logdebug.LevelDebug, "error occured when create changeipPort.js:", err)
		return
	}
	defer fout.Close()
	cfgContent := fmt.Sprintf(`$(function(){
	$("#areaIP").val("%s");
	$("#areaPort").val("%s");
});`, jsIP, Port)

	fout.WriteString(cfgContent)
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

		logdebug.Println(logdebug.LevelInfo, "delete the key when heartbeat timeout !", key)

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

		logdebug.Println(logdebug.LevelInfo, "heartbeat timeout and delete the key !", key)

		return
	})
	//newNodeInfo.isTimerReset = false //新定时器 没有被刷新

	allNodesInfo.allNodesInfoMap[key] = newNodeInfo

	return
}

func DeleteNode(nodeIP string) {
	for key, nodeInfo := range allNodesInfo.allNodesInfoMap {
		if nodeInfo.Client.NodeIP == nodeIP {
			allNodesInfo.mutexLock.Lock()

			defer allNodesInfo.mutexLock.Unlock()

			delete(allNodesInfo.allNodesInfoMap, key)
			return
		}
	}

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
