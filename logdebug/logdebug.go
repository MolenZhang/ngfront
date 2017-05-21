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
	LevelInfo  = 1 //提示级别
	LevelDebug = 2 //调试级别
	LevelWarn  = 3 //警告级别
	LevelError = 4 //错误级别
	LevelFatal = 5 //致命级别
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
func Println(currentLevel int, v ...interface{}) {

	//配置中的打印级别
	var logLevel int

	//获取配置文件中的日志级别
	printLevelString := config.GetLogPrintLevel()
	printLevelString = strings.ToUpper(printLevelString)

	// 遍历日志级别表，并找出相应日志级别
	for key, logLevelString := range printLevelConvertMap {

		if printLevelString == logLevelString {
			logLevel = key

			break
		}
	}

	//当前日志打印级别 低于 配置文件中的日志打印级别则 不打印，反之打印日志
	if currentLevel < logLevel {
		return
	}

	pc, _, line, _ := runtime.Caller(1) //1层调用栈

	f := runtime.FuncForPC(pc)

	logContent := "[" + printLevelConvertMap[currentLevel] + "]" + "[" + f.Name() + ":" + strconv.Itoa(line) + "]"

	//	log.Println(logContent, v)
	logPrintToFile(logContent, v)

	return
}

//Printf 格式化打印log
func Printf(currentLevel int, format string, v ...interface{}) {
	var configLogLevel int

	printLevelString := config.GetLogPrintLevel()
	printLevelString = strings.ToUpper(printLevelString)

	for key, conifgLogLevelString := range printLevelConvertMap {
		if conifgLogLevelString == printLevelString {
			configLogLevel = key
			break
		}
	}

	//当前打印级别 低于 配置级别，则不打印 反之打印
	if currentLevel < configLogLevel {
		return
	}

	pc, _, line, _ := runtime.Caller(1) //1层调用栈

	f := runtime.FuncForPC(pc)

	logContent := "[" + printLevelConvertMap[currentLevel] + "]" + "[" + f.Name() + ":" + strconv.Itoa(line) + "]" + format

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

	// 判断文件内容大小
	// 超过设定值大小 则写入新的文件
	// 新文件命名方式：ngfront_date_time.log

	logFile, err := os.OpenFile(logFileName, os.O_RDWR|os.O_APPEND|os.O_CREATE, 0754)
	if err != nil {
		log.Println(err)
		return
	}

	fi, _ := logFile.Stat()
	logFileSize := fi.Size()

	maxLogFileSize := config.NgFrontCfg.LogFileSize

	if logFileSize >= maxLogFileSize {
		logFile.Close()

		os.Remove(logFileName)

		logFile, err = os.OpenFile(logFileName, os.O_RDWR|os.O_APPEND|os.O_CREATE, 0754)
		if err != nil {
			log.Println(err)
			return
		}

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
