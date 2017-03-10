package main

import (
	"NgFront/nodemanager/heart"
	"NgFront/nodemanager/login"
	config "NgFront/startconfig"
	"log"
	"net/http"
)

func main() {
	var svc login.ServiceInfo
	svc.Init()
	svc.Register()
	config.Init()
	heart.Register()

	log.Println("默认监听端口:", config.StartConfig.ListenPort)
	log.Println("默认心跳服务地址:", config.StartConfig.HeartServerAddr)
	log.Println("默认心跳周期:", config.StartConfig.HeartCycle)
	if err := http.ListenAndServe(":"+config.StartConfig.ListenPort, nil); err != nil {
		panic(err)
	}
}
