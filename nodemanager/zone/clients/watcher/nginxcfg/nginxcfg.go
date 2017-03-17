package nginxcfg

import (
	//"encoding/json"
	"html/template"
	//"io/ioutil"
	"net/http"
	"ngfront/logdebug"
	//"ngfront/nodemanager/nodes"
)

//Config nginx 配置
type Config struct {
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

func showNginxCfgPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelInfo, "-----加载nginx页面----")
	//加载模板 显示内容是 批量操作nginx配置
	t, err := template.ParseFiles("template/views/nginx/nginxcfg.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	t.Execute(w, nil)

	return
}

func dealNginxCfg(w http.ResponseWriter, r *http.Request) {

}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher/nginxcfg", showNginxCfgPage)
	http.HandleFunc("/nginxcfg", dealNginxCfg)

	return
}
