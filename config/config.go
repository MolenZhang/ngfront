//Package config 主要定义和初始化服务启动的参数以及将一些参数传递给js用于通信
package config

import (
	"flag"
	"fmt"
	"net"
	"os"
	"os/exec"
	"os/user"
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
const DefaultLogLevel = "debug"

//DefaultTemplateDir 默认模板路径
const DefaultTemplateDir = "/ngfront/"

//DefaultLogDir 默认日志文件保存路径
const DefaultLogDir = "/ngfront/log/"

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
		//重新赋值，将localhost转为具体的IP地址
		NgFrontCfg.ListenIP = IPForKubeNg
	}

	NgFrontCfg.HeartServerAddr = "http://" + NgFrontCfg.ListenIP + ":" + NgFrontCfg.ListenPort + DefaultHeartServerPath

	//获取当前工作用户
	currentWorkDir, _ := user.Current()

	//默认日志路径
	NgFrontCfg.LogDir = currentWorkDir.HomeDir + DefaultLogDir

	//默认模板路径
	NgFrontCfg.TemplateDir = currentWorkDir.HomeDir + DefaultTemplateDir

	//拷贝界面模板到部署所在用户
	if _, err := os.Stat(NgFrontCfg.TemplateDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(NgFrontCfg.TemplateDir, os.ModePerm)
		}
	}

	templateDir := "./template/"
	cpCmd := "sudo cp -r " + templateDir + " " + NgFrontCfg.TemplateDir
	fmt.Println("拷贝时的命令:", cpCmd)
	cmd := exec.Command("bash", "-c", cpCmd)
	cmd.Run()

	chmodCmd := "sudo chmod 777 " + NgFrontCfg.TemplateDir + " -R"
	cmd = exec.Command("bash", "-c", chmodCmd)
	cmd.Run()

	//将工作信息传给js
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

	fmt.Println("传给js时的IP：", IP)
	fmt.Println("传给js时的Port：", Port)

	//如果为localhost 则转换为js可识别的IP地址
	jsIP := IP
	if IP == "localhost" {
		jsIP = convertLocalhostToRealIP()
		if jsIP == "" {
			return
		}
	}
	templateDir := NgFrontCfg.TemplateDir
	fmt.Println("修改JsIP时，模板路径:", templateDir)
	if _, err := os.Stat(templateDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(templateDir, os.ModePerm)
		}
	}

	fout, err := os.Create(templateDir + "template/js/customer/ipPort.js")

	if err != nil {
		fmt.Println("创建ipPort.js出错:", err)
		return
	}
	defer fout.Close()
	fmt.Println("开始修改模板里的IP和Port")
	cfgContent := fmt.Sprintf(`$(function(){
	$("#areaIP").val("%s");
	$("#areaPort").val("%s");
});`, jsIP, Port)

	fmt.Println("要修改的内容:", cfgContent)
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
