package heart

import (
	"NgFront/nodemanager/nodes"
	"log"
	"net/http"

	"github.com/emicklei/go-restful"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
	//heartReqMsg map[string]HeartRequestMsg
}

type HeartRequestBody struct {
	ClientID           string
	ClientHealthyState int
	ClientIP           string
}

type HeartRequestResult struct {
	ErrCode   int
	ResultMsg string
	ErrReason string
}

type HeartResponseBody struct {
	HeartStatus int
}

type HeartRequestMsg struct {
	ReqBody   HeartRequestBody
	RespBody  HeartResponseBody
	ReqResult HeartRequestResult
}

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
func heartCheck(request *restful.Request, response *restful.Response) (HeartRequestMsg, bool) {
	heartReqMsg := HeartRequestMsg{}
	if err := request.ReadEntity(&heartReqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())

		return heartReqMsg, false
	}

	heartReqMsg.RespBody = HeartResponseBody{
		HeartStatus: HeartFailed,
	}

	heartReqMsg.ReqResult = HeartRequestResult{
		ErrCode:   0,
		ResultMsg: "",
		ErrReason: "",
	}

	clientInfo := nodes.ClientInfo{
		ClientID: heartReqMsg.ReqBody.ClientID}

	//校验
	if true != nodes.CheckClientInfo(clientInfo) {
		return heartReqMsg, false
	}

	heartReqMsg.ReqResult = HeartRequestResult{
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
		Reads(HeartRequestMsg{}))

	restful.Add(ws)
}
