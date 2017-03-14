package zone

//zone 就是Home
import (
	//"NgFront/nodemanager/nodes"
	"fmt"
	"net/http"
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
	return
}

func getZoneInfo(w http.ResponseWriter, r *http.Request) {
	//GetAllNodesInfo()  .... write  resp

	//response.WriteHeaderAndJson(200, nil, "application/json")
	fmt.Println("------重定向 获取数据 返回给JS----")

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront", showHomePage)
	http.HandleFunc("/zone", getZoneInfo)

	return
}
