package heart

import (
	"NgFront/nodemanager/nodes"
	"log"
	"net/http"

	"github.com/emicklei/go-restful"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
	//heartReqMsg map[string]RequestMsg
}

//RequestBody 心跳请求body
type RequestBody struct {
	ClientID           string
	ClientHealthyState int
	ClientIP           string
}

//RequestResult 心跳请求结果
type RequestResult struct {
	ErrCode   int
	ResultMsg string
	ErrReason string
}

//ResponseBody 心跳回复body
type ResponseBody struct {
	HeartStatus int
}

//RequestMsg 心跳请求完整报文
type RequestMsg struct {
	ReqBody   RequestBody
	RespBody  ResponseBody
	ReqResult RequestResult
}

//HeartFailed 心跳失败，HeartSucess 心跳成功
const (
	HeartFailed = 0
	HeartSucess = 1
)

func (svc *ServiceInfo) heart(request *restful.Request, response *restful.Response) {
	heartReqMsg, result := heartCheck(request, response)
	if result == true {
		//心跳检验成功 刷新定时器
		//heartReqMsg.SaveData() //....TIMER

	}
	//校验失败:1.之前几次心跳可能超时了 定时器timeout后删除了map中的clientID
	//本次心跳就视为失败了，只要这个客户端不经过Login 后续的心跳是不可能成功的

	log.Println(heartReqMsg)

	response.WriteHeaderAndJson(200, heartReqMsg, "application/json")

	return
}

//心跳检查 校验
func heartCheck(request *restful.Request, response *restful.Response) (RequestMsg, bool) {
	heartReqMsg := RequestMsg{}
	if err := request.ReadEntity(&heartReqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())

		return heartReqMsg, false
	}

	heartReqMsg.RespBody = ResponseBody{
		HeartStatus: HeartFailed,
	}

	heartReqMsg.ReqResult = RequestResult{
		ErrCode:   0,
		ResultMsg: "",
		ErrReason: "",
	}

	clientInfo := nodes.ClientInfo{
		ClientID: heartReqMsg.ReqBody.ClientID,
		NodeIP:   heartReqMsg.ReqBody.ClientIP}

	//校验
	if true != nodes.CheckClientInfo(clientInfo) {
		return heartReqMsg, false
	}

	heartReqMsg.ReqResult = RequestResult{
		ErrCode:   1,
		ResultMsg: "",
		ErrReason: "",
	}
	heartReqMsg.RespBody.HeartStatus = HeartSucess

	return heartReqMsg, true
}

//Init 初始化
func (svc *ServiceInfo) Init() {
	svc.register()

	//可以拓展添加其他功能

	return
}

func (svc *ServiceInfo) register() {
	ws := new(restful.WebService)

	ws.Path("/ngfront/heart").
		Doc("heart check").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML)

	ws.Route(ws.POST("/").To(svc.heart).
		Doc("heart check with kubeng").
		Operation("heartCheck").
		Reads(RequestMsg{}))

	restful.Add(ws)
}
