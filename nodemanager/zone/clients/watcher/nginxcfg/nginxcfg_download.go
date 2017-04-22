package nginxcfg

import (
	"github.com/emicklei/go-restful"
	"io"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"os"
	"os/exec"
	"time"
)

const (
	tmpLocalDownloadLocation string = "/tmp/molly"
	tmpWebDownloadLocation   string = "/tmp/molen"
	localDownloadFileName    string = "/tmp/molly.tar.gz"
	webDownloadFileName      string = "NginxCfg.tar.gz"
	webNginxCfgDownloadURL   string = "/nginxcfg/singleClientDownload/tarDownload"
)

// ClientInfo 客户端信息
type singleClientInfo struct {
	NodeIP   string
	ClientID string
}

type allClientDownloadInfo struct {
	ClientInfoSet []singleClientInfo
	WatcherIDSet  []string
}

type tarCmdFile struct {
}

type webRespMsg struct {
	NginxCfgDownloadURL string
}

type singleClientDownloadInfo struct {
	NodeIP       string
	ClientID     string
	WatcherIDSet []string
}

//下载单个节点上的所选watcherID的配置信息
func downloadSingleClientNginxCfgsByWatcherIDs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<根据指定watcherID下载配置信息>>>>>>>>>>>>")
	var (
		downloadURL  string
		clientInfo   nodes.ClientInfo
		downloadTime string
	)

	reqDownloadInfo := singleClientDownloadInfo{}
	if err := request.ReadEntity(&reqDownloadInfo); err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	os.MkdirAll(tmpLocalDownloadLocation, os.ModePerm)
	for _, watcherID := range reqDownloadInfo.WatcherIDSet {

		downloadURL, clientInfo = getDownloadURL(reqDownloadInfo.NodeIP, reqDownloadInfo.ClientID, watcherID)

		resp, _ := communicate.SendRequestByJSON(communicate.GET, downloadURL, nil)

		downloadTime = time.Now().Format("01-02_15_04_05")

		writeFileTar := mkDownloadFile(clientInfo, watcherID, downloadTime)
		fout, _ := os.Create(writeFileTar)
		fout.Write(resp)

		// 处理KubeNG发来的数据
		dealDataFromKubeNg(writeFileTar, watcherID, downloadTime, clientInfo)
	}

	//将kubeNG发来的数据 整理打包 准备发给web前端
	tarCmd := tarCmdFile{}
	tarCmd.tarCmd()

	respMsg := webRespMsg{
		NginxCfgDownloadURL: webNginxCfgDownloadURL,
	}

	response.WriteHeaderAndJson(200, respMsg, "application/json")

}

//下载指定的部分clients中部分watcher的nginx配置
func downloadClientsNginxCfgsByWatcherIDs(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<根据指定watcherID下载配置信息>>>>>>>>>>>>")

	reqDownloadInfo := allClientDownloadInfo{}
	if err := request.ReadEntity(&reqDownloadInfo); err != nil {
		response.WriteError(http.StatusInternalServerError, err)
		return
	}

	os.MkdirAll(tmpLocalDownloadLocation, os.ModePerm)
	clientInfoSet := reqDownloadInfo.ClientInfoSet

	for _, watcherID := range reqDownloadInfo.WatcherIDSet {

		// 去前端所选的每一个client上下载对应watcherID下的nginx配置
		allClientsNginxCfgByWatcherID(watcherID, clientInfoSet)

	}
	//将kubeNG发来的数据 整理打包 准备发给web前端
	downloadCmd := tarCmdFile{}
	downloadCmd.tarCmd()

	respMsg := webRespMsg{
		NginxCfgDownloadURL: webNginxCfgDownloadURL,
	}

	response.WriteHeaderAndJson(200, respMsg, "application/json")
}

