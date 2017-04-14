package tools

import (
	//"fmt"
	"encoding/json"
	"github.com/emicklei/go-restful"
	"net/http"
	"ngfront/communicate"
	"ngfront/nodemanager/nodes"
)

//ResponseBody 用于衡量每次restful请求的执行结果(通常是PUT POST)
type ResponseBody struct {
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

func (svc *ServiceInfo) execToolsCMD(request *restful.Request, response *restful.Response) {
	nginxTestToolCMD := ""

	err := request.ReadEntity(&nginxTestToolCMD)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	testToolMsg := NginxTestToolInfo{
		NginxCmdType: nginxTestToolCMD,
	}

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	url := "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.TestToolAPIServerPath

	//url = "http://localhost:8877/testtool"

	resp, _ := communicate.SendRequestByJSON(communicate.POST, url, testToolMsg)

	respMsg := ResponseBody{}

	json.Unmarshal(resp, &respMsg)

	response.WriteHeaderAndJson(200, respMsg, "application/json")

	return
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
