package watcher

//watcher页面 展示具体的某一台client下的监视器信息 可以编辑
import (
	"encoding/json"
	//"html/template"
	"io/ioutil"
	"net/http"
	"ngfront/logdebug"
	//"ngfront/nodemanager/nodes"
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
	NamespacesList      []string
	NamespacesAppCounts []string
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

//从k8s集群获取租户的详细信息
func getNamespacesDetailInfoFromK8s(getNamespacesURL string) (namespacesDetail NamespacesDetailInfo) {
	namespacesList := getNamespacesFromK8s(getNamespacesURL)

	for _, namespace := range namespacesList {
		getEndpointsURL := getNamespacesURL + "/" + namespace + "/endpoints"
		//Get 统计
		logdebug.Println(logdebug.LevelInfo, getEndpointsURL)
	}

	return

}
