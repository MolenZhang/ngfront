package tools

import (
	//"fmt"
	"encoding/json"
	"github.com/emicklei/go-restful"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"strings"
)

//ResponseBody 用于衡量每次restful请求的执行结果(通常是PUT POST)
type ResponseBody struct {
	Result       bool
	ErrorMessage string
	NginxCmd     string
	//ErrCode      int32
}

//webResponseBody 返回给前端的信息
type webResponseBody struct {
	Result       bool
	ErrorMessage string
	NginxCmd     string
	//ErrCode      int32
}

//NginxTestToolInfo 测试工具数据结构
type NginxTestToolInfo struct {
	NginxCmdType string
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

const nginxTestSuccessSymbol string = "successful\n"

func (svc *ServiceInfo) execToolsCMD(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<前端测试nginx Tool>>>>>>>")
	nginxTestToolCMD := NginxTestToolInfo{}

	err := request.ReadEntity(&nginxTestToolCMD)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	logdebug.Println(logdebug.LevelDebug, "前端传来的nginx测试命令：", nginxTestToolCMD)

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	logdebug.Println(logdebug.LevelDebug, "NodeIP:", client.NodeIP)
	logdebug.Println(logdebug.LevelDebug, "ClientID:", client.ClientID)

	nginxCmdTestURL := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.TestToolAPIServerPath

	logdebug.Println(logdebug.LevelDebug, "Nginx Test URL:", nginxCmdTestURL)

	resp, _ := communicate.SendRequestByJSON(communicate.POST, nginxCmdTestURL, nginxTestToolCMD)

	respMsg := ResponseBody{}

	webRespMsg := webResponseBody{}

	json.Unmarshal(resp, &respMsg)

	if nginxTestToolCMD.NginxCmdType == "test" {
		if checkNginxTestResult(respMsg.ErrorMessage) == true {
			webRespMsg.Result = true
			webRespMsg.NginxCmd = respMsg.NginxCmd
			response.WriteHeaderAndJson(200, webRespMsg, "application/json")
			return
		}
	}

	if respMsg.ErrorMessage == "" {
		webRespMsg.Result = true
		webRespMsg.NginxCmd = respMsg.NginxCmd
		response.WriteHeaderAndJson(200, webRespMsg, "application/json")
		return
	}

	webRespMsg.ErrorMessage = respMsg.ErrorMessage
	webRespMsg.NginxCmd = respMsg.NginxCmd
	webRespMsg.Result = false
	response.WriteHeaderAndJson(200, webRespMsg, "application/json")

	return
}

func checkNginxTestResult(testContent string) bool {
	outPutWords := strings.Split(testContent, " ")
	lastWordIndex := len(outPutWords) - 1

	if outPutWords[lastWordIndex] == nginxTestSuccessSymbol {
		return true
	}
	return false
}

//Init 初始化路由信息
func (svc *ServiceInfo) Init() {
	ws := new(restful.WebService)

	ws.
		Path("/tools").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well

	//创建监视器配置 CREATE
	ws.Route(ws.POST("/").To(svc.execToolsCMD).
		Doc("create a watcher manager").
		Operation("createWatcherInfo").
		Reads(""))

	restful.Add(ws)
}
