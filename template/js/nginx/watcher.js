var KubernetesMasterHost= "";
var KubernetesAPIVersion=""; 
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
		 $(this).attr("disabled",true);
	 });
	//开始监控按钮
	$(document).on('click','.btn-start',function(){
		 var startSrc = '/images/running.gif';
		 $(this).parent().find("img").attr("src",startSrc);
		 $(".btn-stop").attr("disabled",false);
	 });
	//进入Nginx配置管理界面
	$(document).on('click','.btn-toNginx',function(){
		 location.href = "file:///C:/Users/Administrator/Desktop/src/views/nginx/k8snginxcfg.html" ;
	 });
	
	//租户监控checkbox   保存按钮
	$(document).on('click','#saveNamespaces',function(){
		$("#namespacesSaveInfo").empty();
		var namespacesChk = $(".namespacesChk:checked");
		if(namespacesChk.length != 0){
			var namespacesSaveHtml = "";
			for(var namespacesNum = 0; namespacesNum<namespacesChk.length; namespacesNum++){
				//namespacesChk[namespacesNum].getAttribute("value");
				namespacesSaveHtml += namespacesChk[namespacesNum].getAttribute("value")+',';
			}
			namespacesSaveHtml = namespacesSaveHtml.substring(1,namespacesSaveHtml.length-1);
			$("#namespacesSaveInfo").append(namespacesSaveHtml);
			$(this).parent().hide();
			$(this).parent().next().show();
		}else{
			alert("请选择租户");
		}
	}); 
	//编辑租户监控checkbox
	$(document).on('click','#editNamespaces',function(){
		$(this).parent().hide();
		$(this).parent().prev().show();
	});
	
	//k8s Api 版本  保存按钮
	$(document).on('click','#KubernetesAPIVersionSaveBtn',function(){
		var changeVal = $("#KubernetesAPIVersionInfo").val();
		$("#KubernetesAPIVersionOldVal").empty().append(changeVal);
		 apiVersionSave(KubernetesMasterHost,KubernetesAPIVersion);
	 });
	//日志打印级别  保存按钮
	$(document).on('click','#LogPrintLevelSaveBtn',function(){
		var changeVal = $("#LogPrintLevelInfo").val();
		$("#LogPrintLevelOldVal").empty().append(changeVal);
	});
	//nginx server类型  保存按钮
	$(document).on('click','#DefaultNginxServerTypeSaveBtn',function(){
		var changeVal = $("#DefaultNginxServerTypeInfo").val();
		$("#DefaultNginxServerTypeOldVal").empty().append(changeVal);
	});
	//工作模式  保存按钮
	$(document).on('click','#WorkModeSaveBtn',function(){
		var changeVal = $("#WorkModeInfo").val();
		$("#WorkModeOldVal").empty().append(changeVal);
	});
	
	//k8s Master节点IP端口 保存按钮
	$(document).on('click','#KubernetesMasterHostSaveBtn',function(){
		var changeVal = $("#KubernetesMasterHostInfo").val();
		$("#KubernetesMasterHostOldVal").empty().append(changeVal);
	});
	//nginx 重载命令 保存按钮
	$(document).on('click','#NginxReloadCommandSaveBtn',function(){
		var changeVal = $("#NginxReloadCommandInfo").val();
		$("#NginxReloadCommandOldVal").empty().append(changeVal);
	});
	//真实配置文件生成路径 保存按钮
	$(document).on('click','#NginxRealCfgDirPathSaveBtn',function(){
		var changeVal = $("#NginxRealCfgDirPathOldVal").val();
		$("#NginxRealCfgDirPathOldVal").empty().append(changeVal);
	});
	//测试配置文件生成路径 保存按钮
	$(document).on('click','#NginxTestCfgDirPathSaveBtn',function(){
		var changeVal = $("#NginxTestCfgDirPathOldVal").val();
		$("#NginxTestCfgDirPathOldVal").empty().append(changeVal);
	});
	//配置下载路径 保存按钮
	$(document).on('click','#DownloadCfgDirPathSaveBtn',function(){
		var changeVal = $("#DownloadCfgDirPathOldVal").val();
		$("#DownloadCfgDirPathOldVal").empty().append(changeVal);
	});
	//域名后缀 保存按钮
	$(document).on('click','#DomainSuffixSaveBtn',function(){
		var changeVal = $("#DomainSuffixOldVal").val();
		$("#DomainSuffixOldVal").empty().append(changeVal);
	});
	//nginx配置规则检查命令  保存按钮
	$(document).on('click','#NginxTestCommandSaveBtn',function(){
		var changeVal = $("#NginxTestCommandOldVal").val();
		$("#NginxTestCommandOldVal").empty().append(changeVal);
	});
	//备用upstream服务器节点 保存按钮
	$(document).on('click','#StandbyUpstreamNodesSaveBtn',function(){
		var changeVal = $("#StandbyUpstreamNodesOldVal").val();
		$("#StandbyUpstreamNodesOldVal").empty().append(changeVal);
	});
	
	
	
	
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients/watcher?NodeIP=192.168.252.133&ClientID=35734
	 var NodeIPInfo = locationUrl.search.substring(locationUrl.search.indexOf("NodeIP=")+7,locationUrl.search.indexOf("&"));
	 var ClientIDInfo = locationUrl.search.substring(locationUrl.search.indexOf("ClientID=")+9,locationUrl.search.length);
	 showWatcher(NodeIPInfo,ClientIDInfo);
	
	
	
	 
 });/*reday*/

  function showWatcher(NodeIPInfo,ClientIDInfo){
	var areaIP = "192.168.252.133";
	var areaPort = "8011";
	var watcherUrl = "http://"+areaIP+":"+areaPort+"/watcher";
	$.ajax({
		"url":watcherUrl,
		"type":"get",
		"data":{
			"NodeIP":NodeIPInfo,
			"ClientID":ClientIDInfo
		},
		"success":function(data){
		var objTestWatcher = eval("("+data+")");
	
		var watcherNodeIP = objTestWatcher.Client.NodeIP;
		var watcherClientID = objTestWatcher.Client.ClientID;
		var NodeName = objTestWatcher.Client.NodeName;
		var APIServerPort = objTestWatcher.Client.APIServerPort.substring(1,objTestWatcher.Client.APIServerPort.length);
			
			
		KubernetesMasterHost = objTestWatcher.Watcher.KubernetesMasterHost;
		KubernetesAPIVersion = objTestWatcher.Watcher.KubernetesAPIVersion;
		var NginxReloadCommand = objTestWatcher.Watcher.NginxReloadCommand;
		var JobZoneType = objTestWatcher.Watcher.JobZoneType;
		var NginxListenPort = objTestWatcher.Watcher.NginxListenPort;
		var WatchNamespaceSets = objTestWatcher.Watcher.WatchNamespaceSets;
		var NginxRealCfgDirPath = objTestWatcher.Watcher.NginxRealCfgDirPath;
		var NginxTestCfgDirPath = objTestWatcher.Watcher.NginxTestCfgDirPath;
		var DownloadCfgDirPath = objTestWatcher.Watcher.DownloadCfgDirPath;
		var LogPrintLevel = objTestWatcher.Watcher.LogPrintLevel;
		var DefaultNginxServerType = objTestWatcher.Watcher.DefaultNginxServerType;
		var DomainSuffix = objTestWatcher.Watcher.DomainSuffix;
		var WorkMode = objTestWatcher.Watcher.WorkMode;
		var NginxTestCommand = objTestWatcher.Watcher.NginxTestCommand;
		var StandbyUpstreamNodes = objTestWatcher.Watcher.StandbyUpstreamNodes;
		var K8sWatcherStatus = objTestWatcher.Watcher.K8sWatcherStatus;
		var imgHtml = "";
			if(K8sWatcherStatus == "start"){
				imgHtml = '<img src="/images/running.gif" alt=""/>'+
							'<button class="btn btn-info btn-start">重启监控</button>'+
							'<button class="btn btn-info btn-stop">停止监控</button>'+
							'<button class="btn btn-info btn-toNginx">Nginx配置</button>';
			}else{
				imgHtml = '<img src="/images/stop.png" alt=""/>'+
							'<button class="btn btn-info btn-start">开始监控</button>'+
							'<button class="btn btn-info btn-stop" disabled>停止监控</button>'+
							'<button class="btn btn-info btn-toNginx">Nginx配置</button>';
			}
			$("#imgStatusInfo").append(imgHtml);
			var watcherCfgHtml = '<tr>'+
											'<td>k8s Master节点IP端口</td>'+
											'<td><span id="KubernetesMasterHostOldVal">'+KubernetesMasterHost+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="KubernetesMasterHostInfo" type="text" placeholder="" value="'+KubernetesMasterHost+'">'+
											'<i class="fa fa-save fa-nodeSave" id="KubernetesMasterHostSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>k8s Api 版本</td>'+
											'<td><span id="KubernetesAPIVersionOldVal">'+KubernetesAPIVersion+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem" id="apiVersion"><select id="KubernetesAPIVersionInfo">'+
											'<option value="api/v1">api/v1</option>'+
											'<option value="api">api</option>'+
											'</select>'+
											'<i class="fa fa-save fa-nodeSave" id="KubernetesAPIVersionSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx 重载命令</td>'+
											'<td><span id="NginxReloadCommandOldVal">'+NginxReloadCommand+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxReloadCommandInfo" type="text" value="'+NginxReloadCommand+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxReloadCommandSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
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
											'<td><span id="namespacesInfo"></span>'+WatchNamespaceSets+'<i class="fa fa-save" id="saveNamespaces"></i></td>'+
											'<td class="editItem editNamespacesTd"><span id="namespacesSaveInfo"></span><i class="fa fa-edit" id="editNamespaces"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>真实配置文件生成路径</td>'+
											'<td><span id="NginxRealCfgDirPathOldVal">'+NginxRealCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxRealCfgDirPathInfo" type="text" value="'+NginxRealCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxRealCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>测试配置文件生成路径</td>'+
											'<td><span id="NginxTestCfgDirPathOldVal">'+NginxTestCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxTestCfgDirPathInfo" type="text" value="'+NginxTestCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxTestCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>配置下载路径</td>'+
											'<td><span id="DownloadCfgDirPathOldVal">'+DownloadCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="DownloadCfgDirPathInfo" type="text" value="'+DownloadCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="DownloadCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>日志打印级别</td>'+
											'<td><span id="LogPrintLevelOldVal">'+LogPrintLevel+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="LogPrintLevelInfo"><option vlaue="info">info</option><option value="debug">debug</option><option value="warn">warn</option><option value="error">error</option><option value="fatal">fatal</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="LogPrintLevelSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx server类型</td>'+
											'<td><span id="DefaultNginxServerTypeOldVal">'+DefaultNginxServerType+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="DefaultNginxServerTypeInfo"><option value="domain">domain</option><option value="ip">ip</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="DefaultNginxServerTypeSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>域名后缀</td>'+
											'<td><span id="DomainSuffixOldVal">'+DomainSuffix+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="DomainSuffixInfo" type="text" value="'+DomainSuffix+'">'+
											'<i class="fa fa-save fa-nodeSave" id="DomainSuffixSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>工作模式</td>'+
											'<td><span id="WorkModeOldVal">'+WorkMode+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="WorkModeInfo"><option value="k8snginx">k8snginx</option><option value="kubeng">kubeng</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="WorkModeSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>nginx配置规则检查命令</td>'+
											'<td><span id="NginxTestCommandOldVal">'+NginxTestCommand+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><inpu class="editInput" id="NginxTestCommandInfo" type="text" value="'+NginxTestCommand+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxTestCommandSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>备用upstream服务器节点</td>'+
											'<td><span id="StandbyUpstreamNodesOldVal">'+StandbyUpstreamNodes+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="StandbyUpstreamNodesInfo" type="text" value="'+StandbyUpstreamNodes+'">'+
											'<i class="fa fa-save fa-nodeSave" id="StandbyUpstreamNodesSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td>K8s监视器工作状态</td>'+
											'<td><span id="K8sWatcherStatus">'+K8sWatcherStatus+'<span></td>'+
										'</tr>';
			$("#watcherCfgInfo").append(watcherCfgHtml);

			
//			var apiVersionHtml = "";
//			if(KubernetesMasterHost != ""||KubernetesMasterHost!= null){
//				apiVersionHtml = "<select name='KubernetesAPIVersion' id='KubernetesAPIVersion'>"+
//									"<option value='api/v1'>api/v1</option>"+
//									"<option value='api'>api</option>"+
//									"</select>"+
//									"<i class='fa fa-save fa-nodeSave' id='apiVersionSave'></i>";
//			}
//			$("#apiVersion").append(apiVersionHtml);
			
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
			loadNamespaces(KubernetesMasterHost,KubernetesAPIVersion)
			apiVersionSave(KubernetesMasterHost,KubernetesAPIVersion);
		}
	});
}

