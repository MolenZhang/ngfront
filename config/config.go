package config

import (
	"flag"
	"fmt"
	//"sync"
	"os"
	"time"
)

//NgFrontCfgInfo ngfront程序启动参数以及其他配置信息结构
type NgFrontCfgInfo struct {
	ListenIP        string
	ListenPort      string
	HeartCycle      time.Duration
	HeartServerAddr string
	LogLevel        string
	TemplateDir     string
	//nutexLock       *sync.Mutex
}

//NgFrontCfg ngfront程序配置信息对象
var NgFrontCfg NgFrontCfgInfo

//DefaultHeartCycle 默认心跳间隔 5 秒
const DefaultHeartCycle = 5

//DefaultHeartTimeout 默认心跳超时时间 5 * 3 = 15秒
const DefaultHeartTimeout = DefaultHeartCycle * 3

//DefaultHeartServerPath 默认心跳服务器path
const DefaultHeartServerPath = "/ngfront/heart"

//DefaultListenIP
const DefaultListenIP = "localhost"

//DefaultListenPort 默认监听端口
const DefaultListenPort = "8083"

//DefaultLogLevel 默认日志级别
const DefaultLogLevel = "info"

//DefaultTemplateDir 默认模板路径
const DefaultTemplateDir = ""

// Init 初始配置参数
func Init() {
	flag.StringVar(&NgFrontCfg.ListenIP, "ip", DefaultListenIP, "默认监听地址")
	flag.StringVar(&NgFrontCfg.ListenPort, "port", DefaultListenPort, "默认监听端口")
	flag.DurationVar(&NgFrontCfg.HeartCycle, "heartcycle", DefaultHeartCycle, "默认心跳间隔 单位/秒")
	flag.StringVar(&NgFrontCfg.HeartServerAddr, "heartserveraddr", "http://localhost:8083"+DefaultHeartServerPath, "默认心跳服务器地址")
	flag.StringVar(&NgFrontCfg.LogLevel, "loglevel", DefaultLogLevel, "默认日志级别，支持debug,info,warn,error,fatal")
	flag.StringVar(&NgFrontCfg.TemplateDir, "", DefaultTemplateDir, "默认m模板路径")
	flag.Parse()

	NgFrontCfg.HeartServerAddr = "http://" + NgFrontCfg.ListenIP + ":" + NgFrontCfg.ListenPort + DefaultHeartServerPath

	createCfgForJS(NgFrontCfg.ListenIP, NgFrontCfg.ListenPort)

	return
}

//GetLogPrintLevel 获取当前log级别
func GetLogPrintLevel() string {
	//NgFrontCfg.nutexLock.Lock()
	//defer NgFrontCfg.nutexLock.Unlock()

	logPrintlnLevel := NgFrontCfg.LogLevel
	return logPrintlnLevel
}

func createCfgForJS(IP, Port string) {
	fout, _ := os.Create("/opt/ngfront/test.html")

	cfgContent := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head lang="en">
<title></title>
<meta charset="utf-8">

</head>
<body>
	<div>areaip:<input type="text" value="%s" id="areaIP"></div>
	<div>areaport:<input type="text" value="%s" id="areaPort"></div>
</body>
</html>`, IP, Port)

	fout.WriteString(cfgContent)
}
