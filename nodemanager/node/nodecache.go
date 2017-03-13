package node

type WatchManagerCfg struct {
	KubernetesMasterHost   string
	KubernetesAPIVersion   string
	NginxReloadCommand     string
	JobZoneType            string
	NginxListenPort        string
	WatchNamespaceSets     string
	NginxRealCfgDirPath    string
	NginxTestCfgDirPath    string
	DownloadCfgDirPath     string
	LogPrintLevel          string
	DefaultNginxServerType string
	DomainSuffix           string
	WorkMode               string
	Langurage              string
	NginxTestCommand       string
	StandbyUpstreamNodes   []string
	K8sWatcherStatus       string
}

type ClientInfo struct {
	NodeIP                   string
	ClientID                 string
	NodeName                 string
	APIServerPort            string
	NginxCfgsAPIServerPath   string
	TestToolAPIServerPath    string
	NodeInfoAPIServerPath    string
	DownloadCfgAPIServerPath string
	WatchManagerAPIServer    string
	JobZoneType              string
}

var AllClientsInfo map[string]ClientInfo