//处理kubeNg发来的数据
func dealDataFromKubeNg(writeFileTar, watcherID, downloadTime string, clientInfo nodes.ClientInfo) {
	bkpDownloadFile := tmpWebDownloadLocation +
		"/" +
		clientInfo.NodeIP +
		"_" +
		clientInfo.ClientID +
		"_" +
		watcherID +
		"_" +
		downloadTime

	os.MkdirAll(bkpDownloadFile, os.ModePerm)

	untarCmd := tarCmdFile{}
	untarCmd.untarCmd(writeFileTar, bkpDownloadFile)
}

func getDownloadURL(nodeIP, clientID, watcherID string) (nginxCfgDownloadURL string, clientInfo nodes.ClientInfo) {

	client := nodes.ClientInfo{
		NodeIP:   nodeIP,
		ClientID: clientID,
	}

	key := client.CreateKey()
	clientInfo = nodes.GetClientInfo(key)

	nginxCfgDownloadURL = "http://" +
		clientInfo.NodeIP +
		clientInfo.APIServerPort +
		"/" +
		clientInfo.DownloadCfgAPIServerPath +
		"/" +
		watcherID

	return
}

func (svc *ServiceInfo) realDownload(request *restful.Request, response *restful.Response) {

	logdebug.Println(logdebug.LevelDebug, "前端开始下载")
	//write to web
	filePath := localDownloadFileName
	file, _ := os.Open(filePath)
	defer file.Close()

	response.AddHeader("Content-Type", "application/octet-stream")
	response.AddHeader("content-disposition", "attachment; filename="+webDownloadFileName)
	io.Copy(response.ResponseWriter, file)
	logdebug.Println(logdebug.LevelDebug, "<<<<<<前端下载文件完成>>>>>>")

	//下载完成后删除本地下载文件
	fileDeleted(filePath)
}

func (downloadCmd *tarCmdFile) tarCmd() {
	tarCmd := "tar -zcvf " + localDownloadFileName + " " + tmpWebDownloadLocation
	cmd := exec.Command("bash", "-c", tarCmd)
	cmd.Run()
}

func (downloadCmd *tarCmdFile) untarCmd(writeFileTar, bkpDownloadFile string) {
	untarCmd := "tar -zxvf " + writeFileTar + " -C " + bkpDownloadFile
	cmd := exec.Command("bash", "-c", untarCmd)
	cmd.Run()

}

func mkDownloadFile(clientInfo nodes.ClientInfo, watcherID, downloadTime string) (writeFileTar string) {

	writeFileTar = tmpLocalDownloadLocation +
		"/" +
		clientInfo.NodeIP +
		"_" +
		clientInfo.ClientID +
		"_" +
		watcherID +
		"_" +
		downloadTime +
		".tar"
	return
}

func allClientsNginxCfgByWatcherID(watcherID string, clientInfoSet []singleClientInfo) {

	var (
		downloadURL string
		clientInfo  nodes.ClientInfo
	)

	for _, singleNodeInfo := range clientInfoSet {

		downloadURL, clientInfo = getDownloadURL(singleNodeInfo.NodeIP, singleNodeInfo.ClientID, watcherID)

		resp, _ := communicate.SendRequestByJSON(communicate.GET, downloadURL, nil)

		downloadTime := time.Now().Format("01-02_15_04_05")
		writeFileTar := mkDownloadFile(clientInfo, watcherID, downloadTime)

		fout, _ := os.Create(writeFileTar)
		fout.Write(resp)

		//处理kubeNg发来的数据
		dealDataFromKubeNg(writeFileTar, watcherID, downloadTime, clientInfo)
	}
	return
}

func fileDeleted(filePath string) {
	if _, err := os.Stat(tmpLocalDownloadLocation); err == nil {
		os.RemoveAll(tmpLocalDownloadLocation)
	}

	if _, err := os.Stat(tmpWebDownloadLocation); err == nil {
		os.RemoveAll(tmpWebDownloadLocation)
	}

	if err := os.Remove(filePath); err != nil {
		logdebug.Println(logdebug.LevelDebug, "删除本地下载文件失败", err)
	}
	logdebug.Println(logdebug.LevelDebug, "删除本地下载文件成功")

}
