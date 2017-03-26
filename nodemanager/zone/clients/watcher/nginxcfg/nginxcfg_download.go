package nginxcfg

import (
	"encoding/json"
	"fmt"
	"github.com/emicklei/go-restful"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
	"io"
	"net/http"
	"net/url"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
	"os"
	"path"
	"time"
)

type respFromKubeNg struct {
	Result          bool
	DownloadCfgPath string
}

//WebReqMsg 保存下载nginx配置相关参数
type WebReqMsg struct {
	User     string
	Password string
	NodeIP   string
	ClientID string
}

func (svc *ServiceInfo) nginxCfgDownload(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<nginx config downloading...>>>>>>>")
	var (
		err     error
		respMsg respFromKubeNg
		reqMsg  WebReqMsg
	)
	err = request.ReadEntity(&reqMsg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
	}
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<前端输入下载信息：>>>>>>>", reqMsg)

	client := nodes.ClientInfo{
		NodeIP:   reqMsg.NodeIP,
		ClientID: reqMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	nginxCfgTemDownloadURL := "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.DownloadCfgAPIServerPath

	resp, err := communicate.SendRequestByJSON(communicate.GET, nginxCfgTemDownloadURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	err = json.Unmarshal(resp, &respMsg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	nginxCfgActDownloadURL := respMsg.DownloadCfgPath

	downloadFileName := svc.remoteFileDownload(reqMsg.User, reqMsg.Password, client.NodeIP, nginxCfgActDownloadURL, 22)

	logdebug.Println(logdebug.LevelDebug, "********前端要下载的文件名", downloadFileName)

	file, err := os.Open(downloadFileName)
	if err != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
	}

	fileName := path.Base(downloadFileName)
	fileName = url.QueryEscape(fileName) // 防止中文乱码
	response.AddHeader("Content-Type", "application/octet-stream")
	response.AddHeader("content-disposition", "attachment; filename=\""+fileName+"\"")
	_, error := io.Copy(response.ResponseWriter, file)
	if error != nil {
		response.WriteErrorString(http.StatusInternalServerError, err.Error())
		return
	}
	return
}

func (svc *ServiceInfo) remoteFileDownload(user, password, host, url string, port int) string {
	var (
		auth         []ssh.AuthMethod
		clientConfig *ssh.ClientConfig
		sshClient    *ssh.Client
		sftpClient   *sftp.Client
		err          error
	)

	// get auth method
	auth = make([]ssh.AuthMethod, 0)
	auth = append(auth, ssh.Password(password))

	clientConfig = &ssh.ClientConfig{
		User:    user,
		Auth:    auth,
		Timeout: 30 * time.Second,
	}

	// connet to ssh
	addr := fmt.Sprintf("%s:%d", host, port)

	if sshClient, err = ssh.Dial("tcp", addr, clientConfig); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return ""
	}

	// create sftp client
	if sftpClient, err = sftp.NewClient(sshClient); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return ""
	}
	defer sftpClient.Close()

	// 用来测试的远程文件路径 和 本地文件夹
	remoteFilePath := url
	localDir := "/tmp/"

	srcFile, err := sftpClient.Open(remoteFilePath)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return ""
	}
	defer srcFile.Close()

	localFileName := path.Base(remoteFilePath) // /root/molen -> molen

	//判断路径是否存在,不存在则创建
	if false == pathExists(localDir) {
		os.MkdirAll(localDir, 0777)
	}

	dstFile, err := os.Create(path.Join(localDir, localFileName))
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return ""
	}
	defer dstFile.Close()

	_, err = srcFile.WriteTo(dstFile)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return ""
	}
	return localDir + localFileName

}

func pathExists(path string) bool {
	_, err := os.Stat(path)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}
