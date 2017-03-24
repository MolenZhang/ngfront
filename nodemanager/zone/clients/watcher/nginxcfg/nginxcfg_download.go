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
	NodeIP   string
	ClientID string
}

func (svc *ServiceInfo) nginxCfgDownload(request *restful.Request, response *restful.Response) {
	var (
		err     error
		respMsg respFromKubeNg
		reqMsg  WebReqMsg
	)
	err = request.ReadEntity(&reqMsg)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
	}

	client := nodes.ClientInfo{
		NodeIP:   reqMsg.NodeIP,
		ClientID: reqMsg.ClientID,
	}
	key := client.CreateKey()
	clientInfo := nodes.GetClientInfo(key)

	nginxCfgTemDownloadURL := clientInfo.DownloadCfgAPIServerPath
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

	svc.remoteFileDownload(reqMsg.User, reqMsg.Password, client.NodeIP, nginxCfgActDownloadURL, 22)
}

func (svc *ServiceInfo) remoteFileDownload(user, password, host, url string, port int) {
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
		return
	}

	// create sftp client
	if sftpClient, err = sftp.NewClient(sshClient); err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer sftpClient.Close()

	// 用来测试的远程文件路径 和 本地文件夹
	remoteFilePath := url
	localDir := "./"

	srcFile, err := sftpClient.Open(remoteFilePath)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer srcFile.Close()

	localFileName := path.Base(remoteFilePath)
	dstFile, err := os.Create(path.Join(localDir, localFileName))
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	defer dstFile.Close()

	_, err = srcFile.WriteTo(dstFile)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
}
