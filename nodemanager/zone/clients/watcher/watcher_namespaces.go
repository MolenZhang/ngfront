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
	NamespacesList    []string
	NamespacesAppList [][]string
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

//从k8s获取集群namespaces
func getNamespacesFromK8s(url string) (namespaces []string) {
	logdebug.Println(logdebug.LevelDebug, "请求watcher 数据 url=", url)

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

	if obj.Metadata.Labels[jobZoneType] == jobZoneType {
		appName = obj.Metadata.Name
	}

	return
}

func getAppListFromEpList(epList EndpointsList, jobZoneType string) (appList []string) {
	for _, object := range epList.Items {
		//获取本租户下的一个ep对象所对应的app信息(1个)
		appName := getAppName(object, jobZoneType)
		if appName != "" {
			appList = append(appList, appName)
		}
	}

	return
}

//从k8s集群获取租户的详细信息
func getNamespacesDetailInfoFromK8s(getNamespacesURL string, jobZoneType string) (namespacesDetail NamespacesDetailInfo) {
	namespacesList := getNamespacesFromK8s(getNamespacesURL)
	namespacesDetail.NamespacesList = namespacesList

	for _, namespace := range namespacesList {
		getEndpointsURL := getNamespacesURL + "/" + namespace + "/endpoints"
		//拿到本租户下的所有ep(epList中包含了服务名N个)
		endpointList := getServiceFromK8s(getEndpointsURL)
		//解析epList 将N个服务的名字解析出来{"app1","app2",..."appN"}
		namespacesDetail.NamespacesAppList = append(namespacesDetail.NamespacesAppList, getAppListFromEpList(endpointList, jobZoneType))
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
