 var JobZoneType = "";
 var areaIP = "";
 var areaPort = "";
 $(document).ready(function () {
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients?areaType=user
	JobZoneType=locationUrl.search.substring(locationUrl.search.indexOf("=")+1,locationUrl.search.length); 
	
	showClients(JobZoneType);

	 //全选
	$(".chkAll").click(function(){
	    $(this).parents('table').find(".chkNodeItem").prop('checked',$(".chkAll").is(":checked"));
	    if($(".chkNodeItem:checked").length!=0){
	    	$(".issuedBtn").removeClass("no-drop");
	    }else{
	    	$(".issuedBtn").addClass("no-drop");
	    }
	});
 
    // 每条数据 checkbox class设为 chkItem
    $(document).on("click",".chkNodeItem", function(){
        if($(this).is(":checked")){
            if ($(this).parents('table').find(".chkNodeItem:checked").length == $(this).parents('table').find(".chkNodeItem").length) {
            	$(this).parents('table').find(".chkAll").prop("checked", "checked");
            }
        }else{
        	$(this).parents('table').find(".chkAll").prop('checked', $(this).is(":checked"));
        }
        if($(".chkNodeItem:checked").length!=0){
	    	$(".issuedBtn").removeClass("no-drop");
	    }else{
	    	$(".issuedBtn").addClass("no-drop");
	    }
    });
    // 每条数据 checkbox class设为 chkItem
    $(document).on("click",".chkWatcherItem", function(){
        if($(this).is(":checked")){
            if ($(this).parents('table').find(".chkWatcherItem:checked").length == $(this).parents('table').find(".chkWatcherItem").length) {
            	$(this).parents('table').find(".chkAll").prop("checked", "checked");
            }
        }else{
        	$(this).parents('table').find(".chkAll").prop('checked', $(this).is(":checked"));
        }
    });

    $(document).on('click','.namespacesLabel',function(){
		if(this.getAttribute("isUsed")=="true"){
			return false;
		}
	});
	
 });/*reday*/

