package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"fmt"
	"html/template"
	"net/http"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

func showWatcherPage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("---------------show watcher page------")
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/views/nginx/watcher.html")
	if err != nil {
		fmt.Println(err)
		return
	}

	t.Execute(w, nil)

	return
}

//处理
func dealWatcherInfo(w http.ResponseWriter, r *http.Request) {
	//GetAllNodesInfo()  .... write  resp

	//加载模板....redirect 拿数据 写回....
	if r.Method == "GET" {
		//data := getData()

		fmt.Println("------重定向 获取数据 返回给JS----")
		//w.Write(data)

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
