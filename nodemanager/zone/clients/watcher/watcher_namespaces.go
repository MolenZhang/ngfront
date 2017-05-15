package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"ngfront/communicate"
	"ngfront/logdebug"
	"ngfront/nodemanager/nodes"
)

//NamespaceList 租户列表
type NamespaceList struct {
	Items []NamespaceObject
}

//NamespaceObject 单个租户对象
type NamespaceObject struct {
	Metadata NamespaceMetadata
}

//NamespaceMetadata 租户对象元数据
type NamespaceMetadata struct {
	Name string
}

// AppInfo 服务信息
type AppInfo struct {
	AppSrcType    string
	NamespacesApp string
}

//NamespacesDetailInfo 租户列表详细信息
type NamespacesDetailInfo struct {
	NamespacesList []string
	AppInfoList    [][]AppInfo
}

//EndpointsList epList数据结构
type EndpointsList struct {
	Items []EndpointObject
}

//EndpointObject 单个ep对象结构
type EndpointObject struct {
	Metadata EndpointMetadata
	Subsets  []EndpointSubset
}

//EndpointMetadata ep元数据
type EndpointMetadata struct {
	Name      string
	Namespace string
	Labels    map[string]string
}

//EndpointSubset ep subesets
type EndpointSubset struct {
	Addresses []AddressObject
	Ports     []PortsObject
}

//AddressObject address对象
type AddressObject struct {
	IP string
}

//PortsObject port对象
type PortsObject struct {
	Port int
}

//SaveNamespaceInfo 保存已经监控的租户
type SaveNamespaceInfo struct {
	WatchNamespaceSets []string
	WatcherID          int
}

// NamespaceInfo 租户信息
type NamespaceInfo struct {
	Namespace string
	IsUsed    bool
	WatcherID int
}

/*
// WebWatcherManagerCfgs 将后端的监视信息由map转换成前端所需的arry
var WebWatcherManagerCfgs []nodes.WatchManagerCfg
*/
type namespacesUseMark struct {
	NamespacesInfo []NamespaceInfo
	AppList        [][]AppInfo
}

//从k8s获取集群namespaces
func getNamespacesFromK8s(url string) (namespaces []string) {
	logdebug.Println(logdebug.LevelDebug, "the URL of getting watcher info", url)

	resp, err := http.Get(url)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return nil
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return nil
	}

	var namespaceList NamespaceList

	json.Unmarshal(body, &namespaceList)

	//namespaceList ....解析 传给 namespaces
	for _, object := range namespaceList.Items {
		namespace := object.Metadata.Name
		if namespace == "default" || namespace == "kube-system" {
			continue
		}
		namespaces = append(namespaces, namespace)
	}

	return
}

func getAppName(obj EndpointObject, jobZoneType string) (appName string) {
	if len(obj.Subsets) == 0 {
		return
	}

	if len(obj.Subsets[0].Addresses) == 0 || len(obj.Subsets[0].Ports) == 0 {
		return
	}

	if obj.Metadata.Labels[jobZoneType] == jobZoneType || "all" == jobZoneType || obj.Metadata.Labels["all"] == "all" {
		appName = obj.Metadata.Name
	}

	return
}

func getAppListFromEpList(epList EndpointsList, jobZoneType string) (appInfoList []AppInfo) {
	for _, object := range epList.Items {
		//获取本租户下的一个ep对象所对应的app信息(1个)
		appName := getAppName(object, jobZoneType)
		appInfo := AppInfo{}
		if appName != "" {
			appInfo.NamespacesApp = appName
			appInfo.AppSrcType = "k8s"
			if object.Metadata.Labels["useProxy"] != "" {
				appInfo.AppSrcType = "extern"
			}

			appInfoList = append(appInfoList, appInfo)
		}
	}

	return
}

//从k8s集群获取租户的详细信息
func getNamespacesDetailInfoFromK8s(getNamespacesURL string, jobZoneType string) (namespacesDetail NamespacesDetailInfo) {
	//从k8s获取到的全部租户
	namespacesList := getNamespacesFromK8s(getNamespacesURL)

	namespacesDetail.NamespacesList = namespacesList

	for _, namespace := range namespacesList {
		getEndpointsURL := getNamespacesURL + "/" + namespace + "/endpoints"
		//拿到本租户下的所有ep(epList中包含了服务名N个)
		endpointList := getServiceFromK8s(getEndpointsURL)

		//解析epList 将N个服务的名字解析出来{"app1","app2",..."appN"}
		appInfoList := getAppListFromEpList(endpointList, jobZoneType)

		namespacesDetail.AppInfoList = append(namespacesDetail.AppInfoList, appInfoList)
	}

	return

}

func getServiceFromK8s(url string) (epList EndpointsList) {
	resp, err := http.Get(url)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
		return
	}
	json.Unmarshal(body, &epList)

	return
}

func (watcherNamespacesInfo *SaveNamespaceInfo) isNamespaceInSet(namespace string) bool {
	for _, usedNamespace := range watcherNamespacesInfo.WatchNamespaceSets {
		if usedNamespace == namespace {
			return true
		}
		continue
	}
	return false
}

