package nginxcfg

import (
	//"fmt"
	"github.com/emicklei/go-restful"
	"ngfront/logdebug"
	"strings"
)

func (svc *ServiceInfo) compareAllWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "对比的clientID = ", clientsSet)

	return
}

func (svc *ServiceInfo) compareSingleWatchersNginxCfgs(request *restful.Request, response *restful.Response) {
	twoClientIDs := request.PathParameter("clientA-clientB")

	clientsSet := make([]string, 0)

	clientsSet = strings.Split(twoClientIDs, "-")

	logdebug.Println(logdebug.LevelDebug, "对比的clientID = ", clientsSet)

	watcherID := request.PathParameter("watcherID")

	logdebug.Println(logdebug.LevelDebug, "对比的watcherID = ", watcherID)

	return
}
