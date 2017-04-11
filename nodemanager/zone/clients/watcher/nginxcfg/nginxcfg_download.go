package nginxcfg

import (
	"github.com/emicklei/go-restful"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"os"
	"os/exec"
	"path"
	"time"
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

	watcherID := request.PathParameter("watcherID")

	request.Request.ParseForm()
	reqMsg.NodeIP = request.Request.Form.Get("NodeIP")
	reqMsg.ClientID = request.Request.Form.Get("ClientID")

	logdebug.Println(logdebug.LevelDebug, "<<<<<<<前端输入下载信息：>>>>>>>", reqMsg)
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<前端watcherID：>>>>>>>", watcherID)

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
		clientInfo.DownloadCfgAPIServerPath +
		"/" +
		watcherID

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

		nginxCfgDownloadURL := "http://" +
			clientInfo.NodeIP +
			clientInfo.APIServerPort +
			"/" +
			clientInfo.DownloadCfgAPIServerPath

		resp, _ := http.Get(nginxCfgDownloadURL)
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

		//处理kubeNg发来的数据
		bkpDownloadFile := "/tmp/molly/" + batchDownloadInfo.NodeIP + "_" + batchDownloadInfo.ClientID
		os.MkdirAll(bkpDownloadFile, os.ModePerm)
		untarCmd := "tar -zxvf " + writeFileTar + " -C " + bkpDownloadFile
		cmd := exec.Command("bash", "-c", untarCmd)
		cmd.Run()

	}
	//将kubeNG发来的数据 整理打包 准备发给web前端
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

type singleClientDownloadInfo struct {
	NodeIP       string
	ClientID     string
	WatcherIDSet []string
}

//下载单个节点上的所选watcherID的配置信息
func downloadSingleClientNginxCfgsByWatcherIDs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<根据指定watcherID下载配置信息>>>>>>>>>>>>")
	var NginxCfgDownloadURL string
	reqDownloadInfo := singleClientDownloadInfo{}
	if err := request.ReadEntity(&reqDownloadInfo); err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	logdebug.Println(logdebug.LevelDebug, "解析前端发来数据", reqDownloadInfo)

	for _, watcherID := range reqDownloadInfo.WatcherIDSet {

		client := nodes.ClientInfo{
			NodeIP:   reqDownloadInfo.NodeIP,
			ClientID: reqDownloadInfo.ClientID,
		}

		key := client.CreateKey()
		clientInfo := nodes.GetClientInfo(key)

		NginxCfgDownloadURL = "http://" +
			clientInfo.NodeIP +
			clientInfo.APIServerPort +
			"/" +
			clientInfo.DownloadCfgAPIServerPath +
			"/" +
			watcherID

		resp, _ := communicate.SendRequestByJSON(communicate.GET, NginxCfgDownloadURL, nil)

		os.MkdirAll("/tmp/molen", os.ModePerm)
		downloadTime := time.Now().Format("01-02_15_04_05")

		writeFileTar := "/tmp/molen" +
			"/" +
			watcherID +
			"_" +
			downloadTime +
			".tar"

		fout, _ := os.Create(writeFileTar)
		fout.Write(resp)

		//处理kubeNg发来的数据
		bkpDownloadFile := "/tmp/molly/" +
			clientInfo.NodeIP +
			"_" +
			clientInfo.ClientID +
			"_" +
			watcherID +
			"_" +
			downloadTime
		os.MkdirAll(bkpDownloadFile, os.ModePerm)
		untarCmd := "tar -zxvf " + writeFileTar + " -C " + bkpDownloadFile
		cmd := exec.Command("bash", "-c", untarCmd)
		cmd.Run()
	}

	//将kubeNG发来的数据 整理打包 准备发给web前端
	tarCmd := "tar -zcvf " + "/tmp/molly.tar.gz" + " /tmp/molly"
	cmd := exec.Command("bash", "-c", tarCmd)
	cmd.Run()
	respMsg := webRespMsg{
		NginxCfgDownloadURL: "/nginxcfg/singleClientDownload/tarDownload",
	}

	logdebug.Println(logdebug.LevelDebug, "发给前端数据", respMsg)
	response.WriteHeaderAndJson(200, respMsg, "application/json")

}
func (svc *ServiceInfo) realDownload(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "前端开始下载")
	//write to web
	filePath := "/tmp/molly.tar.gz"
	file, _ := os.Open(filePath)
	defer file.Close()

	//fileName := path.Base(filePath)
	//fileName = url.QueryEscape(filePath)
	response.AddHeader("Content-Type", "application/octet-stream")
	response.AddHeader("content-disposition", "attachment; filename="+"NginxCfg.tar.gz")
	io.Copy(response.ResponseWriter, file)

	logdebug.Println(logdebug.LevelDebug, "前端下载文件完成")

	//下载完成后删除本地下载文件
	fileDeleted(filePath)
}

