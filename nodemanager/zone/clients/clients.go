package clients

//clients页面 展示 一个区域内的所有client信息 可以批量操作
import (
	"fmt"
	"html/template"
	"net/http"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

func showClientsPage(w http.ResponseWriter, r *http.Request) {
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/html/clients/index.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	t.Execute(w, nil)
}

func getClientsInfo(w http.ResponseWriter, r *http.Request) {
	//GetAllNodesInfo()  .... write  resp

	//response.WriteHeaderAndJson(200, nil, "application/json")
	fmt.Println("------重定向 获取数据 返回给JS----")

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/clients", showClientsPage)
	http.HandleFunc("/clients", getClientsInfo)

	return
}
