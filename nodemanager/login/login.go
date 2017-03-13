package login

import (
	config "NgFront/startconfig"
	//"container/list"
	"NgFront/nodemanager/nodes"
	"log"
	"net/http"
	"time"

	"github.com/emicklei/go-restful"
)

//LoginRequestBody 请求报文体
type LoginRequestBody struct {
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

//LoginRequestResult 回复成功与否报文原因
type LoginRequestResult struct {
	ErrCode   int
	ResultMsg string
	ErrReason string
}

//LoginResponseBody 回复报文体
type LoginResponseBody struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	LoginStatus     int
}

//LoginRequestMsg 回复登录信息
type LoginRequestMsg struct {
	ReqBody   LoginRequestBody
	RespBody  LoginResponseBody
	ReqResult LoginRequestResult
}

//var reqMsg LoginRequestMsg

//ServiceInfo 服务信息
type ServiceInfo struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	//xxxx            string
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	svc.HeartCycle = config.StartConfig.HeartCycle
	//svc.HeartServerAddr = "http://192.168.0.75:8083/ngfront/heart"
	svc.HeartServerAddr = config.StartConfig.HeartServerAddr

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
		Reads(LoginRequestMsg{}))

	restful.Add(ws)
}

func (svc *ServiceInfo) login(request *restful.Request, response *restful.Response) {
	reqMsg := LoginRequestMsg{}
	if err := request.ReadEntity(&reqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}

	reqMsg.RespBody = LoginResponseBody{
		HeartServerAddr: svc.HeartServerAddr,
		HeartCycle:      svc.HeartCycle,
		LoginStatus:     1,
	}

	reqMsg.ReqResult = LoginRequestResult{
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
		JobZoneType:              reqMsg.ReqBody.JobZoneType}

	nodes.AddClientData(clientInfo) //将clientID 为key add进map

	log.Println(reqMsg)
	response.WriteHeaderAndJson(200, reqMsg, "application/json")

	return
}