func initWebMsg(w http.ResponseWriter, r *http.Request, webAllNamespacesInfo *[]NamespaceInfo) (
	allNamespacesDetailInfoFromK8s NamespacesDetailInfo, jobZoneType string) {
	var kubernetesAPIVersion string
	var kubernetesMasterHost string

	allNodesInfo := nodes.GetAllNodesInfo()

	for _, nodeInfo := range allNodesInfo {
		kubernetesMasterHost = nodeInfo.Client.K8sMasterHost
		kubernetesAPIVersion = nodeInfo.Client.K8sAPIVersion
		//		jobZoneType = nodeInfo.Client.JobZoneType
		break
	}
	r.ParseForm()
	jobZoneType = r.Form.Get("JobZoneType")

	logdebug.Println(logdebug.LevelDebug, "the jobZoneType when getting namesapces info is ：", jobZoneType)
	getNamespacesURL := kubernetesMasterHost +
		"/" +
		kubernetesAPIVersion +
		"/namespaces"

	logdebug.Println(logdebug.LevelDebug, "the URL of getting namespace is:", getNamespacesURL)
	allNamespacesDetailInfoFromK8s = getNamespacesDetailInfoFromK8s(getNamespacesURL, jobZoneType)
	logdebug.Println(logdebug.LevelDebug, "get namespacesInfo from k8s", allNamespacesDetailInfoFromK8s)

	//init 将k8s获取到的所有租户信息 填充到将要发给web前端的数组中
	for _, namespace := range allNamespacesDetailInfoFromK8s.NamespacesList {
		newNamespace := NamespaceInfo{
			Namespace: namespace,
			IsUsed:    false,
		}
		*webAllNamespacesInfo = append(*webAllNamespacesInfo, newNamespace)
	}

	return
}

func getWatchersInfoFromKubeNG(jobZoneType string) (allWatchersNamespacesInfo map[int]SaveNamespaceInfo) {
	allNodesInfo := nodes.GetAllNodesInfo()
	if len(allNodesInfo) == 0 {
		return
	}

	watcherURL := ""
	for key := range allNodesInfo {
		if allNodesInfo[key].Client.JobZoneType != jobZoneType {
			continue
		}

		watcherURL = "http://" +
			allNodesInfo[key].Client.NodeIP +
			allNodesInfo[key].Client.APIServerPort +
			"/" +
			allNodesInfo[key].Client.WatchManagerAPIServerPath

		break
	}
	if watcherURL == "" {
		logdebug.Println(logdebug.LevelError, "can not match the jobZoneType", jobZoneType)
		return
	}

	resp, _ := communicate.SendRequestByJSON(communicate.GET, watcherURL, nil)
	json.Unmarshal(resp, &allWatchersNamespacesInfo)

	return
}

func markUsedNamesapces(webAllNamespacesInfo []NamespaceInfo, allWatchersNamespacesInfo map[int]SaveNamespaceInfo) {

	for _, watcherNamespacesInfo := range allWatchersNamespacesInfo {
		for index, namespaceInfo := range webAllNamespacesInfo {
			//	for _, namespaceInfo := range webAllNamespacesInfo {
			if watcherNamespacesInfo.isNamespaceInSet(namespaceInfo.Namespace) {
				webAllNamespacesInfo[index].IsUsed = true
				webAllNamespacesInfo[index].WatcherID = watcherNamespacesInfo.WatcherID
				//namespaceInfo.IsUsed = true
				//	namespaceInfo.WatcherID = watcherNamespacesInfo.WatcherID
			}
		}
	}

	logdebug.Println(logdebug.LevelDebug, "******the namespacesInfo which already marked*****:", webAllNamespacesInfo)

	return
}

func respToWebFront(w http.ResponseWriter, webAllNamespacesInfo []NamespaceInfo, namespacesDetail NamespacesDetailInfo) {
	webNamespacesResp := namespacesUseMark{
		NamespacesInfo: webAllNamespacesInfo,
		AppList:        namespacesDetail.AppInfoList,
	}

	//通信结构 json格式转换
	jsonTypeMsg, err := json.Marshal(webNamespacesResp)
	if err != nil {
		logdebug.Println(logdebug.LevelError, err)
	}

	w.Write(jsonTypeMsg)

	return
}

//使用界面传过来的IP VERSION获取所要监控的k8s集群租户的详细信息(统计有多少服务)
func getWatchNamespacesDetailInfo(w http.ResponseWriter, r *http.Request) {
	var webAllNamespacesInfo []NamespaceInfo                //from k8s ....modify(填充) ..... to web front
	var allWatchersNamespacesInfo map[int]SaveNamespaceInfo // from kubeng already be watched 租户

	//初始化将要发给前端的所有租户的信息
	namespacesDetail, jobZoneType := initWebMsg(w, r, &webAllNamespacesInfo)
	logdebug.Println(logdebug.LevelDebug, "all of namespacesInfo which is in init status", webAllNamespacesInfo)

	//从kubeng获取已经被监视的租户信息
	allWatchersNamespacesInfo = getWatchersInfoFromKubeNG(jobZoneType)
	logdebug.Println(logdebug.LevelDebug, "the namespacesInfo which were used in web", allWatchersNamespacesInfo)

	markUsedNamesapces(webAllNamespacesInfo, allWatchersNamespacesInfo)
	logdebug.Println(logdebug.LevelDebug, "the namespacesInfo which were marked", webAllNamespacesInfo)

	//将所有标记过的租户传给前端使用
	respToWebFront(w, webAllNamespacesInfo, namespacesDetail)

	return
}
