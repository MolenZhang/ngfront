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

//获取之前缓存在nodes包里面的watcher界面所需的信息
func getWatcherInfo(w http.ResponseWriter, r *http.Request) {
	//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
	webMsg := nodes.NodeInfo{}
	r.ParseForm()

	client := nodes.ClientInfo{
		NodeIP:   r.Form.Get("NodeIP"),
		ClientID: r.Form.Get("ClientID"),
	}

	key := client.CreateKey()

	webMsg.Client = nodes.GetClientInfo(key)
	webMsg.Watcher = nodes.GetWatcherData(key)

	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(webMsg)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Write(jsonTypeMsg)

	return
}

//更新kubeng上的监视器信息
func updateWatcherInfo(w http.ResponseWriter, r *http.Request) {
	//解析表单
	fmt.Println("------与kubeng通讯 更新watcher状态 ----")

	return
}

//处理
func dealWatcherInfo(w http.ResponseWriter, r *http.Request) {
	//加载模板....redirect 拿数据 写回....
	if r.Method == "GET" {
		fmt.Println("------重定向 获取数据 返回给JS----")

		getWatcherInfo(w, r)

		return
	}

	//response.WriteHeaderAndJson(200, nil, "application/json")

	updateWatcherInfo(w, r)

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", showWatcherPage)
	http.HandleFunc("/watcher", dealWatcherInfo)

	return
}
