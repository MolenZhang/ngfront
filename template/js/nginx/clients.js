 var areaType = "";
 $(document).ready(function () {
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients?areaType=user
	areaType=locationUrl.search.substring(locationUrl.search.indexOf("=")+1,locationUrl.search.length); 
	
	showClients(areaType);
	
 });/*reday*/

function showClients(areaType){
	var areaIP = "localhost";
	var areaPort = "port";
	var areaUrl = "http://"+areaIP+":"+areaPort+"/clients";
	var watcherUrl = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients/watcher?NodeIP=";
	$.ajax({
		"url":areaUrl,
		"type":"get",
		"success":function(data){
			var objTest = eval("("+data+")");
			var optionDataNum = "";
	 var dataType = "";
	 var dataNum = "";
	 var tbodyHtml = "";
	 for(var areaNum = 0; areaNum< objTest.length; areaNum++){
		 dataType = objTest[areaNum].JobZoneType;
		 if(dataType!=""){
			 
			 //第二个界面
			 if(dataType == areaType){
			 	var clientsVal = objTest[areaNum].Clients;
			 	var clientsHtml = "";
			 	for(var i=0; i<clientsVal.length;i++){
			 		var NodeIP = clientsVal[i].NodeIP;
			 		var NodeName = clientsVal[i].NodeName;
			 		var ClientID = clientsVal[i].ClientID;
			 		var APIServerPort = clientsVal[i].APIServerPort.substring(1,clientsVal[i].APIServerPort.length);;
			 		var K8sWatcherStatus = clientsVal[i].K8sWatcherStatus
			 		var statusHtml = "";
			 		if(K8sWatcherStatus == "start"){
			 			statusHtml = '<img src="/images/running.gif" alt=""/>&nbsp;工作中';
			 		}else{
			 			statusHtml = '<img src="/images/stop.png" alt=""/>&nbsp;未工作';
			 		}
			 		clientsHtml += '<tr>'+
                                    		'<td style="text-indent: 30px;">'+
                                    		'<input type="checkbox" class="chkNodeItem" name="ids" NodeIP="'+NodeIP+'" ClientID="'+ClientID+'"></td>'+
											'<td class="statusImg">'+statusHtml+'</td>'+
                                    		'<td>'+ClientID+'</td>'+
                                    		'<td>'+NodeName+'</td>'+
                                    		'<td>'+NodeIP+'</td>'+
                                    		'<td>'+APIServerPort+'</td>'+
                                    		'<td class="operationBtns">'+
                                    			'<a><i class="fa fa-play hide"></i></a>'+
                                    			'<a><i class="fa fa-power-off hide"></i></a>'+
                                    			'<a href="'+watcherUrl+NodeIP+'&ClientID='+ClientID+'&areaType='+areaType+'"><i class="fa fa-gear"></i></a>'+
                                    		'</td>'+
                                    	'</tr>';
			 	}
			 	$("#clientsList").append(clientsHtml);
			 }
			  
		 }
		 
	 }
		}
	})
}
/*下发配置*/

