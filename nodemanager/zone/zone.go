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
	var webRespMsgMap map[string]webRespMsg

	webRespMsgMap = make(map[string]webRespMsg, 0)

	allNodes := nodes.GetAllNodesInfo()
	for k, v := range allNodes {
		msg := webRespMsg{}
		msg.JobZoneType = v.Client.JobZoneType
		msg.ClientID = v.Client.ClientID
		msg.NodeName = v.Client.NodeName
		msg.NodeIP = v.Client.NodeIP

		webRespMsgMap[k] = msg
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
