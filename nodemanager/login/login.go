package login

import (
	"ngfront/config"
	//"container/list"
	"log"
	"net/http"
	"ngfront/nodemanager/nodes"
	"time"

	"github.com/emicklei/go-restful"
)

//RequestBody 请求报文体
type RequestBody struct {
	ClientID                 string
	NodeName                 string
	NodeIP                   string
	APIServerPort            string
	NginxCfgsAPIServerPath   string
	TestToolAPIServerPath    string
	NodeInfoAPIServerPath    string
	DownloadCfgAPIServerPath string
	WatchManagerAPIServer    string
	JobZoneType              string
}

//RequestResult 回复成功与否报文原因
type RequestResult struct {
	ErrCode   int
	ResultMsg string
	ErrReason string
}

//ResponseBody 回复报文体
type ResponseBody struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	LoginStatus     int
}

//RequestMsg 回复登录信息
type RequestMsg struct {
	ReqBody   RequestBody
	RespBody  ResponseBody
	ReqResult RequestResult
}

//ServiceInfo 服务信息
type ServiceInfo struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	//xxxx            string
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	svc.HeartCycle = config.NgFrontCfg.HeartCycle
	//svc.HeartServerAddr = "http://192.168.0.75:8083/ngfront/heart"
	svc.HeartServerAddr = config.NgFrontCfg.HeartServerAddr

	svc.register()

	return
}

//register 注册登录函数
func (svc *ServiceInfo) register() {
	ws := new(restful.WebService)
	ws.
		//Path("/ngfront/login").
		Path("/ngfront/login").
		Doc("nginx web configure").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML)

	ws.Route(ws.POST("/").To(svc.login).
		Doc("show nginx configure to the web").
		Operation("login").
		Reads(RequestMsg{}))

	restful.Add(ws)

	return
}

func (svc *ServiceInfo) login(request *restful.Request, response *restful.Response) {
	reqMsg := RequestMsg{}
	if err := request.ReadEntity(&reqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}

	reqMsg.RespBody = ResponseBody{
		HeartServerAddr: svc.HeartServerAddr,
		HeartCycle:      svc.HeartCycle,
		LoginStatus:     1,
	}

	reqMsg.ReqResult = RequestResult{
		ErrCode:   1,
		ResultMsg: "",
		ErrReason: "",
	}

	clientInfo := nodes.ClientInfo{
		NodeIP:                   reqMsg.ReqBody.NodeIP,
		ClientID:                 reqMsg.ReqBody.ClientID,
		NodeName:                 reqMsg.ReqBody.NodeName,
		APIServerPort:            reqMsg.ReqBody.APIServerPort,
		NginxCfgsAPIServerPath:   reqMsg.ReqBody.NginxCfgsAPIServerPath,
		TestToolAPIServerPath:    reqMsg.ReqBody.TestToolAPIServerPath,
		NodeInfoAPIServerPath:    reqMsg.ReqBody.NodeInfoAPIServerPath,
		DownloadCfgAPIServerPath: reqMsg.ReqBody.DownloadCfgAPIServerPath,
		WatchManagerAPIServer:    reqMsg.ReqBody.WatchManagerAPIServer,
		JobZoneType:              reqMsg.ReqBody.JobZoneType,
	}

	nodes.AddClientData(clientInfo) //将IP+clientID 为key add进map

	// http GET---->AddWatcherData(clientInfo.CreateKey(), Value....) 存

	log.Println("上线报文=", reqMsg)
	response.WriteHeaderAndJson(200, reqMsg, "application/json")

	return
}
