package clients

//clients页面 展示 一个区域内的所有client信息 可以批量操作
import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"ngfront/nodemanager/nodes"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

type client struct {
	NodeIP           string
	NodeName         string
	ClientID         string
	APIServerPort    string
	K8sWatcherStatus string
}

type webRespMsg struct {
	JobZoneType string
	Clients     []client
}

func showClientsPage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("-----加载client页面----")
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/views/nginx/clients.html")
	if err != nil {
		fmt.Println(err)
		return
	}

	t.Execute(w, nil)

	return
}

//不同的区域存储在不同的成员中 all存储在第0个成员
const (
	allZone  = 0
	dmzZone  = 1
	dmz1Zone = 2
	userZone = 3
	maxZone  = 4
)

var zoneTypeTable = []string{"all", "dmz", "dmz1", "user"}

//将zone类型字符串转换成数组下标(int)
func convertZoneType(zoneType string) int {
	for index, zone := range zoneTypeTable {
		if zoneType == zone {
			return index
		}
	}

	//非法值
	return maxZone
}

func getClientsInfo(w http.ResponseWriter, r *http.Request) {
	//定义一个4个大小尺寸的结构体数组
	var webMsg [maxZone]webRespMsg
	//遍历 初始化各个成员的数组切片
	for k, _ := range webMsg {
		webMsg[k].Clients = make([]client, 0)
	}

	//获取所有Nodes的信息
	allNodes := nodes.GetAllNodesInfo()
	for _, nodeInfo := range allNodes {
		//提取nodeInfo中部分字段 给前端展示使用
		clientInfo := client{
			NodeName:         nodeInfo.Client.NodeName,
			NodeIP:           nodeInfo.Client.NodeIP,
			K8sWatcherStatus: nodeInfo.Watcher.K8sWatcherStatus,
			ClientID:         nodeInfo.Client.ClientID,
			APIServerPort:    nodeInfo.Client.APIServerPort,
		}

		//获取数组下标
		zoneIndex := convertZoneType(nodeInfo.Client.JobZoneType)
		if zoneIndex != maxZone {
			//dmz ------webMsg[1].JobZoneType = "dmz"
			webMsg[zoneIndex].JobZoneType = nodeInfo.Client.JobZoneType
			//将每个客户端的信息 依照zone的类型 存入通信数据结构中(追加)
			webMsg[zoneIndex].Clients = append(webMsg[zoneIndex].Clients, clientInfo)
		}
	}

	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(webMsg)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Write(jsonTypeMsg)

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients", showClientsPage)
	http.HandleFunc("/clients", getClientsInfo)

	return
}
