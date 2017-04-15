// var KubernetesMasterHost = "";
// var KubernetesAPIVersion = ""; 
var JobZoneType = "";
var WatchNamespaceSets = "";
var NodeIPInfo ="";
var ClientIDInfo = "";
var WatcherID = "";
var areaIP = "localhost";
var areaPort = "port";
$(document).ready(function () {
	var locationUrl = window.location;
	//http://172.16.13.110:8083/ngfront/zone/clients/watcher?NodeIP=10.10.3.9&ClientID=21343&areaType=user
	NodeIPInfo = locationUrl.search.substring(locationUrl.search.indexOf("NodeIP=")+7,locationUrl.search.indexOf("&C"));
	ClientIDInfo = locationUrl.search.substring(locationUrl.search.indexOf("ClientID=")+9,locationUrl.search.indexOf("&a"));
	var areaTypeInfo = locationUrl.search.substring(locationUrl.search.indexOf("areaType=")+9,locationUrl.search.indexOf("&Watcher"));
	WatcherID = locationUrl.search.substring(locationUrl.search.indexOf("WatcherID=")+10,locationUrl.search.length);

	showWatcher(NodeIPInfo,ClientIDInfo);
	
	 $(document).on('click','.fa-nodeEdit',function(){
		 $(this).parent().hide();
		 $(this).parent().next().show();
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
		 $(".btn-toNginx").attr("disabled",true);
		 //$(".btn-download").attr("disabled",true);
		 $("#K8sWatcherStatus").empty().append("stop");
		 $(".btn-start").empty().html("开始监控");
		 stopControl(NodeIPInfo,ClientIDInfo);
	 });
	//开始监控按钮
	$(document).on('click','.btn-start',function(){
		 var startSrc = '/images/running.gif';
		 $(this).parent().find("img").attr("src",startSrc);
		 $(this).empty().html("重新监控");
		 $(".btn-stop").attr("disabled",false);
		 $(".btn-toNginx").attr("disabled",false);
		 //$(".btn-download").attr("disabled",false);
		 $("#K8sWatcherStatus").empty().append("start");
		 watcherSubmit(NodeIPInfo,ClientIDInfo);
	 });
	//进入Nginx配置管理界面
	$(document).on('click','.btn-toNginx',function(){
		// location.href = "/ngfront/zone/clients/watcher/nginxcfg?NodeIP="+NodeIPInfo+"&ClientID="+ClientIDInfo+"&KubernetesMasterHost="+KubernetesMasterHost+"&KubernetesAPIVersion="+KubernetesAPIVersion+"&JobZoneType="+JobZoneType+"&WatcherID="+WatcherID ;
		location.href = "/ngfront/zone/clients/watcher/nginxcfg?NodeIP="+NodeIPInfo+"&ClientID="+ClientIDInfo+"&JobZoneType="+JobZoneType+"&WatcherID="+WatcherID ;
	 });
	
	//租户监控checkbox   保存按钮
	
	$(document).on('click','#watcherCfgHtmlSaveBtn',function(){
		
			$("#WatchNamespaceSetsOldVal").empty();
			var namespacesChk = $(".namespacesChk:checked");
			if(namespacesChk.length != 0){
				var namespacesSaveHtml = "";
				for(var namespacesNum = 0; namespacesNum<namespacesChk.length; namespacesNum++){
					//namespacesChk[namespacesNum].getAttribute("value");
					namespacesSaveHtml += namespacesChk[namespacesNum].getAttribute("value")+',';
				}
				namespacesSaveHtml = namespacesSaveHtml.substring(0,namespacesSaveHtml.length-1);
				$("#WatchNamespaceSetsOldVal").append(namespacesSaveHtml);
				$(this).parent().hide();
				$(this).parent().prev().show();
			}else{
				alert("请选择租户");
			}
		
		
	}); 
	//编辑租户监控checkbox
	$(document).on('click','#editNamespacesBtn',function(){
		showNamespaces(KubernetesMasterHost,KubernetesAPIVersion);
		$(this).parent().hide();
		$(this).parent().next().show();
		
	});
	
	//k8s Api 版本  保存按钮
	//$("#KubernetesAPIVersionSaveBtn").unbind().click(function(){
	// $(document).on('click','#KubernetesAPIVersionSaveBtn',function(){
	// 	//alert("#KubernetesAPIVersionSaveBtn")
	// 	var changeVal = $("#KubernetesAPIVersionInfo").val();
	// 	$("#KubernetesAPIVersionOldVal").empty().append(changeVal);
	// 	var KubernetesMasterHostVal = $("#KubernetesMasterHostOldVal").html();
	// 	$("#namespacesInfo").empty();
	// 	//showNamespacesEcharts(KubernetesMasterHostVal,changeVal,JobZoneType)
	//  });
	//日志打印级别  保存按钮
	// $("#LogPrintLevelInfo").unbind().click(function(){
	// 	alert("LogPrintLevelInfo;");
	// 	var changeVal = $("#LogPrintLevelInfo").val();
	// 	$("#LogPrintLevelOldVal").empty().append(changeVal);
	// });
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
	// $(document).on('click','#KubernetesMasterHostSaveBtn',function(){
	// 	var changeVal = $("#KubernetesMasterHostInfo").val();
	// 	$("#KubernetesMasterHostOldVal").empty().append(changeVal);
	// });
	//nginx监听端口
	$(document).on('click','#NginxListenPortSaveBtn',function(){
		var changeVal = $("#NginxListenPortInfo").val();
		$("#NginxListenPortOldVal").empty().append(changeVal);
	});
	
	//nginx 重载命令 保存按钮
	$(document).on('click','#NginxReloadCommandSaveBtn',function(){
		var changeVal = $("#NginxReloadCommandInfo").val();
		$("#NginxReloadCommandOldVal").empty().append(changeVal);
	});
	//真实配置文件生成路径 保存按钮
	$(document).on('click','#NginxRealCfgDirPathSaveBtn',function(){
		var changeVal = $("#NginxRealCfgDirPathInfo").val();
		$("#NginxRealCfgDirPathOldVal").empty().append(changeVal);
	});
	//测试配置文件生成路径 保存按钮
	$(document).on('click','#NginxTestCfgDirPathSaveBtn',function(){
		var changeVal = $("#NginxTestCfgDirPathInfo").val();
		$("#NginxTestCfgDirPathOldVal").empty().append(changeVal);
	});
	//配置下载路径 保存按钮
	$(document).on('click','#DownloadCfgDirPathSaveBtn',function(){
		var changeVal = $("#DownloadCfgDirPathInfo").val();
		$("#DownloadCfgDirPathOldVal").empty().append(changeVal);
	});
	//域名后缀 保存按钮
	$(document).on('click','#DomainSuffixSaveBtn',function(){
		var changeVal = $("#DomainSuffixInfo").val();
		$("#DomainSuffixOldVal").empty().append(changeVal);
	});
	//nginx配置规则检查命令  保存按钮
	$(document).on('click','#NginxTestCommandSaveBtn',function(){
		var changeVal = $("#NginxTestCommandInfo").val();
		$("#NginxTestCommandOldVal").empty().append(changeVal);
	});
	//备用upstream服务器节点 保存按钮
	// $(document).on('click','#StandbyUpstreamNodesSaveBtn',function(){
	// 	var changeVal = $("#StandbyUpstreamNodesInfo").val();
	// 	$("#StandbyUpstreamNodesOldVal").empty().append(changeVal);
	// });
	
	$(document).on('click','.namespacesLabel',function(){
		if(this.getAttribute("isUsed")=="true"&&this.getAttribute("evewatcherid")!=WatcherID){
			return false;
		}
	});
	
	 
 });/*reday*/

  function showWatcher(NodeIPInfo,ClientIDInfo){
	var watcherUrl = "http://"+areaIP+":"+areaPort+"/watchers/watcher/"+WatcherID;
	$.ajax({
		"url":watcherUrl,
		"type":"get",
		"data":{
			"NodeIP":NodeIPInfo,
			"ClientID":ClientIDInfo
		},
		"success":function(data){
			var objTestWatcher = data;
			//var objTestWatcher = eval("("+data+")");

			var watcherNodeIP = objTestWatcher.Client.NodeIP;
			var watcherClientID = objTestWatcher.Client.ClientID;
			var NodeName = objTestWatcher.Client.NodeName;
			var APIServerPort = objTestWatcher.Client.APIServerPort.substring(1,objTestWatcher.Client.APIServerPort.length);
				
				
			KubernetesMasterHost = objTestWatcher.Watcher.KubernetesMasterHost;
			KubernetesAPIVersion = objTestWatcher.Watcher.KubernetesAPIVersion;
			var NginxReloadCommand = objTestWatcher.Watcher.NginxReloadCommand;
			JobZoneType = objTestWatcher.Watcher.JobZoneType;
			var NginxListenPort = objTestWatcher.Watcher.NginxListenPort;
			WatchNamespaceSets = objTestWatcher.Watcher.WatchNamespaceSets;
			var NginxRealCfgDirPath = objTestWatcher.Watcher.NginxRealCfgDirPath;
			var NginxTestCfgDirPath = objTestWatcher.Watcher.NginxTestCfgDirPath;
			var DownloadCfgDirPath = objTestWatcher.Watcher.DownloadCfgDirPath;
			//var LogPrintLevel = objTestWatcher.Watcher.LogPrintLevel;
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
							//'<button class="btn btn-info btn-download" onclick="nginxExport(this)">下载Nginx配置</button>';
			}else{
				imgHtml = '<img src="/images/stop.png" alt=""/>'+
							'<button class="btn btn-info btn-start">开始监控</button>'+
							'<button class="btn btn-info btn-stop" disabled>停止监控</button>'+
							'<button class="btn btn-info btn-toNginx" disabled>Nginx配置</button>';
							//'<button class="btn btn-info btn-download" onclick="nginxExport(this)">下载Nginx配置</button>';
			}
			$("#imgStatusInfo").append(imgHtml);
			var watcherCfgHtml = '';
			watcherCfgHtml += '<tr>'+
									'<td style="width:27%">k8s Master节点IP端口</td>'+
											'<td class="firstTd"><span id="KubernetesMasterHostOldVal" value="'+KubernetesMasterHost+'">'+KubernetesMasterHost+'</span><i class="fa fa-edit fa-nodeEdit hide"></i></td>'+
											//'<td class="editItem"><input class="editInput" id="KubernetesMasterHostInfo" type="text" placeholder="" name="KubernetesMasterHost" value="'+KubernetesMasterHost+'">'+
											//'<i class="fa fa-save fa-nodeSave" id="KubernetesMasterHostSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">k8s Api 版本</td>'+
											'<td><span id="KubernetesAPIVersionOldVal">'+KubernetesAPIVersion+'</span><i class="fa fa-edit fa-nodeEdit hide"></i></td>'+
											// '<td class="editItem" id="apiVersion"><select id="KubernetesAPIVersionInfo" name="KubernetesAPIVersion">'+
											// '<option value="api/v1">api/v1</option>'+
											// '<option value="api">api</option>'+
											// '</select>'+
											// '<button class="btn btn-danger btn-xs btn-apiVersion" id="KubernetesAPIVersionSaveBtn">获取租户</button><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">nginx 重载命令</td>'+
											'<td><span id="NginxReloadCommandOldVal">'+NginxReloadCommand+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxReloadCommandInfo" type="text" value="'+NginxReloadCommand+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxReloadCommandSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">工作区类型</td>'+
											'<td><span id="JobZoneTypeOldVal">'+JobZoneType+'</span></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">nginx监听端口</td>'+
											'<td><span id="NginxListenPortOldVal">'+NginxListenPort+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input type="number" class="editInput" id="NginxListenPortInfo" type="text" value="'+NginxListenPort+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxListenPortSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">监控租户集合</td>'+
											'<td><span id="WatchNamespaceSetsOldVal">'+WatchNamespaceSets+'</span><i class="fa fa-edit fa-nodeEdit" id="editNamespacesBtn"></i></td>'+
											'<td class="editItem editNamespacesTd"><span id="namespacesInfo"></span>'+
											'<i class="fa fa-save fa-nodeSave" id="watcherCfgHtmlSaveBtn"></i></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">真实配置文件生成路径</td>'+
											'<td><span id="NginxRealCfgDirPathOldVal">'+NginxRealCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxRealCfgDirPathInfo" type="text" value="'+NginxRealCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxRealCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">测试配置文件生成路径</td>'+
											'<td><span id="NginxTestCfgDirPathOldVal">'+NginxTestCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxTestCfgDirPathInfo" type="text" value="'+NginxTestCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxTestCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">配置下载路径</td>'+
											'<td><span id="DownloadCfgDirPathOldVal">'+DownloadCfgDirPath+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="DownloadCfgDirPathInfo" type="text" value="'+DownloadCfgDirPath+'">'+
											'<i class="fa fa-save fa-nodeSave" id="DownloadCfgDirPathSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										/*'<tr>'+
											'<td class="firstTd">日志打印级别</td>'+
											'<td><span id="LogPrintLevelOldVal">'+LogPrintLevel+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="LogPrintLevelInfo"><option vlaue="info">info</option><option value="debug">debug</option><option value="warn">warn</option><option value="error">error</option><option value="fatal">fatal</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="LogPrintLevelSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+*/
										'<tr>'+
											'<td class="firstTd">nginx server类型</td>'+
											'<td><span id="DefaultNginxServerTypeOldVal">'+DefaultNginxServerType+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="DefaultNginxServerTypeInfo"><option value="domain">domain</option><option value="ip">ip</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="DefaultNginxServerTypeSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">域名后缀</td>'+
											'<td><span id="DomainSuffixOldVal">'+DomainSuffix+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="DomainSuffixInfo" type="text" value="'+DomainSuffix+'">'+
											'<i class="fa fa-save fa-nodeSave" id="DomainSuffixSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">工作模式</td>'+
											'<td><span id="WorkModeOldVal">'+WorkMode+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><select id="WorkModeInfo"><option value="k8snginx">k8snginx</option><option value="kubeng">kubeng</option></select>'+
											'<i class="fa fa-save fa-nodeSave" id="WorkModeSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										'<tr>'+
											'<td class="firstTd">nginx配置规则检查命令</td>'+
											'<td><span id="NginxTestCommandOldVal">'+NginxTestCommand+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
											'<td class="editItem"><input class="editInput" id="NginxTestCommandInfo" type="text" value="'+NginxTestCommand+'">'+
											'<i class="fa fa-save fa-nodeSave" id="NginxTestCommandSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										'</tr>'+
										// '<tr>'+
										// 	'<td class="firstTd">备用upstream服务器节点</td>'+
										// 	'<td><span id="StandbyUpstreamNodesOldVal">'+StandbyUpstreamNodes+'</span><i class="fa fa-edit fa-nodeEdit"></i></td>'+
										// 	'<td class="editItem"><input class="editInput" id="StandbyUpstreamNodesInfo" type="text" name="StandbyUpstreamNodes" value="'+StandbyUpstreamNodes+'">'+
										// 	'<i class="fa fa-save fa-nodeSave" id="StandbyUpstreamNodesSaveBtn"></i><i class="fa fa-times fa-nodeTimes"></i></td>'+
										// '</tr>'+
										'<tr>'+
											'<td class="firstTd">K8s监视器工作状态</td>'+
											'<td><span id="K8sWatcherStatus">'+K8sWatcherStatus+'<span></td>'+
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
			
			showNamespacesEcharts(KubernetesMasterHost,KubernetesAPIVersion,JobZoneType);
		}
	});
}