function showClients(JobZoneType){
	areaIP = $("#areaIP").val();
	areaPort = $("#areaPort").val();
	var areaUrl = "http://"+areaIP+":"+areaPort+"/clients";
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
			 if(dataType == JobZoneType){
			 	var clientsVal = objTest[areaNum].Clients;
			 	var clientsHtml = "";
			 	for(var i=0; i<clientsVal.length;i++){
			 		var NodeIP = clientsVal[i].NodeIP;
			 		var NodeName = clientsVal[i].NodeName;
			 		var ClientID = clientsVal[i].ClientID;
			 		var APIServerPort = clientsVal[i].APIServerPort.substring(1,clientsVal[i].APIServerPort.length);;
			 		//var K8sWatcherStatus = clientsVal[i].K8sWatcherStatus
			 		var statusHtml = "";
			 		/*if(K8sWatcherStatus == "start"){
			 			statusHtml = '<img src="/images/running.gif" alt=""/>&nbsp;工作中';
			 		}else{
			 			statusHtml = '<img src="/images/stop.png" alt=""/>&nbsp;未工作';
			 		}*/
			 		clientsHtml += '<tr ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'+
                                    '<td style="text-indent: 10px;text-align:center">'+
                                    '<input type="checkbox" class="chkItem chkNodeItem" name="ids" NodeIP="'+NodeIP+'" ClientID="'+ClientID+'"></td>'+	
                                    '<td onclick="watcherAll(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'" class="caretTd"><a><i class="fa fa-caret-right" flag="1"></i></a></td>'+
                                    '<td>'+ClientID+'</td>'+
                                    '<td>'+NodeName+'</td>'+
                                    '<td>'+NodeIP+'</td>'+
                                    '<td>'+APIServerPort+'</td>'+
                                    '<td class="operationBtns" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'+
                                    	'<a class="floatLeft" onclick="watcherNginxExport(this)"><i>下载配置</i></a>'+
                                    	'<a class="floatLeft" onclick="compareClient(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'"><i>对比</i></a>'+
                                    	'<ul class="nav navbar-nav floatLeft" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'+
                                    	'<li class="dropdown"><a class="dropdown-toggle nginxTools" data-toggle="dropdown"><em>Nginx工具</em><b class="caret"></b></a>'+
                                    	'<ul class="dropdown-menu">'+
                                    	'<li onclick="nginxTool(this)" status="start"><a>start</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="stop"><a>stop</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="test"><a>test</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="restart"><a>restart</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="reload"><a>reload</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="run"><a>run</a></li>'+
                                    	'<li onclick="nginxTool(this)" status="killall"><a>killall</a></li>'+
                                    	'</ul>'+
                                    	'</li>'+
                                    	'</ul></div>'+
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

function issuedCfg(obj){
	if($(obj).attr("class").indexOf("no-drop")!=-1){
		return
	}else{

	$("#JobZoneTypeOldVal").empty().append(JobZoneType);
	layer.open({
		type: 1,
		title: '下发配置',
		area: ['800px'],
		content: $("#issuedCfgInfo"),
		btn: ['确定','取消'],
		yes: function(index,layero){
			var issuedUrl = "http://"+areaIP+":"+areaPort+"/watcher/all";

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
			//var LogPrintLevel = $("#LogPrintLevelInfo").val();
			var DefaultNginxServerType = $("#DefaultNginxServerTypeInfo").val();
			var DomainSuffix = $("#DomainSuffixInfo").val();
			var WorkMode = $("#WorkModeInfo").val();
			var NginxTestCommand = $("#NginxTestCommandInfo").val();
			//var StandbyUpstreamNodes = $("#StandbyUpstreamNodesInfo").val().split(",");

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
				    //"StandbyUpstreamNodes": StandbyUpstreamNodes,
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
}

function loadNamespaces(){
	$(".namespaceAll").hide();
	$(".editNamespacesTd").removeClass("hide");
	var KubernetesMasterHost = $("#KubernetesMasterHostInfo").val();
	var KubernetesAPIVersion = $("#KubernetesAPIVersionInfo").val();
	var apiVersionUrl = "http://"+areaIP+":"+areaPort+"/namespaces?JobZoneType="+JobZoneType;
	
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
				if(eveIsUsedStatue == true){
					namespacesHtml += '<label class="namespacesLabel" isUsed="'+eveIsUsedStatue+'" eveWatcherID="'+eveWatcherID+'" style="cursor:no-drop;text-decoration: line-through"><input type="checkbox" class="namespacesChk name_'+eveNamespace+'" value="'+eveNamespace+'">'+eveNamespace+'</label>';
				}else{
					namespacesHtml += '<label class="namespacesLabel" isUsed="'+eveIsUsedStatue+'" eveWatcherID="'+eveWatcherID+'"><input type="checkbox" class="namespacesChk name_'+eveNamespace+'" value="'+eveNamespace+'">'+eveNamespace+'</label>';
				}
			}
			$("#addnamespacesInfo").empty().append(namespacesHtml);
		}
	});
}

/*展开*/
function watcherAll(obj){

	var thisFlag = $(obj).find("i").attr("flag");
	if(thisFlag==1){
		
		$(obj).empty().html('<a><i class="fa fa-caret-down" flag="2"></i></a>');
		watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
		var ClientID = $(obj).attr("ClientID");
		var NodeIP = $(obj).attr("NodeIP");
		
		$.ajax({
		    url : watchersUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
			type: "get", 
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: {
				"ClientID":ClientID,
				"NodeIP":NodeIP
			},
			success :function(data){
				var data=data;
				var watchersHtml1 = showWatcherHtml(data,ClientID,NodeIP);
				$(obj).parent().after(watchersHtml1);
			}
				
		});
	}else{
		$(obj).parent().parent().parent().find("tr.needHideWatcher").hide();
		$(obj).empty().html('<a><i class="fa fa-caret-right" flag="1"></i></a>');
	}
}
function showWatcherHtml(data,ClientID,NodeIP){
	var watcherHtmlUrl = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients/watcher?NodeIP="+NodeIP+'&ClientID='+ClientID+'&areaType='+JobZoneType+'&WatcherID=';
	var watchersHtml = '<tr class="needHideWatcher" style="background-color:#ddd">'
					   +'<th colspan="2">&nbsp;</th>'
                       +'<th>watcherID</th>'
                       +'<th>工作状态</th>'
                       +'<th>监控的租户</th>'
                       +'<th>监控端口</th>'
                       +'<th style="text-indent: 10px;">操作</th>'
                       +'</tr>';
    
	for(var wNum=0; wNum<data.length;wNum++){
		var WatcherID = data[wNum].WatcherID;
		var K8sWatcherStatus = data[wNum].K8sWatcherStatus;
		var NginxListenPort = data[wNum].NginxListenPort;
		var K8sWatcherStatusHtml = "";
		var WatchNamespaceSets = data[wNum].WatchNamespaceSets;
		if(K8sWatcherStatus == "stop"){
			K8sWatcherStatusHtml = '<img src="../../images/stop.png" alt=""/>&nbsp;未工作';
		}else{
			K8sWatcherStatusHtml = '<img src="../../images/running.gif" alt=""/>&nbsp;已工作';
		}
		watchersHtml +='<tr class="needHideWatcher" style="background-color:#ddd" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'
				    +'<td colspan="2">&nbsp;</td>'
					+'<td>'+WatcherID+'</td>'
					+'<td class="statusImg">'+K8sWatcherStatusHtml+'</td>'
					+'<td>'+WatchNamespaceSets+'</td>'
					+'<td>'+NginxListenPort+'</td>'
					+'<td class="operationBtns" WatcherID="'+WatcherID+'">'
					+'<a onclick="stopOneWatcher(this)" class="'+K8sWatcherStatus+'_stopBtn"><i>停止</i></a>'
					+'<a onclick="startOneWatcher(this)" class="'+K8sWatcherStatus+'_startBtn"><i>启动</i></a>'
					+'<a href="'+watcherHtmlUrl+WatcherID+'"><i>编辑</i></a>'
					+'<a onclick="compareClientOneWatcher(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'"><i>对比</i></a>'
					//+'<a onclick="delOneWatcher(this)"><i>删除</i></a></td>'
					+'</tr>';
		}

	return watchersHtml;
	
}

/*新增*/
function addOneWatcher(obj){
	$("#addJobZoneTypeOldVal").empty().append(JobZoneType);
	var addwatcherUrl = 'http://'+areaIP+':'+areaPort+"/watchers/watcherInfo"
	
	$.ajax({
		url : addwatcherUrl,
		dataType: "json",
		contentType: "text/html; charset=UTF-8",
		type: "get", 
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		success :function(data){
			var data=data;
			$("#addKubernetesMasterHostInfo").val(data.K8sMasterHost);
			$("#addKubernetesAPIVersionInfo").val(data.K8sAPIVersion);
		}
	});
	layer.open({
		type: 1,
		title: '新增watcher',
		area: ['800px'],
		content: $("#addOneWatcherInfo"),
		btn: ['确定','取消'],
		yes: function(index,layero){
			//var addUrl = "http://"+areaIP+":"+areaPort+"/watcher/all";

			//var KubernetesMasterHost = $("#addKubernetesMasterHostInfo").val();
			//var KubernetesAPIVersion =$("#addKubernetesAPIVersionInfo").val();
			var NginxReloadCommand = $("#addNginxReloadCommandInfo").val();
			var NginxListenPort = $("#addNginxListenPortInfo").val();
			var JobZoneType = $("#addJobZoneTypeOldVal").html();
			var WatchNamespaceSets = new Array();
			if($(".namespaceAll").css("display")=="none"){
				var namespacesChk = $(".namespacesChk:checked");
				for(var nNum=0; nNum<namespacesChk.length; nNum++){
					WatchNamespaceSets.push(namespacesChk[nNum].value);
				}
			}else{
				WatchNamespaceSets= ["all"];
			}

			var NginxReloadCommand = $("#NginxReloadCommandInfo").val();
			var NginxRealCfgDirPath = $("#addNginxRealCfgDirPathInfo").val();
			var NginxTestCfgDirPath = $("#addNginxTestCfgDirPathInfo").val();
			var DownloadCfgDirPath = $("#addDownloadCfgDirPathInfo").val();
			//var LogPrintLevel = $("#addLogPrintLevelInfo").val();
			var DefaultNginxServerType = $("#addDefaultNginxServerTypeInfo").val();
			var DomainSuffix = $("#addDomainSuffixInfo").val();
			var WorkMode = $("#addWorkModeInfo").val();
			var NginxTestCommand = $("#addNginxTestCommandInfo").val();
			//var StandbyUpstreamNodes = $("#addStandbyUpstreamNodesInfo").val().split(",");
			var K8sWatcherStatus = $("#addK8sWatcherStatus").val();
			
			var addCfgInfo = {
				// "NodeIP":NodeIP,
				// "ClientID":ClientID,
				"WatcherCfg":{
					"NginxReloadCommand":NginxReloadCommand,
					"NginxListenPort":NginxListenPort,
					"JobZoneType":JobZoneType,
					"WatchNamespaceSets":WatchNamespaceSets,
					"NginxRealCfgDirPath":NginxRealCfgDirPath,
					"NginxTestCfgDirPath":NginxTestCfgDirPath,
					"DownloadCfgDirPath":DownloadCfgDirPath,
					"DefaultNginxServerType":DefaultNginxServerType,
					"DomainSuffix":DomainSuffix,
					"WorkMode":WorkMode,
					"NginxTestCommand":NginxTestCommand,
					//"StandbyUpstreamNodes":StandbyUpstreamNodes,
					"K8sWatcherStatus":K8sWatcherStatus
					}
			};
			//验证端口
			var checkPortUrl = 'http://'+areaIP+':'+areaPort+'/watchers/portCheck?nginxListenPort='+NginxListenPort+'&jobZoneType='+JobZoneType;
			$.ajax({
				url: checkPortUrl,
				dataType: "json",
				contentType: "text/html; charset=UTF-8",
				type:"put",  
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				success:function(data){
					var data=data;
					if(data.Result==true){
						watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
						$.ajax({
							url : watchersUrl,
							dataType: "json",
							contentType: "text/html; charset=UTF-8",
							type: "post", 
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json",
							},
							data: JSON.stringify(addCfgInfo),
							success :function(data){
								var data=data;
								window.location.reload();
							}
									
						});
						layer.close(index);
					}else{
						layer.msg("端口已占用，请更换端口!", {icon: 2});
						return false;
					}
				}		
		    });  
			
		}
	})
}


/*删除*/
// function delOneWatcher(obj){

// 	var WatcherID = $(obj).parent().attr("WatcherID");
// 	var NodeIP = $(obj).parent().parent().attr("NodeIP");
// 	var ClientID = $(obj).parent().parent().attr("ClientID");
// 	var deleteUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID+"?NodeIP="+NodeIP+"&ClientID="+ClientID;

// 	layer.open({
// 		title: "删除", //不显示标题
// 		content: "确认删除?",
// 		btn: ['确定', '取消'],
// 		yes: function(index, layero){
// 			$.ajax({
// 				 url: deleteUrl,
// 				 dataType: "json",
// 				 contentType: "text/html; charset=UTF-8",
// 				 type:"delete",
// 				 headers: {
// 				 	"Content-Type": "application/json",
// 				 	"Accept": "application/json",
// 				 },
// 				success:function(data){
// 				 	var data=data;
// 					if(data.Result==true){
// 						$(obj).parent().parent().remove();
// 				 		layer.msg('删除成功！', {icon: 1});
// 					}else{
// 						layer.alert(data.ErrorMessage, {
// 							icon: 2,
// 							title:"删除失败",
// 							skin: 'layer-ext-moon'
// 						})
// 					}
				 		
// 				}
// 			});
// 			layer.close(index);
// 		},
// 		cancel: function(index, layero){
// 			layer.close(index);
// 		}
// 	});
// }
/*stop一个watcher*/
function stopOneWatcher(obj){
	var WatcherID = $(obj).parent().attr("WatcherID");
	var NodeIP = $(obj).parent().parent().attr("NodeIP");
	var ClientID = $(obj).parent().parent().attr("ClientID");
	var stopUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID+"/stop?NodeIP="+NodeIP+"&ClientID="+ClientID;
	$.ajax({
        url: stopUrl,
        dataType: "json",
        contentType: "text/html; charset=UTF-8",
        type:"put",            
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        success:function(data){
            var data=data;
            if(data.Result==true){
				layer.msg('停止成功！', {icon: 1});
				setTimeout("window.location.reload()", 1500 );
			}else{
				layer.alert(data.ErrorMessage, {
				icon: 2,
				title:"停止失败",
					skin: 'layer-ext-moon'
				})
			}
        }
    });
}
/*start一个watcher*/
function startOneWatcher(obj){
	var WatcherID = $(obj).parent().attr("WatcherID");
	var NodeIP = $(obj).parent().parent().attr("NodeIP");
	var ClientID = $(obj).parent().parent().attr("ClientID");
	var startUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID+"/start?NodeIP="+NodeIP+"&ClientID="+ClientID;
	$.ajax({
        url: startUrl,
        dataType: "json",
        contentType: "text/html; charset=UTF-8",
        type:"put",            
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        success:function(data){
            var data=data;
            if(data.Result==true){
				layer.msg('启动成功！', {icon: 1});
				setTimeout("window.location.reload()", 1500 );
			}else{
				layer.alert(data.ErrorMessage, {
				icon: 2,
				title:"启动失败",
					skin: 'layer-ext-moon'
				})
			}
        }
    });
}
/*对比两个client*/
function compareClient(obj){
	var thisClientID = $(obj).parent().attr("ClientID");
	var thisNodeIP = $(obj).parent().attr("NodeIP");
	var NodesInfo = new Array();
	var areaUrl = "http://"+areaIP+":"+areaPort+"/clients";
	$.ajax({
		"url":areaUrl,
		"type":"get",
		"success":function(data){
			var clientData = eval("("+data+")");
			
			var compareClientHtml = "";
			var dataType = "";
				
			for(var areaNum = 0; areaNum< clientData.length; areaNum++){
				dataType = clientData[areaNum].JobZoneType;
				if(dataType!=""){
					//弹窗获得nodeip  clientid
					if(dataType == JobZoneType){
						var clientsVal = clientData[areaNum].Clients;
						var clientsHtml = "";
						for(var i=0; i<clientsVal.length;i++){
						 	var NodeIP = clientsVal[i].NodeIP;
						 	var ClientID = clientsVal[i].ClientID;
						 	var APIServerPort = clientsVal[i].APIServerPort.substring(1,clientsVal[i].APIServerPort.length);
						 	if(thisClientID != ClientID || thisNodeIP != NodeIP){
						 		compareClientHtml += '<tr class="nodeInfos">'+
			                               '<td style="text-indent: 10px;">'+
			                                '<input type="radio" nodeip="'+NodeIP+'" clientid="'+ClientID+'" name="compareItem" class="compareItem"></td>'+
											'<td class="clientid">'+ClientID+'</td>'+
											'<td class="nodeip">'+NodeIP+'</td>'+
											'<td class="APIServerPort">'+APIServerPort+'</td>'+
			                                '</tr>';
						 	}
						}
						$("#compareClientbody").empty().append(compareClientHtml);
					}
				}
			}
		}
	});
	

	layer.open({
		type: 1,
		title: '对比Client',
		area: ['800px','450px'],
		content: $("#compareClientInfo"),
		btn: ['k8s对比','外部对比','取消'],
		yes: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
                var NodeIPB = $(".compareItem:checked").attr("NodeIP");
                var clientB = $(".compareItem:checked").attr("ClientID");

				var compareClientK8sUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'&AppSrcType=k8s';

				$.ajax({
			        url: compareClientK8sUrl,
			        dataType: "json",
			        contentType: "text/html; charset=UTF-8",
			        type:"get",           
			        headers: {
			            "Content-Type": "application/json",
			            "Accept": "application/json",
			        },
			        success:function(data){
			            var data=data;
			            if(data.Result == true){
			            	layer.msg('相同！', {icon: 1});
			            }else{
			            	layer.alert(data.ErrorMsg, {
							  icon: 2,
							  title:"不同",
							  skin: 'layer-ext-moon'
							})
			            }
			        }
    			});					
			}
		    layer.close(index);
		},
		btn2: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
                var NodeIPB = $(".compareItem:checked").attr("NodeIP");
                var clientB = $(".compareItem:checked").attr("ClientID");
				var compareClientExternUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'&AppSrcType=extern';
				$.ajax({
			        url: compareClientExternUrl,
			        dataType: "json",
			        contentType: "text/html; charset=UTF-8",
			        type:"get",           
			        headers: {
			            "Content-Type": "application/json",
			            "Accept": "application/json",
			        },
			        success:function(data){
			            var data=data;
			            if(data.Result == true){
			            	layer.msg('相同！', {icon: 1});
			            }else{
			            	layer.alert(data.ErrorMsg, {
							  icon: 2,
							  title:"不同",
							  skin: 'layer-ext-moon'
							})
			            }
			        }
    			});					
			}
		    layer.close(index);
		},
		btn3: function(index, layero){
		    layer.close(index);
		}
	})
}
/*对比两个client中的一个watcher*/
function compareClientOneWatcher(obj){
	var thisClientID = $(obj).attr("ClientID");
	var thisNodeIP = $(obj).attr("NodeIP");
	var thisWatcherID = $(obj).parent().attr("WatcherID");
	var NodesInfo = new Array();
	var areaUrl = "http://"+areaIP+":"+areaPort+"/clients";
	$.ajax({
		"url":areaUrl,
		"type":"get",
		"success":function(data){
			var clientData = eval("("+data+")");
			
			var compareClientHtml = "";
			var dataType = "";
				
			for(var areaNum = 0; areaNum< clientData.length; areaNum++){
				dataType = clientData[areaNum].JobZoneType;
				if(dataType!=""){
					//弹窗获得nodeip  clientid
					if(dataType == JobZoneType){
						var clientsVal = clientData[areaNum].Clients;
						var clientsHtml = "";
						for(var i=0; i<clientsVal.length;i++){
						 	var NodeIP = clientsVal[i].NodeIP;
						 	var ClientID = clientsVal[i].ClientID;
						 	var APIServerPort = clientsVal[i].APIServerPort.substring(1,clientsVal[i].APIServerPort.length);
						 	if(thisClientID != ClientID || thisNodeIP != NodeIP){
						 		compareClientHtml += '<tr class="nodeInfos">'+
			                               '<td style="text-indent: 10px;">'+
			                                '<input type="radio" nodeip="'+NodeIP+'" clientid="'+ClientID+'" name="compareItem" class="compareItem"></td>'+
											'<td class="clientid">'+ClientID+'</td>'+
											'<td class="nodeip">'+NodeIP+'</td>'+
											'<td class="APIServerPort">'+APIServerPort+'</td>'+
			                                '</tr>';
						 	}
						}
						$("#compareClientbody").empty().append(compareClientHtml);
					}
				}
			}
		}
	});
	
	var titleCon = '对比两个Client中的一个watcher (WatcherID='+thisWatcherID+')';
	layer.open({
		type: 1,
		title: titleCon,
		area: ['800px','450px'],
		content: $("#compareClientInfo"),
		btn: ['k8s对比','外部对比','取消'],
		yes: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
				var NodeIPB = $(".compareItem:checked").attr("NodeIP");
				var clientB = $(".compareItem:checked").attr("ClientID");
				var compareClientOneWatcherK8sUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/'+thisWatcherID+'?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'&AppSrcType=k8s';
				$.ajax({
			        url: compareClientOneWatcherK8sUrl,
			        dataType: "json",
			        contentType: "text/html; charset=UTF-8",
			        type:"get",           
			        headers: {
			            "Content-Type": "application/json",
			            "Accept": "application/json",
			        },
			        success:function(data){
			            var data=data;
			            if(data.Result == true){
			            	layer.msg('相同！', {icon: 1});
			            }else{
			            	layer.alert(data.ErrorMsg, {
							  icon: 2,
							  title:"不同",
							  skin: 'layer-ext-moon'
							})
			            }
			        }
    			});										
			}
		    layer.close(index);
		},
		btn2: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
                var NodeIPB = $(".compareItem:checked").attr("NodeIP");
                var clientB = $(".compareItem:checked").attr("ClientID");
				var compareClientOneWatcherExternUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/'+thisWatcherID+'?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'&AppSrcType=extern';
				$.ajax({
			        url: compareClientOneWatcherExternUrl,
			        dataType: "json",
			        contentType: "text/html; charset=UTF-8",
			        type:"get",           
			        headers: {
			            "Content-Type": "application/json",
			            "Accept": "application/json",
			        },
			        success:function(data){
			            var data=data;
			            if(data.Result == true){
			            	layer.msg('相同！', {icon: 1});
			            }else{
			            	layer.alert(data.ErrorMsg, {
							  icon: 2,
							  title:"不同",
							  skin: 'layer-ext-moon'
							})
			            }
			        }
    			});
			}
		    layer.close(index);
		},
		btn3: function(index, layero){
		    layer.close(index);
		}
	})
}

