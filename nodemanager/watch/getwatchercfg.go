package watch

import (
	"NgFront/nodemanager/login"
	"NgFront/nodemanager/node"
	"container/list"
	"encoding/json"
	"log"
	"net/http"
)

var watchCfg node.WatchManagerCfg

type WatCfg struct {
	watCfg map[string]watchCfg
}

func GetWatcherCfg() {
	resp, err := http.Get(login.ReqMsg.ReqBody.WatchManagerAPIServer)
	if err != nil {
		log.Println(err)
		return
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return
	}
	var watcherCfg WatCfg
	watcherCfg = make(map[string]watchCfg, 0)

	log.Println(string(body))
	json.Unmarshal(body, &watcherCfg.watCfg[login.ReqMsg.ReqBody.ClientID])
	log.Println(watcherCfg)

}

func NodeRemove(nodeName map[string]WatchManagerCfg, clientID string) {
	delete(nodeName, clientID)
}