//生成监控echart图
function showNamespacesEcharts(KubernetesMasterHost,KubernetesAPIVersion,JobZoneType){
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces";
	
	$.ajax({
		"url":apiVersionUrl,
		"type":"get",
		"data":{
			"KubernetesMasterHost":KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion,
			"JobZoneType":JobZoneType
		},
		"success":function(data){
			var data = eval("("+data+")");
			var NamespacesInfos = data.NamespacesInfo;
			var NamespacesList = new Array();
			for(var namespacesNum=0; namespacesNum<NamespacesInfos.length; namespacesNum++){
				NamespacesList.push(NamespacesInfos[namespacesNum].Namespace);
			}
			var NamespacesAppCounts = data.AppList;
			//echart画图位置
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
					                   end: 100
					               },
					               {
					                   type: 'inside',
					                   realtime: true,
					                   start: 0,
					                   end: 100
					               }
					           ],
					    xAxis : [],
					    yAxis : [
					        {
					            type : 'value'
					        }
					    ],
					    series : []
					};
			//node上租户的个数
			var optionxAxis = {
					            type : 'category',
					            data : NamespacesList,
					            axisTick: {
					                alignWithLabel: true
					            }
					        }
			option.xAxis.push(optionxAxis);
			//租户中服务的个数
			var NamespacesSerNum = new Array();
			if(NamespacesAppCounts != null){
				for(var i = 0; i<NamespacesAppCounts.length; i++){
					var eveNamespacesNum = 0;
					if(NamespacesAppCounts[i] != null){
						eveNamespacesNum = NamespacesAppCounts[i].length;
					}
					NamespacesSerNum.push(eveNamespacesNum);
				}
				var optionSeries = {
						        name:'服务个数',
						        type:'bar',
						        barWidth: '60%',
						        data: NamespacesSerNum 
						    };
				option.series.push(optionSeries);
				myChart.setOption(option);
			}
			
		}
	});
}
//生成配置中的租户项
function showNamespaces(KubernetesMasterHost,KubernetesAPIVersion){
	
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces";
	$.ajax({
		"url":apiVersionUrl,
		"type":"get",
		"data":{
			"KubernetesMasterHost":KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion,
			"JobZoneType":JobZoneType
		},
		"success":function(data){
			var data = eval("("+data+")");
			var NamespacesInfos = data.NamespacesInfo;
			
			var namespacesHtml = "";
			for(var namespacesNum=0; namespacesNum<NamespacesInfos.length; namespacesNum++){
				var eveNamespace = NamespacesInfos[namespacesNum].Namespace;
				var eveIsUsedStatue = NamespacesInfos[namespacesNum].IsUsed;
				var eveWatcherID = NamespacesInfos[namespacesNum].WatcherID;
				if(eveIsUsedStatue == true && eveWatcherID !=WatcherID){
					namespacesHtml += '<label class="namespacesLabel" isUsed="'+eveIsUsedStatue+'" eveWatcherID="'+eveWatcherID+'" style="cursor:no-drop;text-decoration: line-through"><input type="checkbox" class="namespacesChk name_'+eveNamespace+'" value="'+eveNamespace+'">'+eveNamespace+'</label>';
				}else{
					namespacesHtml += '<label class="namespacesLabel" isUsed="'+eveIsUsedStatue+'" eveWatcherID="'+eveWatcherID+'"><input type="checkbox" class="namespacesChk name_'+eveNamespace+'" value="'+eveNamespace+'">'+eveNamespace+'</label>';
				}
			}
			$("#namespacesInfo").empty().append(namespacesHtml);
			
			//WatchNamespaceSets=["daien", "hahaha"]
			for( var n=0; n<WatchNamespaceSets.length; n++){
				var checkedNamespaces = '.name_'+WatchNamespaceSets[n];
				$(checkedNamespaces).prop("checked",true);
			}
		}
	});
}

