package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"html/template"
	//"io/ioutil"
	"net/http"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"

	"github.com/emicklei/go-restful"
)

//ServiceInfo 服务信息
type ServiceInfo struct {
}

func showWatcherPage(w http.ResponseWriter, r *http.Request) {
	logdebug.Println(logdebug.LevelInfo, "-----加载watcher页面----")
	//加载模板 显示内容是 批量操作client
	t, err := template.ParseFiles("template/views/nginx/watcher.html")
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	t.Execute(w, nil)

	return
}

//获取之前缓存在nodes包里面的watcher界面所需的信息
//func getWatcherInfo(w http.ResponseWriter, r *http.Request) {
//	//watcher界面所需展示的数据较多 不止是watcher 还有client的部分信息
//	webMsg := nodes.NodeInfo{}
//	r.ParseForm()

//	client := nodes.ClientInfo{
//		NodeIP:   r.Form.Get("NodeIP"),
//		ClientID: r.Form.Get("ClientID"),
//	}

//	key := client.CreateKey()

//	webMsg.Client = nodes.GetClientInfo(key)
//	webMsg.Watcher = nodes.GetWatcherData(key)

//	//通信结构 json格式转换
//	jsonTypeMsg, err := json.Marshal(webMsg)
//	if err != nil {
//		logdebug.Println(logdebug.LevelError, err)
//		return
//	}

//	w.Write(jsonTypeMsg)

//	return
//}

//更新kubeng上的监视器信息
func updateWatcherInfo(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	//解析表单
	var bodyRead []byte = make([]byte, 1024)
	r.Body.Read(bodyRead)

	//str := byteString(bodyRead)
	//fmt.Println("the length of str is ", len(str))
	var recv nodes.WatchManagerCfg
	//json.Unmarshal([]byte(str), &recv)
	json.Unmarshal(bodyRead, &recv)

	logdebug.Println(logdebug.LevelInfo, "------与kubeng通讯 更新watcher状态 ----", recv)

	return
}

//处理
//func dealWatcherInfo(w http.ResponseWriter, r *http.Request) {
//	//加载模板....redirect 拿数据 写回....
//	if r.Method == "GET" {
//		logdebug.Println(logdebug.LevelInfo, "------重定向 获取数据 返回给JS----", *r)

//		getWatcherInfo(w, r)

//		return
//	}

//	//response.WriteHeaderAndJson(200, nil, "application/json")

//	updateWatcherInfo(w, r)

//	return
//}

func getWatcherInfo(request *restful.Request, response *restful.Response) {
	logdebug.Println(logdebug.LevelInfo, "------get watcher info----")

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

func postWatcherInfo(request *restful.Request, response *restful.Response) {
	webMsg := WebMsg{}

	logdebug.Println(logdebug.LevelInfo, "------与kubeng通讯 更新watcher状态 ----")

	err := request.ReadEntity(&webMsg)
	if err != nil {
		response.WriteError(http.StatusInternalServerError, err)

		return
	}

	response.WriteHeaderAndJson(200, "Hello World!", "application/json")

	logdebug.Println(logdebug.LevelInfo, "------与kubeng通讯 更新watcher状态 ----", webMsg)
}

//测试数据
func getTestNamespacesDetailInfo() (namespacesDetail NamespacesDetailInfo) {
	namespacesDetail = NamespacesDetailInfo{
		NamespacesList: []string{"租户1", "租户2", "租户3", "租户4"},
		NamespacesAppList: [][]string{
			{"租户1-服务1", "租户1-服务2", "租户1-服务3"},
			{"租户2-服务1", "租户2-服务2", "租户2-服务3"},
			{"租户3-服务1", "租户3-服务2", "租户3-服务3"},
			{"租户4-服务1", "租户4-服务2", "租户4-服务3"},
		},
	}

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

	namespaces = getTestNamespacesDetailInfo()

	logdebug.Println(logdebug.LevelInfo, "***********namespace detailInfo******************", namespaces)
	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(namespaces)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	w.Write(jsonTypeMsg)

	return
}

type WebMsg struct {
	NodeIP   string
	ClientID string

	WatcherCfg nodes.WatchManagerCfg
}

//Init 初始化函数
func (svc *ServiceInfo) Init() {
	http.HandleFunc("/ngfront/zone/clients/watcher", showWatcherPage)
	//http.HandleFunc("/watcher", dealWatcherInfo)
	http.HandleFunc("/namespaces", getWatchNamespacesDetailInfo)

	ws := new(restful.WebService)

	ws.
		Path("/watcher").
		Consumes(restful.MIME_XML, restful.MIME_JSON).
		Produces(restful.MIME_JSON, restful.MIME_XML) // you can specify this per route as well

	//获取监视管理器配置 GET http://localhost:8888/watchmgr
	ws.Route(ws.GET("/").To(getWatcherInfo).
		// docs
		Doc("get watch manager config").
		Operation("findWatchManagerConfig").
		Reads(nodes.ClientInfo{}).
		Returns(200, "OK", nodes.NodeInfo{}))

	//更新监视管理器配置 PUT http://localhost:8888/watchmgr
	ws.Route(ws.POST("/").To(postWatcherInfo).
		// docs
		Doc("update watch manager config").
		Operation("updateWatchManagerConfig").
		Reads(WebMsg{})) // from the request

	restful.Add(ws)

	return
}
