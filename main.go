package main

import (
	"NgFront/nodemanager/heart"
	"NgFront/nodemanager/login"
	"NgFront/nodemanager/nodes"
	"NgFront/nodemanager/zone"
	config "NgFront/startconfig"
	//"log"
	"net/http"
)

//NGFrontManager  ngfront 管理器
type NGFrontManager struct {
	LoginAPIServer   login.ServiceInfo
	HeartAPIServer   heart.ServiceInfo
	JobZoneAPIServer zone.ServiceInfo
	//NodesAPIServer    nodes.ServiceInfo
	//WatcherAPIServer  watcher.ServiceInfo
	//NginxCfgAPIServer nginxcfg.ServiceInfo
}

var ngFrontManager NGFrontManager

func init() {
	config.Init()

	nodes.Init()

	ngFrontManager.LoginAPIServer.Init()

	ngFrontManager.HeartAPIServer.Init()

	ngFrontManager.JobZoneAPIServer.Init() //Home页面

	//ngFrontManager.NodesAPIServer.Init()

	//ngFrontManager.WatcherAPIServer.Init()

	//ngFrontManager.NginxCfgAPIServer.Init()

	return
}

func main() {
	err := http.ListenAndServe(":"+config.StartConfig.ListenPort, nil)
	if err != nil {
		panic(err)
	}

	return
}
