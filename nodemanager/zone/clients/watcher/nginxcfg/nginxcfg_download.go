package nginxcfg

import (
	"github.com/emicklei/go-restful"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"os"
	"os/exec"
	"path"
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

	respMsg.NginxCfgDownloadURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.DownloadCfgAPIServerPath

	response.WriteHeaderAndJson(200, respMsg, "application/json")
}

func (svc *ServiceInfo) batchNginxCfgsDownload(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<all nginx config downloading...>>>>>>>")
	webMsg := BatchDownloadInfo{}
	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<解析前端数据>>>>>>>", webMsg)

	for _, batchDownloadInfo := range webMsg.DownloadInfo {
		client := nodes.ClientInfo{
			NodeIP:   batchDownloadInfo.NodeIP,
			ClientID: batchDownloadInfo.ClientID,
		}

		key := client.CreateKey()
		clientInfo := nodes.GetClientInfo(key)

		NginxCfgDownloadURL := "http://" +
			clientInfo.NodeIP +
			clientInfo.APIServerPort +
			"/" +
			clientInfo.DownloadCfgAPIServerPath

		resp, _ := http.Get(NginxCfgDownloadURL)
		defer resp.Body.Close()
		body, _ := ioutil.ReadAll(resp.Body)
		writeFileTar := "/tmp/molen" +
			"/" +
			batchDownloadInfo.NodeIP +
			batchDownloadInfo.ClientID +
			".tar"

		//解包
		untarCmd := "tar -zxvf" + writeFileTar
		cmd := exec.Command("bash", "-c", untarCmd)
		cmd.Run()

		writeFile := "/tmp/molen" +
			"/" +
			batchDownloadInfo.NodeIP +
			batchDownloadInfo.ClientID

		fout, _ := os.Create(writeFile)
		fout.Write(body)
	}

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<走完通信函数...>>>>>>>")
	//打包
	tarCmd := "tar -zcvf" +
		"/tmp/molen" +
		"molen.tar"
	cmd := exec.Command("bash", "-c", tarCmd)
	cmd.Run()

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<走完打包函数...>>>>>>>")
	filePath := "/tmp/molen/molen.tar"

	//write to web
	file, _ := os.Open(filePath)
	defer file.Close()

	fileName := path.Base(filePath)
	fileName = url.QueryEscape(filePath)
	response.AddHeader("Content-Type", "application/octet-stream")
	response.AddHeader("content-disposition", "attachment; filename="+fileName)
	io.Copy(response.ResponseWriter, file)
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<走完前端通信函数...>>>>>>>")

}
