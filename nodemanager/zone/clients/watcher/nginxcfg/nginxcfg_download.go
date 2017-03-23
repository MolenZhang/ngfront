package nginxcfg

import (
	"encoding/json"
	"fmt"
	"github.com/emicklei/go-restful"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
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
}

func (svc *ServiceInfo) nginxCfgDownload(request *restful.Request, response *restful.Response) {
	var (
		err        error
		sftpClient *sftp.Client
		respMsg    respFromKubeNg
		reqMsg     WebReqMsg
	)
	if err := request.ReadEntity(&reqMsg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
	}

	request.Request.ParseForm()
	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	nginxCfgTemDownloadURL := clientInfo.DownloadCfgAPIServerPath
	resp, err := communicate.SendRequestByJSON(communicate.GET, nginxCfgTemDownloadURL, nil)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	if err := json.Unmarshal(resp, &respMsg); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	nginxCfgActDownloadURL := respMsg.DownloadCfgPath

	if sftpClient, err = svc.connect(reqMsg.User, reqMsg.Password, client.NodeIP, 22); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer sftpClient.Close()

	// 用来测试的远程文件路径 和 本地文件夹
	var remoteFilePath = nginxCfgActDownloadURL
	var localDir = "./"

	srcFile, err := sftpClient.Open(remoteFilePath)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer srcFile.Close()

	var localFileName = path.Base(remoteFilePath)
	dstFile, err := os.Create(path.Join(localDir, localFileName))
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer dstFile.Close()

	if _, err = srcFile.WriteTo(dstFile); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
}

func (svc *ServiceInfo) connect(user, password, host string, port int) (*sftp.Client, error) {
	var (
		auth         []ssh.AuthMethod
		addr         string
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
	addr = fmt.Sprintf("%s:%d", host, port)

	if sshClient, err = ssh.Dial("tcp", addr, clientConfig); err != nil {
		return nil, err
	}

	// create sftp client
	if sftpClient, err = sftp.NewClient(sshClient); err != nil {
		return nil, err
	}

	return sftpClient, nil
}
