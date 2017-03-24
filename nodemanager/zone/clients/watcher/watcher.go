package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"html/template"
	//"io/ioutil"
	"net/http"
	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"

	"github.com/emicklei/go-restful"
)

//CfgWebMsg 监视器配置的web消息
type CfgWebMsg struct {
	NodeIP     string
	ClientID   string
	WatcherCfg nodes.WatchManagerCfg
}

//ServiceInfo 服务信息
type ServiceInfo struct {
}

//ResponseBody 用于衡量每次restful请求的执行结果(通常是PUT)
type ResponseBody struct {
	Result       bool
	ErrorMessage string
	ErrCode      int32
}

//加载界面
func loadWatcherPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelDebug, "<<<<<<<<<<<<<加载watcher页面>>>>>>>>>>>>>")
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/views/nginx/watcher.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	t.Execute(w, nil)

	return
}

//处理前端的get请求
func getWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelDebug, "获取监视器信息")

	request.Request.ParseForm()

	client := nodes.ClientInfo{
		NodeIP:   request.Request.Form.Get("NodeIP"),
		ClientID: request.Request.Form.Get("ClientID"),
	}

	//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
	webMsg := nodes.NodeInfo{}

	key := client.CreateKey()

	webMsg.Client = nodes.GetClientInfo(key)
	webMsg.Watcher = nodes.GetWatcherData(key)

	response.WriteHeaderAndJson(200, webMsg, "application/json")

	return
}

func (webMsg *CfgWebMsg) getWatcherAPIServerURL() (watcherAPIServerURL string) {
	client := nodes.ClientInfo{
		NodeIP:   webMsg.NodeIP,
		ClientID: webMsg.ClientID,
	}

	key := client.CreateKey()

	clientInfo := nodes.GetClientInfo(key)

	watcherAPIServerURL = "http://" + clientInfo.NodeIP + clientInfo.APIServerPort + "/" + clientInfo.WatchManagerAPIServerPath

	//logdebug.Println(logdebug.LevelDebug, "=watcherAPIServerURL URL:", watcherAPIServerURL, "=")

	return
}

//postWatcherInfo 处理前端POST过来的消息
func postWatcherInfo(request *restful.Request, response *restful.Response) {
	webMsg := CfgWebMsg{}

	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新watcher状态")

	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	updateWatcherCfgURL := webMsg.getWatcherAPIServerURL()

	//暂时未做处理失败的逻辑判断
	communicate.SendRequestByJSON(communicate.POST, updateWatcherCfgURL, webMsg.WatcherCfg)

	//解析成功后 下发给kubveng 并返回错误码...
	//response.WriteHeaderAndJson(200, "Hello World!", "application/json")

	logdebug.Println(logdebug.LevelDebug, "与kubeng通讯 更新watcher状态 收到的web前端消息内容:", webMsg)

	return
}

//使用界面传过来的IP VERSION获取所要监控的k8s集群租户的详细信息(统计有多少服务)
func getWatchNamespacesDetailInfo(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	kubernetesMasterHost := r.Form.Get("KubernetesMasterHost")
	kubernetesAPIVersion := r.Form.Get("KubernetesAPIVersion")
	jobZoneType := r.Form.Get("JobZoneType")

	getNamespacesURL := kubernetesMasterHost + "/" + kubernetesAPIVersion + "/namespaces"

	namespaces := getNamespacesDetailInfoFromK8s(getNamespacesURL, jobZoneType)

	logdebug.Println(logdebug.LevelDebug, "从后台获取到的租户详细信息:", namespaces)
	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(namespaces)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)

		return
	}

	w.Write(jsonTypeMsg)

	return
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", loadWatcherPage)
	//http.HandleFunc("/watcher", dealWatcherInfo)
	http.HandleFunc("/namespaces", getWatchNamespacesDetailInfo)

	ws := new(restful.WebService)

	ws.
		Path("/watcher").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well

	//获取监视管理器配置 GET http://localhost:8888/watcher
	ws.Route(ws.GET("/").To(getWatcherInfo).
		// docs
		Doc("get watch manager config").
		Operation("findWatchManagerConfig").
		Reads(nodes.ClientInfo{}).
		Returns(200, "OK", nodes.NodeInfo{}))

	//更新监视管理器配置 PUT http://localhost:8888/watcher
	ws.Route(ws.POST("/").To(postWatcherInfo).
		// docs
		Doc("update watch manager config").
		Operation("updateWatchManagerConfig").
		Reads(CfgWebMsg{})) // from the request

	restful.Add(ws)

	return
}