// ClientInfo 客户端信息
type singleClientInfo struct {
	NodeIP   string
	ClientID string
}
type allClientDownloadInfo struct {
	ClientInfoSet []singleClientInfo
	WatcherIDSet  []string
}

//下载指定的部分clients中部分watcher的nginx配置
func downloadClientsNginxCfgsByWatcherIDs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<根据指定watcherID下载配置信息>>>>>>>>>>>>")
	var NginxCfgDownloadURL string

	reqDownloadInfo := allClientDownloadInfo{}
	if err := request.ReadEntity(&reqDownloadInfo); err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	logdebug.Println(logdebug.LevelDebug, "解析前端发来数据", reqDownloadInfo)

	os.MkdirAll("/tmp/molen", os.ModePerm)

	for _, watcherID := range reqDownloadInfo.WatcherIDSet {

		for _, singleNodeInfo := range reqDownloadInfo.ClientInfoSet {

			client := nodes.ClientInfo{
				NodeIP:   singleNodeInfo.NodeIP,
				ClientID: singleNodeInfo.ClientID,
			}

			key := client.CreateKey()
			clientInfo := nodes.GetClientInfo(key)
			NginxCfgDownloadURL = "http://" +
				clientInfo.NodeIP +
				clientInfo.APIServerPort +
				"/" +
				clientInfo.DownloadCfgAPIServerPath +
				"/" +
				watcherID

			resp, _ := communicate.SendRequestByJSON(communicate.GET, NginxCfgDownloadURL, nil)

			downloadTime := time.Now().Format("01-02_15_04_05")

			writeFileTar := "/tmp/molen" +
				"/" +
				clientInfo.NodeIP +
				"_" +
				clientInfo.ClientID +
				"_" +
				watcherID +
				"_" +
				downloadTime +
				".tar"

			fout, _ := os.Create(writeFileTar)
			fout.Write(resp)

			//处理kubeNg发来的数据
			bkpDownloadFile := "/tmp/molly" +
				"/" +
				clientInfo.NodeIP +
				"_" +
				clientInfo.ClientID +
				"_" +
				watcherID + "_" + downloadTime

			os.MkdirAll(bkpDownloadFile, os.ModePerm)
			untarCmd := "tar -zxvf " + writeFileTar + " -C " + bkpDownloadFile
			cmd := exec.Command("bash", "-c", untarCmd)
			cmd.Run()
		}
	}
	//将kubeNG发来的数据 整理打包 准备发给web前端
	tarCmd := "tar -zcvf " + "/tmp/molly.tar.gz" + " /tmp/molly"
	cmd := exec.Command("bash", "-c", tarCmd)
	cmd.Run()
	respMsg := webRespMsg{
		NginxCfgDownloadURL: "/nginxcfg/singleClientDownload/tarDownload",
	}

	logdebug.Println(logdebug.LevelDebug, "发给前端数据", respMsg)
	response.WriteHeaderAndJson(200, respMsg, "application/json")

}

func fileDeleted(filePath string) {
	if _, err := os.Stat("/tmp/molen"); err == nil {
		os.RemoveAll("tmp/molen")
	}

	if _, err := os.Stat("/tmp/molly"); err == nil {
		os.RemoveAll("/tmp/molly")
	}

	if err := os.Remove(filePath); err != nil {
		logdebug.Println(logdebug.LevelDebug, "删除本地下载文件失败", err)
	}
	logdebug.Println(logdebug.LevelDebug, "删除本地下载文件成功")

}
