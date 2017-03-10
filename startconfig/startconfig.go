package startconfig

import (
	"flag"
	//	"fmt"
	"time"
)

//ListenPort 监听端口，默认8083
type StartInitConfig struct {
	ListenPort      string
	HeartCycle      time.Duration
	HeartServerAddr string
}

var StartConfig StartInitConfig

// Init 初始配置参数
func Init() {
	flag.StringVar(&StartConfig.ListenPort, "port", "8083", "listen Port")
	flag.DurationVar(&StartConfig.HeartCycle, "heartcycle", 5, "heartcycle")
	flag.StringVar(&StartConfig.HeartServerAddr, "heartserveraddr", "http://192.168.0.76:8083/ngfront/heart", "HeartServerAddr")

	flag.Parse()
}
