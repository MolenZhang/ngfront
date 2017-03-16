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

type NamespaceList struct {
	Items []NamespaceObject
}

type NamespaceObject struct {
	Metadata NamespaceMetadata
}

type NamespaceMetadata struct {
	Name string
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
