package login

import (
	config "NgFront/startconfig"
	//"container/list"
	"github.com/emicklei/go-restful"
	"log"
	"net/http"
	"time"
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

var ReqMsg LoginRequestMsg

//ServiceInfo 服务信息
type ServiceInfo struct {
	HeartServerAddr string
	HeartCycle      time.Duration
	xxxx            string
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	svc.HeartCycle = config.StartConfig.HeartCycle
	//svc.HeartServerAddr = "http://192.168.0.75:8083/ngfront/heart"
	svc.HeartServerAddr = config.StartConfig.HeartServerAddr

}

//Register 注册登录函数
func (svc *ServiceInfo) Register() {
	ws := new(restful.WebService)
	ws.
		//Path("/ngfront/login").
		Path("/ngfront/login").
		Doc("nginx web configure").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML)

	ws.Route(ws.POST("/").To(svc.showNgConf).
		Doc("show nginx configure to the web").
		Operation("showNgConf").
		Reads(LoginRequestMsg{}))

	restful.Add(ws)
}

func (svc *ServiceInfo) showNgConf(request *restful.Request, response *restful.Response) {
	ReqMsg = LoginRequestMsg{}
	if err := request.ReadEntity(&ReqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}

	ReqMsg.RespBody = LoginResponseBody{
		HeartServerAddr: svc.HeartServerAddr,
		HeartCycle:      svc.HeartCycle,
		LoginStatus:     1,
	}

	ReqMsg.ReqResult = LoginRequestResult{
		ErrCode:   1,
		ResultMsg: "",
		ErrReason: "",
	}
	log.Println(ReqMsg)
	response.WriteHeaderAndJson(200, ReqMsg, "application/json")

}