//点击apiVersion按钮生成监控列表
function apiVersionSave(KubernetesMasterHost,KubernetesAPIVersion){
	var areaIP = "192.168.252.133";
	var areaPort = "8011";
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces";
	$.ajax({
		"url":apiVersionUrl,
		"type":"get",
		"data":{
			"KubernetesMasterHost":KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion
		},
		"success":function(data){
			var optionxAxisData = eval("("+data+")");
			
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
					    xAxis : [],
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
					            data:[3, 4, 6, 1, 7,3, 4, 6, 1]
					        }
					    ]
					};
					var optionxAxis = {
					            type : 'category',
					            data : optionxAxisData,
					            axisTick: {
					                alignWithLabel: true
					            }
					        }
			option.xAxis.push(optionxAxis);
			myChart.setOption(option);
		}
	});
}

//生成监控租户集合
function loadNamespaces(KubernetesMasterHost,KubernetesAPIVersion){
	var areaIP = "192.168.252.133";
	var areaPort = "8011";
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces";
	$.ajax({
		"url":apiVersionUrl,
		"type":"get",
		"data":{
			"KubernetesMasterHost":KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion
		},
		"success":function(data){
			var namespacesData = eval("("+data+")");
			var namespacesHtml = "";
			for(var i=0; i<namespacesData.length; i++){
				var eveNamespace = namespacesData[i];
				namespacesHtml += '<label class="namespacesLabel"><input type="checkbox" class="namespacesChk" value="'+eveNamespace+'">'+eveNamespace+'</label>';
			}
			$("#namespacesInfo").append(namespacesHtml);
		}
	})
}