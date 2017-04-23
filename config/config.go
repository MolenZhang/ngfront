//Package config 主要定义和初始化服务启动的参数以及将一些参数传递给js用于通信
package config

import (
	"flag"
	"fmt"
	"net"
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
	LogDir          string
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

//DefaultListenIP 默认的监控IP
const DefaultListenIP = "localhost"

//DefaultListenPort 默认监听端口
const DefaultListenPort = "8083"

//DefaultLogLevel 默认日志级别
const DefaultLogLevel = "info"

//DefaultTemplateDir 默认模板路径
const DefaultTemplateDir = "./"

//DefaultLogDir 默认日志文件保存路径
const DefaultLogDir = "/opt/ngfront/log/"

// Init 初始配置参数
func Init() {
	flag.StringVar(&NgFrontCfg.ListenIP, "ip", DefaultListenIP, "默认监听地址")
	flag.StringVar(&NgFrontCfg.ListenPort, "port", DefaultListenPort, "默认监听端口")
	flag.DurationVar(&NgFrontCfg.HeartCycle, "heartcycle", DefaultHeartCycle, "默认心跳间隔 单位/秒")
	//	flag.StringVar(&NgFrontCfg.HeartServerAddr, "heartserveraddr", "http://localhost:8083"+DefaultHeartServerPath, "默认心跳服务器地址")
	flag.StringVar(&NgFrontCfg.LogLevel, "loglevel", DefaultLogLevel, "默认日志级别，支持debug,info,warn,error,fatal")
	flag.StringVar(&NgFrontCfg.TemplateDir, "templatedir", DefaultTemplateDir, "默认模板路径")
	flag.StringVar(&NgFrontCfg.LogDir, "logdir", DefaultLogDir, "默认日志文件保存路径")

	flag.Parse()

	if NgFrontCfg.ListenIP == "localhost" {
		IPForKubeNg := convertLocalhostToRealIP()
		if IPForKubeNg == "" {
			return
		}
		NgFrontCfg.HeartServerAddr = "http://" + IPForKubeNg + ":" + NgFrontCfg.ListenPort + DefaultHeartServerPath
	}

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

	//如果为localhost 则转换为js可识别的IP地址
	jsIP := IP
	if IP == "localhost" {
		jsIP = convertLocalhostToRealIP()
		if jsIP == "" {
			return
		}
	}
	templateDir := NgFrontCfg.TemplateDir

	fout, _ := os.Create(templateDir + "template/js/customer/ipPort.js")
	defer fout.Close()
	cfgContent := fmt.Sprintf(`$(function(){
	$("#areaIP").val("%s");
	$("#areaPort").val("%s");
});`, jsIP, Port)

	fout.WriteString(cfgContent)
	return
}

func convertLocalhostToRealIP() string {
	addrs, err := net.InterfaceAddrs()

	if err != nil {
		fmt.Println(err)
		return ""
	}

	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
}