/*批量下载一个client下的多个watcher*/
function watcherNginxExport(obj){
	var watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
	var ClientID = $(obj).parent().attr("ClientID");
	var NodeIP = $(obj).parent().attr("NodeIP");
	var exportWatcherIDHtml = ""	
	$.ajax({
		url : watchersUrl,
		dataType: "json",
		contentType: "text/html; charset=UTF-8",
		type: "get", 
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		data: {
			"ClientID":ClientID,
			"NodeIP":NodeIP
		},
		success :function(data){
			var data=data;
			for(var wn=0; wn<data.length; wn++){
				var ewatcherID = data[wn].WatcherID;
				var eWatchNamespaceSets = data[wn].WatchNamespaceSets;
				exportWatcherIDHtml += '<tr><td><input type="checkbox" class="chkItem chkWatcherItem" WatcherID="'+ewatcherID+'"></td>'
		  							+'<td>'+ewatcherID+'</td><td>'+eWatchNamespaceSets+'</td></tr>';
			}
			$("#exportNginxWatcherbody").empty().append(exportWatcherIDHtml);
		}		
	});

	layer.open({
		type: 1,
		title: "下载watcher",
		area: ['450px','400px'],
		content: $("#exportNginxWatcher"),
		btn: ['确定','取消'],
		yes: function(index, layero){
			var WatcherIDSet = new Array();
			var checkedWatchers =$(".chkWatcherItem:checked");
			for(var cw=0; cw<checkedWatchers.length; cw++){
				WatcherIDSet.push(checkedWatchers[cw].getAttribute("WatcherID"));
			}
			if(WatcherIDSet.length==0){
				layer.msg('请选择至少一个watcher！', {icon: 2});
				return false;
			}
			var exportClientWatchersUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/singleClientDownload';
			var DownloadData = {
					"NodeIP": NodeIP,
					"ClientID": ClientID,
					"WatcherIDSet": WatcherIDSet
				};
			$.ajax({
				url : exportClientWatchersUrl,
				dataType: "json",
				contentType: "text/html; charset=UTF-8",
				type: "post", 
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				data: JSON.stringify(DownloadData),
				success :function(data){
					var data=data;
					location.href= 'http://'+areaIP+':'+areaPort+data.NginxCfgDownloadURL;
					layer.close(index);
				}		
			});
		}
	})
}
/**
* 批量下载多个client下个多个watcher
* @param obj
*/
function nginxCfgsExport(obj){
	if($(".chkNodeItem:checked").length==0){
		return false;
	}
	var watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
	var ClientID = $("#clientsList").find("tr:first").attr("ClientID");
	var NodeIP = $("#clientsList").find("tr:first").attr("NodeIP");
	var exportWatcherIDHtml = ""	
	$.ajax({
		url : watchersUrl,
		dataType: "json",
		contentType: "text/html; charset=UTF-8",
		type: "get", 
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		data: {
			"ClientID":ClientID,
			"NodeIP":NodeIP
		},
		success :function(data){
			var data=data;
			for(var wn=0; wn<data.length; wn++){
				var ewatcherID = data[wn].WatcherID;
				var eWatchNamespaceSets = data[wn].WatchNamespaceSets;
				exportWatcherIDHtml += '<tr><td><input type="checkbox" class="chkItem chkWatcherItem" WatcherID="'+ewatcherID+'"></td>'
		  							+'<td>'+ewatcherID+'</td><td>'+eWatchNamespaceSets+'</td></tr>';
			}
			$("#exportNginxWatcherbody").empty().append(exportWatcherIDHtml);
		}		
	});
	
	var DownloadInfo = new Array();
	var checkedNodeItems = $(".chkNodeItem:checked");
	for(var nodeNum=0; nodeNum< checkedNodeItems.length;nodeNum++){
		var checkedNode = {
			"NodeIP": checkedNodeItems[nodeNum].getAttribute("NodeIP"),
			"ClientID": checkedNodeItems[nodeNum].getAttribute("ClientID")
		}
		DownloadInfo.push(checkedNode);
	}
	var watcherIDArray = new Array();
	var checkedWatchers =$(".chkWatcherItem:checked");
	for(var cw=0; cw<checkedWatchers.length; cw++){
		watcherIDArray.push(checkedWatchers[cw].getAttribute("WatcherID"));
	}

	layer.open({
		type: 1,
		title: "下载watcher",
		area: ['450px','400px'],
		content: $("#exportNginxWatcher"),
		btn: ['确定','取消'],
		yes: function(index, layero){
			var watcherIDArray = new Array();
			var checkedWatchers =$(".chkWatcherItem:checked");
			for(var cw=0; cw<checkedWatchers.length; cw++){
				watcherIDArray.push(checkedWatchers[cw].getAttribute("WatcherID"));
			}
			if(watcherIDArray.length==0){
				layer.msg('请选择至少一个watcher！', {icon: 2});
				return false;
			}
			var clientsDownloadData = {
				"ClientInfoSet":DownloadInfo,
				"WatcherIDSet":watcherIDArray
			};
			var clientsdownloadUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/allClientDownload';
			$.ajax({
			    url : clientsdownloadUrl,
				dataType: "json",
				contentType: "text/html; charset=UTF-8",
				type: "post", 
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				data: JSON.stringify(clientsDownloadData),
				success :function(data){
					//var data=data;
		//			location.href= 'http://'+areaIP+':'+areaPort+'/nginxcfg/batchDownload';
					location.href= 'http://'+areaIP+':'+areaPort+data.NginxCfgDownloadURL;
					layer.close(index);
				}
					
			});
		}
	})




	
}
/*批量 删除 一个client下的多个watcher*/
function delWatcher(){
	var watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
	var ClientID = $("#clientsList").find("tr:first").attr("ClientID");
	var NodeIP = $("#clientsList").find("tr:first").attr("NodeIP");
	var watcherIDHtml = ""	
	$.ajax({
		url : watchersUrl,
		dataType: "json",
		contentType: "text/html; charset=UTF-8",
		type: "get", 
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		data: {
			"ClientID":ClientID,
			"NodeIP":NodeIP
		},
		success :function(data){
			var data=data;
			for(var wn=0; wn<data.length; wn++){
				var ewatcherID = data[wn].WatcherID;
				var eWatchNamespaceSets = data[wn].WatchNamespaceSets;
				watcherIDHtml += '<tr><td><input type="checkbox" class="chkItem chkWatcherItem" WatcherID="'+ewatcherID+'"></td>'
		  							+'<td>'+ewatcherID+'</td><td>'+eWatchNamespaceSets+'</td></tr>';
			}
			$("#watcheridbody").empty().append(watcherIDHtml);
		}		
	});
	
	
	layer.open({
		type: 1,
		title: "删除watcher",
		area: ['400px','350px'],
		content: $("#delWatcherInfo"),
		btn: ['确定','取消'],
		yes: function(index, layero){
			var watcherIDArray = new Array();
			var checkedWatchers =$(".chkWatcherItem:checked");
			for(var cw=0; cw<checkedWatchers.length; cw++){
				watcherIDArray.push(checkedWatchers[cw].getAttribute("WatcherID"));
			}
			if(watcherIDArray.length==0){
				layer.msg('请选择至少一个watcher！', {icon: 2});
				return false;
			}
			var delWatcherData = {
					"JobZoneType": JobZoneType,
				    "WatcherIDSet": watcherIDArray
				}

			var delWatcherUrl = 'http://'+areaIP+':'+areaPort+'/watchers';
			$.ajax({
			    url: delWatcherUrl,
			    dataType: "json",
			    contentType: "text/html; charset=UTF-8",
			    type:"delete",  
			    data: JSON.stringify(delWatcherData),         
			    headers: {
			        "Content-Type": "application/json",
			        "Accept": "application/json",
			    },
			    success:function(data){
			        var data=data;
			        if(data.Result == true){
			            layer.msg('删除成功！', {icon: 1});
			            setTimeout("window.location.reload()", 1500 );
			        }else{
			            layer.alert(data.ErrorMsg, {
							icon: 2,
							title:"删除失败！",
							skin: 'layer-ext-moon'
						})
			        }
			    }
    		});	

    		layer.close(index);									
		}
		
	})
}
//nginx工具
function nginxTool(obj){
	var nginxToolVal = $(obj).attr("status");
	var NginxCmdType = {"NginxCmdType":nginxToolVal};
	var ClientID = $(obj).parents("ul.nav").attr("ClientID");
	var NodeIP = $(obj).parents("ul.nav").attr("NodeIP");
	var nginxToolUrl = 'http://'+areaIP+':'+areaPort+'/tools?ClientID='+ClientID+'&NodeIP='+NodeIP;
	$.ajax({
		url: nginxToolUrl,
		dataType: "json",
		contentType: "text/html; charset=UTF-8",
		type:"post",  
		data: JSON.stringify(NginxCmdType),         
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		success:function(data){
			var data=data;
			if(data.Result==true){
				layer.msg(data.NginxCmd+'-成功', {icon: 1});
			}else if(data.Result==false){
				layer.msg(data.NginxCmd+':'+data.ErrorMessage, {icon: 2});
			}
		}
			
    });	
}


function areaRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront";
}
function clientsRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients?areaType="+JobZoneType;
}
