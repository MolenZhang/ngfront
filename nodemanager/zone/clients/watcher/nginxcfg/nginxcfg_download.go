package nginxcfg

import (
	"github.com/emicklei/go-restful"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
)

type webRespMsg struct {
	NginxCfgDownloadURL string
}

//WebReqMsg 保存下载nginx配置相关参数
type WebReqMsg struct {
	NodeIP   string
	ClientID string
}

func (svc *ServiceInfo) nginxCfgDownload(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<nginx config downloading...>>>>>>>")
	var (
		reqMsg  WebReqMsg
		respMsg webRespMsg
	)
	request.Request.ParseForm()
	reqMsg.NodeIP = request.Request.Form.Get("NodeIP")
	reqMsg.ClientID = request.Request.Form.Get("ClientID")

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<前端输入下载信息：>>>>>>>", reqMsg)

	client := nodes.ClientInfo{
		NodeIP:   reqMsg.NodeIP,
		ClientID: reqMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	respMsg.NginxCfgDownloadURL = "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.DownloadCfgAPIServerPath

	response.WriteHeaderAndJson(200, respMsg, "application/json")
}
