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

	webMsg := BatchDownloadCfgsInfo{}
	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<解析前端数据>>>>>>>", webMsg)

	for _, batchDownloadInfo := range webMsg.DownloadClientInfo {
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
		os.MkdirAll("/tmp/molen", os.ModePerm)
		writeFileTar := "/tmp/molen" +
			"/" +
			batchDownloadInfo.NodeIP +
			"_" +
			batchDownloadInfo.ClientID +
			".tar"
		fout, _ := os.Create(writeFileTar)
		fout.Write(body)

		//解包
		bkpDownloadFile := "/tmp/molly/" + batchDownloadInfo.NodeIP + "_" + batchDownloadInfo.ClientID
		os.MkdirAll(bkpDownloadFile, os.ModePerm)
		untarCmd := "tar -zxvf " + writeFileTar + " -C " + bkpDownloadFile
		cmd := exec.Command("bash", "-c", untarCmd)
		cmd.Run()

	}
	//打包
	tarCmd := "tar -zcvf " + "/tmp/molly.tar.gz" + " /tmp/molly"
	cmd := exec.Command("bash", "-c", tarCmd)
	cmd.Run()
	respMsg := webRespMsg{
		NginxCfgDownloadURL: "/nginxcfg/batchDownload",
	}

	response.WriteHeaderAndJson(200, respMsg, "application/json")

}

func (svc *ServiceInfo) nginxCfgRedictDownload(request *restful.Request, response *restful.Response) {

	//write to web
	filePath := "/tmp/molly.tar.gz"
	file, _ := os.Open(filePath)
	defer file.Close()

	fileName := path.Base(filePath)
	fileName = url.QueryEscape(filePath)
	response.AddHeader("Content-Type", "application/octet-stream")
	response.AddHeader("content-disposition", "attachment; filename="+fileName)
	io.Copy(response.ResponseWriter, file)

}
