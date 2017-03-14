package zone

//zone 就是Home
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

var webRespMsgMap map[string]webRespMsg

func showHomePage(w http.ResponseWriter, r *http.Request) {
	//tepmlate加载 respone exec
	t, err := template.ParseFiles("template/html/zone/index.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	t.Execute(w, nil)
}

type webRespMsg struct {
	JobZoneType string
	NodeName    string
	NodeIP      string
	ClientID    string
}

func getZoneInfo(w http.ResponseWriter, r *http.Request) {
	allNodes := nodes.GetAllNodesInfo()
	for k, v := range allNodes {
		webRespMsgMap[k].JobZoneType = v.clientInfo.JobZoneType
		webRespMsgMap[k].ClientID = v.clientInfo.ClientID
		webRespMsgMap[k].NodeName = v.clientInfo.NodeName
		webRespMsgMap[k].NodeIP = v.clientInfo.NodeIP
	}

	v, err := json.Marshal(webRespMsgMap)
	if err != nil {
		fmt.Println(err)
		return
	}
	w.Write(v)
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront", showHomePage)
	http.HandleFunc("/zone", getZoneInfo)

	return
}