//提交watcher表单
function watcherSubmit(NodeIPInfo,ClientIDInfo){
	var submitUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID;
	
				
	var KubernetesMasterHost = $("#KubernetesMasterHostOldVal").html();
	var KubernetesAPIVersion =$("#KubernetesAPIVersionOldVal").html();
	var NginxReloadCommand = $("#NginxReloadCommandOldVal").html();
	var JobZoneType = $("#JobZoneTypeOldVal").html();
	var NginxListenPort = $("#NginxListenPortOldVal").html();
	var WatchNamespaceSets = $("#WatchNamespaceSetsOldVal").html().split(",");
	var NginxRealCfgDirPath = $("#NginxRealCfgDirPathOldVal").html();
	var NginxTestCfgDirPath = $("#NginxTestCfgDirPathOldVal").html();
	var DownloadCfgDirPath = $("#DownloadCfgDirPathOldVal").html();
	//var LogPrintLevel = $("#LogPrintLevelOldVal").html();
	var DefaultNginxServerType = $("#DefaultNginxServerTypeOldVal").html();
	var DomainSuffix = $("#DomainSuffixOldVal").html();
	var WorkMode = $("#WorkModeOldVal").html();
	var NginxTestCommand = $("#NginxTestCommandOldVal").html();
	var StandbyUpstreamNodes = $("#StandbyUpstreamNodesOldVal").html().split(",");
	var K8sWatcherStatus = "start";
	var WebMsg = {
		"NodeIP": NodeIPInfo,
		"ClientID": ClientIDInfo,
		"WatcherCfg": {
			"KubernetesMasterHost": KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion,
			"NginxReloadCommand":NginxReloadCommand,
			"JobZoneType":JobZoneType,
			"NginxListenPort":NginxListenPort,
			"WatchNamespaceSets":WatchNamespaceSets,
			"NginxRealCfgDirPath":NginxRealCfgDirPath,
			"NginxTestCfgDirPath":NginxTestCfgDirPath,
			"DownloadCfgDirPath":DownloadCfgDirPath,
			//"LogPrintLevel":LogPrintLevel,
			"DefaultNginxServerType":DefaultNginxServerType,
			"DomainSuffix":DomainSuffix,
			"WorkMode":WorkMode,
			"NginxTestCommand":NginxTestCommand,
		    "StandbyUpstreamNodes": StandbyUpstreamNodes,
		    "K8sWatcherStatus":K8sWatcherStatus
		}
	};
	
	//var	JsonTypeWebMsg = eval("(" + WebMsg + ")");	
			
	$.ajax({
    		url : submitUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "put",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: JSON.stringify(WebMsg),
			
    		success : function(data) {
				data = eval("(" + data + ")");
    			
    			/*data = eval("(" + data + ")");
    			if (data.status=="400") {
    				
    			} else if (data.status=="500") {
    				
    			}else {
    				
    			}*/
    		}
    	});
}

