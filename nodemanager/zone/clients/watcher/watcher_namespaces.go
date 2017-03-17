package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"ngfront/logdebug"
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

//NamespacesDetailInfo 租户列表详细信息
type NamespacesDetailInfo struct {
<<<<<<< HEAD
	NamespacesList    []string
	NamespacesAppList [][]string
}

type EndpointsList struct {
	Items []EndpointObject
}

type EndpointObject struct {
	Metadata EndpointMetadata
	Subsets  []EndpointSubset
}

type EndpointMetadata struct {
	Name      string
	Namespace string
}

type EndpointSubset struct {
	Addresses []AddressObject
	Ports     []PortsObject
}

type AddressObject struct {
	IP string
}

type PortsObject struct {
	Port int
=======
	NamespacesList      []string
	NamespacesAppCounts [][]string
>>>>>>> 20b58e004a2c9588577d8c34c8b249ae101b959a
}

//从k8s获取集群namespaces
func getNamespacesFromK8s(url string) (namespaces []string) {
	logdebug.Println(logdebug.LevelInfo, "-----请求watcher 数据 url=", url)

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

func getAppName(obj EndpointObject) (appName string) {
	if len(obj.Subsets) == 0 {
		return
	}

	if len(obj.Subsets[0].Addresses) == 0 || len(obj.Subsets[0].Ports) == 0 {
		return
	}

	//	zone := getZoneType() //"dmz"

	//	if obj.Metadata.Labels[zone] == zone {
	appName = obj.Metadata.Name
	//	}

	return
}

func getAppListFromEpList(epList EndpointsList) (appList []string) {
	for _, object := range epList.Items {
		//获取本租户下的一个ep对象所对应的app信息(1个)
		appName := getAppName(object)
		if appName != "" {
			appList = append(appList, appName)
		}
	}

	return
}

//从k8s集群获取租户的详细信息
func getNamespacesDetailInfoFromK8s(getNamespacesURL string) (namespacesDetail NamespacesDetailInfo) {
	namespacesList := getNamespacesFromK8s(getNamespacesURL)
	namespacesDetail.NamespacesList = namespacesList
<<<<<<< HEAD

	for _, namespace := range namespacesList {
		getEndpointsURL := getNamespacesURL + "/" + namespace + "/endpoints"
		//拿到本租户下的所有ep(epList中包含了服务名N个)
		endpointList := getServiceFromK8s(getEndpointsURL)
		//解析epList 将N个服务的名字解析出来{"app1","app2",..."appN"}
		namespacesDetail.NamespacesAppList = append(namespacesDetail.NamespacesAppList, getAppListFromEpList(endpointList))
=======
	namespacesDetail.NamespacesList = []string{"租户1", "租户2", "租户3"}

	for _, namespace := range namespacesList {
		getEndpointsURL := getNamespacesURL + "/" + namespace + "/endpoints"
		//Get 统计
		logdebug.Println(logdebug.LevelInfo, getEndpointsURL)

	}

	namespacesDetail.NamespacesAppCounts = [][]string{
		{"服务1", "服务2", "服务3"},
		{"服务21", "服务22", "服务23"},
		{"服务31", "服务32", "服务33"},
>>>>>>> 20b58e004a2c9588577d8c34c8b249ae101b959a
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
