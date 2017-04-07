package zone

//zone 就是Home
import (
	"encoding/json"
	"html/template"
	"net/http"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//client 用于展示的客户端信息数据结构
type client struct {
	NodeIP   string
	NodeName string
}

type webRespMsg struct {
	JobZoneType string
	Clients     []client
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

func loadHomePage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<<加载主页>>>>>>>>>>>>>")

	t, err := template.ParseFiles("template/views/nginx/area.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	t.Execute(w, nil)

	return
}

func getZoneInfo(w http.ResponseWriter, r *http.Request) {
	//定义一个4个大小尺寸的结构体数组
	var webMsg [maxZone]webRespMsg
	//遍历 初始化各个成员的数组切片
	for k := range webMsg {
		webMsg[k].Clients = make([]client, 0)
	}

	//获取所有Nodes的信息
	allNodes := nodes.GetAllNodesInfo()

	for _, nodeInfo := range allNodes {
		//提取nodeInfo中部分字段 给前端展示使用
		clientInfo := client{
			NodeName: nodeInfo.Client.NodeName,
			NodeIP:   nodeInfo.Client.NodeIP,
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
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	w.Write(jsonTypeMsg)

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))
	http.Handle("/plugins/", http.FileServer(http.Dir("template")))
	http.Handle("/images/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/ngfront", loadHomePage)
	http.HandleFunc("/ngfront/zone", getZoneInfo)

	return
}