//停止监控
function stopControl(NodeIPInfo,ClientIDInfo){
	var submitUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID;
	
	var KubernetesMasterHost = $("#KubernetesMasterHostOldVal").html();
	var KubernetesAPIVersion =$("#KubernetesAPIVersionOldVal").html();
	var NginxReloadCommand = $("#NginxReloadCommandOldVal").html();
	var JobZoneType = $("#JobZoneTypeOldVal").html();
	var NginxListenPort = $("#NginxListenPortOldVal").html();
	var WatchNamespaceSets = $("#WatchNamespaceSetsOldVal").html().split(",");
	var NginxRealCfgDirPath = $("#NginxRealCfgDirPathOldVal").html();
	var NginxTestCfgDirPath = $("#NginxTestCfgDirPathOldVal").html();
	var DownloadCfgDirPath = $("#DownloadCfgDirPathOldVal").html();
	//var LogPrintLevel = $("#LogPrintLevelOldVal").html();
	var DefaultNginxServerType = $("#DefaultNginxServerTypeOldVal").html();
	var DomainSuffix = $("#DomainSuffixOldVal").html();
	var WorkMode = $("#WorkModeOldVal").html();
	var NginxTestCommand = $("#NginxTestCommandOldVal").html();
	var StandbyUpstreamNodes = $("#StandbyUpstreamNodesOldVal").html().split(",");
	var K8sWatcherStatus = "stop";
	var WebMsg = {
		"NodeIP": NodeIPInfo,
		"ClientID": ClientIDInfo,
		"WatcherCfg": {
			"KubernetesMasterHost": KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion,
			"NginxReloadCommand":NginxReloadCommand,
			"JobZoneType":JobZoneType,
			"NginxListenPort":NginxListenPort,
			"WatchNamespaceSets":WatchNamespaceSets,
			"NginxRealCfgDirPath":NginxRealCfgDirPath,
			"NginxTestCfgDirPath":NginxTestCfgDirPath,
			"DownloadCfgDirPath":DownloadCfgDirPath,
			//"LogPrintLevel":LogPrintLevel,
			"DefaultNginxServerType":DefaultNginxServerType,
			"DomainSuffix":DomainSuffix,
			"WorkMode":WorkMode,
			"NginxTestCommand":NginxTestCommand,
		    "StandbyUpstreamNodes": StandbyUpstreamNodes,
		    "K8sWatcherStatus":K8sWatcherStatus
		}
	};
	
	$.ajax({
    		url : submitUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "put",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: JSON.stringify(WebMsg),
			
    		success : function(data) {
				data = eval("(" + data + ")");
    		}
    	});
}