function issuedCfg(){
	$("#JobZoneTypeOldVal").append(areaType);
	layer.open({
		type: 1,
		title: '下发配置',
		area: ['800px'],
		content: $("#issuedCfgInfo"),
		btn: ['确定','取消'],
		yes: function(index,layero){
			var areaIP = "localhost";
			var areaPort = "port";
			var issuedUrl = "http://"+areaIP+":"+areaPort+"/watcher"+areaType;

			var KubernetesMasterHost = $("#KubernetesMasterHostInfo").val();
			var KubernetesAPIVersion =$("#KubernetesAPIVersionInfo").val();
			var NginxReloadCommand = $("#NginxReloadCommandInfo").val();
			var NginxListenPort = $("#NginxListenPortInfo").val();
			var WatchNamespaceSets = new Array();
			if($(".namespaceAll").css("display")=="none"){
				var namespacesChk = $(".namespacesChk:checked");
				for(var nNum=0; nNum<namespacesChk.length; nNum++){
					WatchNamespaceSets.push(namespacesChk[nNum].value);
				}
			}else{
				WatchNamespaceSets= ["all"];
			}

			var NginxRealCfgDirPath = $("#NginxRealCfgDirPathInfo").val();
			var NginxTestCfgDirPath = $("#NginxTestCfgDirPathInfo").val();
			var DownloadCfgDirPath = $("#DownloadCfgDirPathInfo").val();
			var LogPrintLevel = $("#LogPrintLevelInfo").val();
			var DefaultNginxServerType = $("#DefaultNginxServerTypeInfo").val();
			var DomainSuffix = $("#DomainSuffixInfo").val();
			var WorkMode = $("#WorkModeInfo").val();
			var NginxTestCommand = $("#NginxTestCommandInfo").val();
			var StandbyUpstreamNodes = $("#StandbyUpstreamNodesInfo").val().split(",");

			var BatchNodesInfo = new Array();
			var checkedNodeItems = $(".chkNodeItem:checked");
			for(var nodeNum=0; nodeNum< checkedNodeItems.length;nodeNum++){
				var checkedNode = {
					"NodeIP": checkedNodeItems[nodeNum].getAttribute("NodeIP"),
					"ClientID": checkedNodeItems[nodeNum].getAttribute("ClientID")
				}
				BatchNodesInfo.push(checkedNode);
			}
			
			
			var issuedCfgDataInfo = {
				"BatchNodesInfo":BatchNodesInfo,
				"WatcherCfg": {
					"KubernetesMasterHost": KubernetesMasterHost,
					"KubernetesAPIVersion":KubernetesAPIVersion,
					"NginxReloadCommand":NginxReloadCommand,
					"JobZoneType":areaType,
					"NginxListenPort":NginxListenPort,
					"WatchNamespaceSets":WatchNamespaceSets,
					"NginxRealCfgDirPath":NginxRealCfgDirPath,
					"NginxTestCfgDirPath":NginxTestCfgDirPath,
					"DownloadCfgDirPath":DownloadCfgDirPath,
					"LogPrintLevel":LogPrintLevel,
					"DefaultNginxServerType":DefaultNginxServerType,
					"DomainSuffix":DomainSuffix,
					"WorkMode":WorkMode,
					"NginxTestCommand":NginxTestCommand,
				    "StandbyUpstreamNodes": StandbyUpstreamNodes,
				}
			};

			$.ajax({
				url : issuedUrl,
				dataType: "json",
				contentType: "text/html; charset=UTF-8",
		    	type: "post", 
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				data: JSON.stringify(issuedCfgDataInfo),
				success :function(data){
					var data=data;

				}
			})
			layer.close(index);
		}
	})
}

function loadNamespaces(){
	$(".namespaceAll").hide();
	$(".editNamespacesTd").removeClass("hide");
	var KubernetesMasterHost = $("#KubernetesMasterHostInfo").val();
	var KubernetesAPIVersion = $("#KubernetesAPIVersionInfo").val();
	var areaIP = "localhost";
	var areaPort = "port";
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces";
	
	$.ajax({
		"url":apiVersionUrl,
		"type":"get",
		"data":{
			"KubernetesMasterHost":KubernetesMasterHost,
			"KubernetesAPIVersion":KubernetesAPIVersion,
			"JobZoneType":areaType
		},
		"success":function(data){
			var data = eval("("+data+")");
			var NamespacesList = data.NamespacesList;
			var namespacesHtml = "";
			if(NamespacesList != null){
				for(var i=0; i<NamespacesList.length; i++){
					var	eveNamespace = NamespacesList[i];
					namespacesHtml += '<label class="namespacesLabel"><input type="checkbox" class="namespacesChk" value="'+eveNamespace+'">'+eveNamespace+'</label>';
				}
				$("#namespacesInfo").empty().append(namespacesHtml);
			}
		}
	});
}
