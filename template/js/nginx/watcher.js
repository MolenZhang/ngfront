 $(document).ready(function () {
	 $(document).on('click','.fa-nodeEdit',function(){
		 $(this).parent().hide();
		 $(this).parent().next().css("display","block");
	 });
	 
	 $(document).on('click','.fa-nodeSave',function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 $(document).on('click','.fa-nodeTimes',function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 
	 //停止监控按钮
	 $(document).on('click','.btn-stop',function(){
		 var stopSrc = '/images/stop.png';
		 $(this).parent().find("img").attr("src",stopSrc);
	 });
	//停止监控按钮
	$(document).on('click','.btn-start',function(){
		 var startSrc = '/images/running.gif';
		 $(this).parent().find("img").attr("src",startSrc);
	 });
	//进入Nginx配置管理界面
	$(document).on('click','.btn-toNginx',function(){
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
	
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients/watcher?NodeIP=192.168.252.133&ClientID=35734
	//var areaType=locationUrl.search.substring(locationUrl.search.indexOf("NodeIP=")+1,locationUrl.search.indexOf("&")); 
	 var NodeIPInfo = locationUrl.search.substring(locationUrl.search.indexOf("NodeIP=")+7,locationUrl.search.indexOf("&"));
	 var ClientIDInfo = locationUrl.search.substring(locationUrl.search.indexOf("ClientID=")+9,locationUrl.search.length);
	 showWatcher(NodeIPInfo,ClientIDInfo);
	 
 });/*reday*/
 
  function showWatcher(NodeIPInfo,ClientIDInfo){
	var areaIP = "localhost";
	var areaPort = "port";
	var watcherUrl = "http://"+areaIP+":"+areaPort+"/watcher";
	$.ajax({
		"url":watcherUrl,
		"type":"get",
		"data":{
			"NodeIP":NodeIPInfo,
			"ClientID":ClientIDInfo
		},
		"success":function(data){
			var data = eval("("+data+")");
			alert(data);
		}
	});
	var objTestWatcher = [
				    {
				    	"ClientInfo": {
				    		"NodeIP": "192.168.252.133",
				       		"NodeName": "192.168.252.133",
		                	"ClientID": "35734",
		               	 	"APIServerPort": ":8886"
				    	},
				        
				        "WatchManagerCfg": {
				                "KubernetesMasterHost": "http://192.168.0.75:8080",
				                "KubernetesAPIVersion": "api/v1",
				                "NginxReloadCommand": "nginx -s reload",
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
				                "K8sWatcherStatus":"start",
				            }
				    }
				];

	for(var i=0; i<objTestWatcher.length; i++){
		var watcherNodeIP = objTestWatcher[i].ClientInfo.NodeIP;
		var watcherClientID = objTestWatcher[i].ClientInfo.ClientID;
		if(watcherNodeIP == NodeIPInfo && watcherClientID == ClientIDInfo){
			var NodeName = objTestWatcher[i].ClientInfo.NodeName;
			var APIServerPort = objTestWatcher[i].ClientInfo.APIServerPort.substring(1,objTestWatcher[i].ClientInfo.APIServerPort.length);
			var K8sWatcherStatus = objTestWatcher[i].ClientInfo.K8sWatcherStatus;
			
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
			var imgHtml = "";
			if(K8sWatcherStatus == "start"){
				imgHtml = '<img src="/images/running.gif" alt=""/>'+
							'<button class="btn btn-info btn-start">重启监控</button>'+
							'<button class="btn btn-info btn-stop">停止监控</button>'+
							'<button class="btn btn-info btn-toNginx">Nginx配置</button>';
			}else{
				imgHtml = '<img src="/images/stop.png" alt=""/>'
							'<button class="btn btn-info btn-start">开始监控</button>'+
							'<button class="btn btn-info btn-stop" disabled>停止监控</button>'+
							'<button class="btn btn-info btn-toNginx">Nginx配置</button>';
			}
			$("#imgStatusInfo").append(imgHtml);
			var watcherCfgHtml = '<tr>'+
											'<td>k8s Master节点IP端口</td>'+
											'<td>'+KubernetesMasterHost+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+KubernetesMasterHost+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>k8s Api 版本</td>'+
											'<td>'+KubernetesAPIVersion+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select><option>'+KubernetesAPIVersion+'</option></select><i class="fa fa-save fa-nodeSave"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx 重载命令</td>'+
											'<td>'+NginxReloadCommand+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+NginxReloadCommand+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>工作区类型</td>'+
											'<td>'+JobZoneType+'</td>'+
											
										'</tr>'+
										'<tr>'+
											'<td>nginx监听端口</td>'+
											'<td>'+NginxListenPort+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select><option>'+NginxListenPort+'</option></select><i class="fa fa-save fa-nodeSave"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>监控租户集合</td>'+
											'<td>'+WatchNamespaceSets+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+WatchNamespaceSets+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>真实配置文件生成路径</td>'+
											'<td>'+NginxRealCfgDirPath+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+NginxRealCfgDirPath+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>测试配置文件生成路径</td>'+
											'<td>'+NginxTestCfgDirPath+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+NginxTestCfgDirPath+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>配置下载路径</td>'+
											'<td>'+DownloadCfgDirPath+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+DownloadCfgDirPath+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>日志打印级别</td>'+
											'<td>'+LogPrintLevel+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+LogPrintLevel+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx server类型</td>'+
											'<td>'+DefaultNginxServerType+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" vlaue="'+DefaultNginxServerType+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>域名后缀</td>'+
											'<td>'+DomainSuffix+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+DomainSuffix+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>工作模式</td>'+
											'<td>'+WorkMode+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+WorkMode+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx配置规则检查命令</td>'+
											'<td>'+NginxTestCommand+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+NginxTestCommand+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>备用upstream服务器节点</td>'+
											'<td>'+StandbyUpstreamNodes+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+StandbyUpstreamNodes+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>K8s监视器工作状态</td>'+
											'<td>'+K8sWatcherStatus+'<i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="text" value="'+K8sWatcherStatus+'"><i class="fa fa-save fa-nodeSave"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>';
			$("#watcherCfgInfo").append(watcherCfgHtml);
			
			var watcherBasicHtml = '<tr>'+
											'<td>客户端ID</td>'+
											'<td>'+watcherClientID+'</td>'+
										'</tr>'+
										'<tr>'+
											'<td>节点名称</td>'+
											'<td>'+NodeName+'</td>'+
										'</tr>'+
										'<tr>'+
											'<td>节点IP</td>'+
											'<td>'+watcherNodeIP+'</td>'+
										'</tr>'+
										'<tr>'+
											'<td>APIServer端口</td>'+
											'<td>'+APIServerPort+'</td>'+
										'</tr>';
			$("#watcherBasicInfo").append(watcherBasicHtml);
			
		}
	}
}