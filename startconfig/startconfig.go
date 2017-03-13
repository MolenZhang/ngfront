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

const DefaultHeartCycle = 5

const DefaultHeartTimeout = DefaultHeartCycle * 3

// Init 初始配置参数
func Init() {
	flag.StringVar(&StartConfig.ListenPort, "port", "8083", "listen Port")
	flag.DurationVar(&StartConfig.HeartCycle, "heartcycle", DefaultHeartCycle, "heartcycle")
	flag.StringVar(&StartConfig.HeartServerAddr, "heartserveraddr", "http://localhost:8083/ngfront/heart", "HeartServerAddr")

	flag.Parse()
}
