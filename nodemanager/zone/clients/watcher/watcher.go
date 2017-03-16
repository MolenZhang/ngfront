package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
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

func showWatcherPage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("-----加载watcher页面----")
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/views/nginx/watcher.html")
	if err != nil {
		fmt.Println(err)
		return
	}

	t.Execute(w, nil)

	return
}

func getWatcherInfo(w http.ResponseWriter, r *http.Request) {
	webMsg := nodes.NodeInfo{}
	r.ParseForm()

	client := nodes.ClientInfo{
		NodeIP:   r.Form.Get("NodeIP"),
		ClientID: r.Form.Get("ClientID"),
	}

	key := client.CreateKey()

	//fmt.Println("------------r.NodeIp=", r.Form.Get("NodeIP"))
	//fmt.Println("------------r.ClientID=", r.Form.Get("ClientID"))

	webMsg.Client = nodes.GetClientInfo(key)
	webMsg.Watcher = nodes.GetWatcherData(key)

	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(webMsg)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Write(jsonTypeMsg)

	//fmt.Println("------------返回的数据为-----", webMsg)

	return
}

//处理
func dealWatcherInfo(w http.ResponseWriter, r *http.Request) {
	//GetAllNodesInfo()  .... write  resp

	//加载模板....redirect 拿数据 写回....
	if r.Method == "GET" {
		//data := getData()

		fmt.Println("------重定向 获取数据 返回给JS----")
		//nodes.GetWatcherData(key)
		//w.Write(data)

		getWatcherInfo(w, r)

		return
	}

	//解析表单
	fmt.Println("------与kubeng通讯 更新watcher状态 ----")

	//response.WriteHeaderAndJson(200, nil, "application/json")

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", showWatcherPage)
	http.HandleFunc("/watcher", dealWatcherInfo)

	return
}