/**
	 * 导出一个node的配置信息
	 * @param obj
	 */
	// function nginxExport(obj){
	//         	var downloadData={
	//         		"NodeIP": NodeIPInfo,
	//         		"ClientID":ClientIDInfo
	//         	};
	// 			var downloadUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/download';
	//         	$.ajax({
	// 				url : downloadUrl,
	// 	    		type: "get", 
	// 				data: downloadData,
	// 				success :function(data){
	// 		//	location.href = 'http://'+areaIP+':'+areaPort+'/nginxcfg/download?NodeIP='+NodeIPInfo+'&ClientID='+ClientIDInfo+'&User='+ngDownUser+'&Password='+ngDownPwd;
	// 			location.href = data.NginxCfgDownloadURL
			
	// 				}
	// 			});
	// }

	

	// function ngDownLoadPath(path){
	// 	try {
 //        var Message = "\u8bf7\u9009\u62e9\u6587\u4ef6\u5939"; //选择框提示信息
 //        var Shell = new ActiveXObject("Shell.Application");
 //        var Folder = Shell.BrowseForFolder(0, Message, 64, 17); //起始目录为：我的电脑
 //        //var Folder = Shell.BrowseForFolder(0, Message, 0); //起始目录为：桌面
 //        if (Folder != null) {
 //            Folder = Folder.items(); // 返回 FolderItems 对象
 //            Folder = Folder.item(); // 返回 Folderitem 对象
 //            Folder = Folder.Path; // 返回路径
 //            if (Folder.charAt(Folder.length - 1) != "\\") {
 //                Folder = Folder + "\\";
 //            }
 //            document.getElementById(ngDownLoadPath).value = Folder;
 //            return Folder;
 //        }
	//     }
	//     catch (e) {
	//         alert(e.message);
	//     }
	// }
function areaRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront";
}
function clientsRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients?areaType="+JobZoneType;
}	
function watcherRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients/watcher?NodeIP="+NodeIPInfo+"&ClientID="+ClientIDInfo+"&areaType="+JobZoneType;
}

