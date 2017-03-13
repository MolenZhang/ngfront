package heart

import (
	login "NgFront/nodemanager/login"
	"github.com/emicklei/go-restful"
	"log"
	"net/http"
)

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

var (
	HeartCheckStatus int
	heartReqMsg      HeartRequestMsg
)

const (
	HeartFailed = 0
	HeartSucess = 1
)

func heartCheck(request *restful.Request, response *restful.Response) {
	heartReqMsg = HeartRequestMsg{}
	if err := request.ReadEntity(&heartReqMsg); err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}

	if heartReqMsg.ReqBody.ClientID == login.ReqMsg.ReqBody.ClientID {
		HeartCheckStatus = HeartSucess
		heartReqMsg.ReqResult = HeartRequestResult{
			ErrCode:   1,
			ResultMsg: "",
			ErrReason: "",
		}
	} else {
		HeartCheckStatus = HeartFailed
		heartReqMsg.ReqResult = HeartRequestResult{
			ErrCode:   0,
			ResultMsg: "",
			ErrReason: "",
		}
	}

	heartReqMsg.RespBody = HeartResponseBody{
		HeartStatus: HeartCheckStatus,
	}

	log.Println(heartReqMsg)
	response.WriteHeaderAndJson(200, heartReqMsg, "application/json")

}
func Register() {
	ws := new(restful.WebService)
	ws.Path("/ngfront/heart").
		Doc("heart check").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML)

	ws.Route(ws.POST("/").To(heartCheck).
		Doc("heart check with kubeng").
		Operation("heartCheck").
		Reads(HeartRequestMsg{}))

	restful.Add(ws)
}
