 $(document).ready(function () {
	 $(".fa-nodeEdit").click(function(){
		 $(this).parent().hide();
		 $(this).parent().next().css("display","block");
	 });
	 
	 $(".fa-nodeSave").click(function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 
	 $(".fa-nodeTimes").click(function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 
	 //停止监控按钮
	 $(".btn-stop").click(function(){
		 var stopSrc = ctx +'/images/stop.png';
		 $(this).parent().find("img").attr("src",stopSrc);
	 });
	//停止监控按钮
	 $(".btn-start").click(function(){
		 var startSrc = ctx +'/images/running.gif';
		 $(this).parent().find("img").attr("src",startSrc);
	 });
	//进入Nginx配置管理界面
	 $(".btn-toNginx").click(function(){
		 location.href = "file:///C:/Users/Administrator/Desktop/src/views/nginx/k8snginxcfg.html" ;
	 });
	 
	 
	 var myChart = echarts.init(document.getElementById('main'));
	 option = {
			    color: ['#3398DB'],
			    title: {
			        text: '该节点各租户中服务个数'
			    },
			    tooltip : {
			        trigger: 'axis',
			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
			        }
			    },
			    grid: {
			        left: '3%',
			        right: '4%',
			        bottom: '12%',
			        containLabel: true
			    },
			    dataZoom: [
			               {
			                   show: true,
			                   realtime: true,
			                   start: 0,
			                   end: 30
			               },
			               {
			                   type: 'inside',
			                   realtime: true,
			                   start: 0,
			                   end: 30
			               }
			           ],
			    xAxis : [
			        {
			            type : 'category',
			            data : ['user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5'],
			            axisTick: {
			                alignWithLabel: true
			            }
			        }
			    ],
			    yAxis : [
			        {
			            type : 'value'
			        }
			    ],
			    series : [
			        {
			            name:'服务个数',
			            type:'bar',
			            barWidth: '60%',
			            data:[3, 4, 6, 1, 7,3, 4, 6, 1, 7,3, 4, 6, 1, 7,3, 4, 6, 1, 7]
			        }
			    ]
			};

	 myChart.setOption(option);
	 var NodeIPInfo = "192.168.252.133";
	 var ClientIDInfo = "8039";
	 showWatcher(NodeIPInfo,ClientIDInfo);
	 
 });/*reday*/
 
  function showWatcher(NodeIPInfo,ClientIDInfo){
	var objTestWatcher = [
				    {
				    	"ClientInfo": {
				    		"NodeIP": "192.168.252.133",
				       		"NodeName": "192.168.252.133",
		                	"ClientID": "8039",
		               	 	"APIServerPort": ":8886",
		                	"K8sWatcherStatus": "stop",
				    	},
				        
				        "WatchManagerCfg": {
				                "KubernetesMasterHost": "http://192.168.0.75:8080",
				                "KubernetesAPIVersion": "api/v1",
				                "NginxReloadCommand": ":nginx -s reload",
				                "JobZoneType": "dmz",
				                "NginxListenPort":"80",
				                "WatchNamespaceSets":"全租户监控",
				                "NginxRealCfgDirPath":"/etc/nginx/conf.d/real_cfg/",
				                "NginxTestCfgDirPath":"/etc/nginx/conf.d/test_cfg/",
				                "DownloadCfgDirPath":"/etc/nginx/conf.d/download_cfg/",
				                "LogPrintLevel":"info",
				                "DefaultNginxServerType":"domain",
				                "DomainSuffix":"yz.local",
				                "WorkMode":"k8snginx",
				                "NginxTestCommand":"nginx -t",
				                "StandbyUpstreamNodes":"{{1.1.1.1},{2.2.2.2},{3.3.3.3}}",
				                "K8sWatcherStatus":"stop",
				            }
				    }
				];

	for(var i=0; i<objTestWatcher.length; i++){
		var watcherNodeIP = objTestWatcher[i].ClientInfo.NodeIP;
		var watcherClientID = objTestWatcher[i].ClientInfo.ClientID;
		if(watcherNodeIP == NodeIPInfo && watcherClientID == ClientIDInfo){
			var KubernetesMasterHost = objTestWatcher[i].WatchManagerCfg.KubernetesMasterHost;
			var KubernetesAPIVersion = objTestWatcher[i].WatchManagerCfg.KubernetesAPIVersion;
			var NginxReloadCommand = objTestWatcher[i].WatchManagerCfg.NginxReloadCommand;
			var JobZoneType = objTestWatcher[i].WatchManagerCfg.JobZoneType;
			var NginxListenPort = objTestWatcher[i].WatchManagerCfg.NginxListenPort;
			var WatchNamespaceSets = objTestWatcher[i].WatchManagerCfg.WatchNamespaceSets;
			var NginxRealCfgDirPath = objTestWatcher[i].WatchManagerCfg.NginxRealCfgDirPath;
			var NginxTestCfgDirPath = objTestWatcher[i].WatchManagerCfg.NginxTestCfgDirPath;
			var DownloadCfgDirPath = objTestWatcher[i].WatchManagerCfg.DownloadCfgDirPath;
			var LogPrintLevel = objTestWatcher[i].WatchManagerCfg.LogPrintLevel;
			var DefaultNginxServerType = objTestWatcher[i].WatchManagerCfg.DefaultNginxServerType;
			var DomainSuffix = objTestWatcher[i].WatchManagerCfg.DomainSuffix;
			var WorkMode = objTestWatcher[i].WatchManagerCfg.WorkMode;
			var NginxTestCommand = objTestWatcher[i].WatchManagerCfg.NginxTestCommand;
			var StandbyUpstreamNodes = objTestWatcher[i].WatchManagerCfg.StandbyUpstreamNodes;
			var K8sWatcherStatus = objTestWatcher[i].WatchManagerCfg.K8sWatcherStatus;
			var watcherCfgHtml = "";
		}
	}
}