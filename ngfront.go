package main

import (
	"ngfront/config"
	"ngfront/nodemanager/heart"
	"ngfront/nodemanager/login"
	"ngfront/nodemanager/nodes"
	"ngfront/nodemanager/zone"
	"ngfront/nodemanager/zone/clients"
	"ngfront/nodemanager/zone/clients/watcher"
	"ngfront/nodemanager/zone/clients/watcher/nginxcfg"
	//"log"
	"net/http"
	"ngfront/nodemanager/zone/clients/tools"
)

//NGFrontManager  ngfront 管理器
type NGFrontManager struct {
	LoginAPIServer    login.ServiceInfo
	HeartAPIServer    heart.ServiceInfo
	JobZoneAPIServer  zone.ServiceInfo
	ClientsAPIServer  clients.ServiceInfo
	WatcherAPIServer  watcher.ServiceInfo
	NginxCfgAPIServer nginxcfg.ServiceInfo
	TestToolAPIServer tools.ServiceInfo
}

var ngFrontManager NGFrontManager

func init() {
	config.Init()

	nodes.Init()

	ngFrontManager.LoginAPIServer.Init()

	ngFrontManager.HeartAPIServer.Init()

	ngFrontManager.JobZoneAPIServer.Init() //Home页面

	ngFrontManager.ClientsAPIServer.Init()

	ngFrontManager.WatcherAPIServer.Init()

	ngFrontManager.NginxCfgAPIServer.Init()

	ngFrontManager.TestToolAPIServer.Init()

	return
}

func main() {
	err := http.ListenAndServe(":"+config.NgFrontCfg.ListenPort, nil)
	if err != nil {
		panic(err)

		return
	}

	return
}
