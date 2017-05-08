/*Package logdebug 主要有以下两个功能
1、定义日志打印级别
2、将日志定向输入到指定文件中
*/
package logdebug

import (
	"io"
	"log"
	"os"
	"runtime"
	"strconv"
	"strings"

	"ngfront/config"
)

//LevelInfo 提示级别
const (
	LevelInfo  = 5 //提示级别
	LevelDebug = 4 //调试级别
	LevelWarn  = 3 //警告级别
	LevelError = 2 //错误级别
	LevelFatal = 1 //致命级别
)

var printLevelConvertMap = map[int]string{
	LevelInfo:  "INFO",
	LevelDebug: "DEBUG",
	LevelWarn:  "WARN",
	LevelError: "ERROR",
	LevelFatal: "FATAL",
}

//CheckLogLevel 检查错误等级是否是合法值
func CheckLogLevel(logLevelString string) bool {
	var logLevel int

	logLevelString = strings.ToUpper(logLevelString)

	for key, currentLevelString := range printLevelConvertMap {
		if currentLevelString == logLevelString {
			logLevel = key

			break
		}
	}

	if _, ok := printLevelConvertMap[logLevel]; !ok {
		//启动参数中设置的LOG等级超出预设范围
		return false
	}

	return true
}

//Println 打印log
func Println(logLevel int, v ...interface{}) {
	//userLevel := printLevelConvertMap[logLevel]
	var currentLevel int

	printLevelString := config.GetLogPrintLevel()
	printLevelString = strings.ToUpper(printLevelString)

	for key, currentLevelString := range printLevelConvertMap {
		if currentLevelString == printLevelString {
			currentLevel = key

			break
		}
	}

	//当前打印级别高于用户打印级别 则打印用户Log, 反之则不打印
	if currentLevel < logLevel {
		return
	}

	pc, _, line, _ := runtime.Caller(1) //1层调用栈

	f := runtime.FuncForPC(pc)

	logContent := "[" + printLevelConvertMap[logLevel] + "]" + "[" + f.Name() + ":" + strconv.Itoa(line) + "]"

	//	log.Println(logContent, v)
	logPrintToFile(logContent, v)

	return
}

//Printf 格式化打印log
func Printf(logLevel int, format string, v ...interface{}) {
	var currentLevel int

	printLevelString := config.GetLogPrintLevel()
	printLevelString = strings.ToUpper(printLevelString)

	for key, currentLevelString := range printLevelConvertMap {
		if currentLevelString == printLevelString {
			currentLevel = key
			break
		}
	}

	//当前打印级别高于用户打印级别 则打印用户Log
	if currentLevel < logLevel {
		return
	}

	pc, _, line, _ := runtime.Caller(1) //1层调用栈

	f := runtime.FuncForPC(pc)

	logContent := "[" + printLevelConvertMap[logLevel] + "]" + "[" + f.Name() + ":" + strconv.Itoa(line) + "]" + format

	//	log.Println(logContent, v)
	logPrintToFile(logContent, v)

	return
}

func logPrintToFile(logContent string, v ...interface{}) {

	//	logDir := "/home/zf/ngfront/log/"
	logDir := config.NgFrontCfg.LogDir
	if _, err := os.Stat(logDir); err != nil {
		if os.IsNotExist(err) == true {
			os.MkdirAll(logDir, os.ModePerm)
		}
	}

	logFileName := logDir + "ngfront.log"
	logFile, err := os.OpenFile(logFileName, os.O_RDWR|os.O_APPEND|os.O_CREATE, 0754)
	if err != nil {
		log.Println(err)
		return
	}
	defer logFile.Close()

	writers := []io.Writer{
		logFile,
		os.Stdout,
	}

	fileAndStdoutWriter := io.MultiWriter(writers...)
	gLogger := log.New(fileAndStdoutWriter, "\n", log.Ldate|log.Ltime|log.Lshortfile)

	gLogger.Println(logContent, v)
	return

}
