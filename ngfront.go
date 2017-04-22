//Package main 为项目的入口函数 展示了程序启动的参数以及监听的地址和端口信息
package main

import (
	"log"
	"net/http"
	"ngfront/config"
	"ngfront/nodemanager/heart"
	"ngfront/nodemanager/login"
	"ngfront/nodemanager/nodes"
	"ngfront/nodemanager/zone"
	"ngfront/nodemanager/zone/clients"
	"ngfront/nodemanager/zone/clients/tools"
	"ngfront/nodemanager/zone/clients/watcher"
	"ngfront/nodemanager/zone/clients/watcher/nginxcfg"
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
	showStartCfgInfo()
	err := http.ListenAndServe(":"+config.NgFrontCfg.ListenPort, nil)
	if err != nil {
		panic(err)

		return
	}

	return
}

func showStartCfgInfo() {
	log.Println("********************Ngfront Start Config*************************")
	log.Println("[Ngfront 监听地址]:          ", config.NgFrontCfg.ListenIP)
	log.Println("[Ngfront 监听端口]:          ", config.NgFrontCfg.ListenPort)
	log.Println("[Ngfront 日志路径]:          ", config.NgFrontCfg.LogDir)
	log.Println("[Ngfront 日志级别]:          ", config.NgFrontCfg.LogLevel)
	log.Println("[Ngfront 模板路径]:          ", config.NgFrontCfg.TemplateDir)
	log.Println("[Ngfront 心跳周期]:          ", config.NgFrontCfg.HeartCycle)
	log.Println("[Ngfront 心跳地址]:          ", config.NgFrontCfg.HeartServerAddr)
	log.Println("*****************************************************************\n\n")
}
