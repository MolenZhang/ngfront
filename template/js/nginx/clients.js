 var areaType = "";
 var areaIP = "localhost";
 var areaPort = "port";
 $(document).ready(function () {
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients?areaType=user
	areaType=locationUrl.search.substring(locationUrl.search.indexOf("=")+1,locationUrl.search.length); 
	
	showClients(areaType);

	 //全选
	$(".chkAll").click(function(){
	    $(this).parents('table').find(".chkItem").prop('checked',$(".chkAll").is(":checked"));
	    if($(".chkItem:checked").length!=0){
	    	$(".issuedBtn").removeClass("no-drop");
	    }else{
	    	$(".issuedBtn").addClass("no-drop");
	    }
	});
 
    // 每条数据 checkbox class设为 chkItem
    $(document).on("click",".chkItem", function(){
        if($(this).is(":checked")){
            if ($(this).parents('table').find(".chkItem:checked").length == $(this).parents('table').find(".chkItem").length) {
            	$(this).parents('table').find(".chkAll").prop("checked", "checked");
            }
        }else{
        	$(this).parents('table').find(".chkAll").prop('checked', $(this).is(":checked"));
        }
        if($(".chkItem:checked").length!=0){
	    	$(".issuedBtn").removeClass("no-drop");
	    }else{
	    	$(".issuedBtn").addClass("no-drop");
	    }
    });


	
 });/*reday*/

function showClients(areaType){
	//var areaIP = "localhost";
	//var areaPort = "port";
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
			 if(dataType == areaType){
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
			 		clientsHtml += '<tr>'+
                                    '<td style="text-indent: 10px;text-align:center">'+
                                    '<input type="checkbox" class="chkItem chkNodeItem" name="ids" NodeIP="'+NodeIP+'" ClientID="'+ClientID+'"></td>'+	
                                    '<td onclick="watcherAll(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'" class="caretTd"><a><i class="fa fa-caret-right" flag="1"></i></a></td>'+
                                    '<td>'+ClientID+'</td>'+
                                    '<td>'+NodeName+'</td>'+
                                    '<td>'+NodeIP+'</td>'+
                                    '<td>'+APIServerPort+'</td>'+
                                    '<td class="operationBtns" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'+
                                    	'<a><i class="fa fa-play hide"></i></a>'+
                                    	'<a><i class="fa fa-power-off hide"></i></a>'+
                                    	/*'<a href="'+watcherUrl+NodeIP+'&ClientID='+ClientID+'&areaType='+areaType+'"><i class="fa fa-gear"></i></a>'+*/
                                    	
                                    	'<a onclick="nginxExport(this)"><i>下载</i></a>'+
                                    	'<a onclick="compareClient(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'"><i>对比</i></a>'+
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

	$("#JobZoneTypeOldVal").empty().append(areaType);
	layer.open({
		type: 1,
		title: '下发配置',
		area: ['800px'],
		content: $("#issuedCfgInfo"),
		btn: ['确定','取消'],
		yes: function(index,layero){
			//var areaIP = "localhost";
			//var areaPort = "port";
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
					//"LogPrintLevel":LogPrintLevel,
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
}

function loadNamespaces(){
	$(".namespaceAll").hide();
	$(".editNamespacesTd").removeClass("hide");
	var KubernetesMasterHost = $("#KubernetesMasterHostInfo").val();
	var KubernetesAPIVersion = $("#KubernetesAPIVersionInfo").val();
	//var areaIP = "localhost";
	//var areaPort = "port";
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
				$("#addnamespacesInfo").empty().append(namespacesHtml);
			}
		}
	});
}

/**
	 * 批量导出一个node的配置信息
	 * @param obj
	 */
	function nginxCfgsExport(obj){
		var DownloadInfo = new Array();
		var checkedNodeItems = $(".chkNodeItem:checked");
		for(var nodeNum=0; nodeNum< checkedNodeItems.length;nodeNum++){
			var checkedNode = {
				"NodeIP": checkedNodeItems[nodeNum].getAttribute("NodeIP"),
				"ClientID": checkedNodeItems[nodeNum].getAttribute("ClientID")
			}
			DownloadInfo.push(checkedNode);
		}	
	    var DownloadData = {"DownloadClientInfo":DownloadInfo};
		var downloadUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/Alldownload';
	    $.ajax({
	    		url : downloadUrl,
				dataType: "json",
				contentType: "text/html; charset=UTF-8",
		    	type: "post", 
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				data: JSON.stringify(DownloadData),
				success :function(data){
					//var data=data;
//					location.href= 'http://'+areaIP+':'+areaPort+'/nginxcfg/batchDownload';
					location.href= 'http://'+areaIP+':'+areaPort+data.NginxCfgDownloadURL;
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
	var watcherHtmlUrl = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients/watcher?NodeIP="+NodeIP+'&ClientID='+ClientID+'&areaType='+areaType+'&WatcherID=';
	var watchersHtml = '<tr class="needHideWatcher" style="background-color:#ddd">'
					   +'<th colspan="2">&nbsp;</th>'
                       +'<th>watcherID</th>'
                       +'<th>工作状态</th>'
                       +'<th colspan="2">监控的租户</th>'
                       +'<th style="text-indent: 10px;">操作</th>'
                       +'</tr>';
    
	for(var wNum=0; wNum<data.length;wNum++){
		var WatcherID = data[wNum].WatcherID;
		var K8sWatcherStatus = data[wNum].K8sWatcherStatus;
		var K8sWatcherStatusHtml = "";
		var WatchNamespaceSets = data[wNum].WatchNamespaceSets
		if(K8sWatcherStatus == "stop"){
			K8sWatcherStatusHtml = '<img src="../../images/stop.png" alt=""/>&nbsp;未工作';
		}else{
			K8sWatcherStatusHtml = '<img src="../../images/running.gif" alt=""/>&nbsp;已工作';
		}
		watchersHtml +='<tr class="needHideWatcher" style="background-color:#ddd" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'">'
				    +'<td colspan="2">&nbsp;</td>'
					+'<td>'+WatcherID+'</td>'
					+'<td class="statusImg">'+K8sWatcherStatusHtml+'</td>'
					+'<td colspan="2">'+WatchNamespaceSets+'</td>'
					+'<td class="operationBtns" WatcherID="'+WatcherID+'">'
					+'<a onclick="stopOneWatcher(this)" class="'+K8sWatcherStatus+'_stopBtn"><i>停止</i></a>'
					+'<a onclick="startOneWatcher(this)" class="'+K8sWatcherStatus+'_startBtn"><i>启动</i></a>'
					+'<a href="'+watcherHtmlUrl+WatcherID+'"><i>编辑</i></a>'
					+'<a onclick="compareClientOneWatcher(this)" ClientID="'+ClientID+'" NodeIP="'+NodeIP+'"><i>对比</i></a>'
					+'<a onclick="delOneWatcher(this)"><i>删除</i></a></td>'
					+'</tr>';
		}

	return watchersHtml;
	
}

/*新增*/
function addOneWatcher(obj){
	$("#addJobZoneTypeOldVal").empty().append(areaType);
	layer.open({
		type: 1,
		title: '新增watcher',
		area: ['800px'],
		content: $("#addOneWatcherInfo"),
		btn: ['确定','取消'],
		yes: function(index,layero){
			//var addUrl = "http://"+areaIP+":"+areaPort+"/watcher/all";

			var KubernetesMasterHost = $("#addKubernetesMasterHostInfo").val();
			var KubernetesAPIVersion =$("#addKubernetesAPIVersionInfo").val();
			var NginxReloadCommand = $("#addNginxReloadCommandInfo").val();
			var NginxListenPort = $("#addNginxListenPortInfo").val();
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
			var StandbyUpstreamNodes = $("#addStandbyUpstreamNodesInfo").val().split(",");
			var K8sWatcherStatus = $("#addK8sWatcherStatus").val();

			var NodeIP = $(obj).attr("NodeIP");
			var ClientID = $(obj).attr("ClientID");
			
			var addCfgInfo = {
				"NodeIP":NodeIP,
				"ClientID":ClientID,
				"WatcherCfg":{
					"NginxReloadCommand":NginxReloadCommand,
					"NginxListenPort":NginxListenPort,
					"WatchNamespaceSets":WatchNamespaceSets,
					"NginxRealCfgDirPath":NginxRealCfgDirPath,
					"NginxTestCfgDirPath":NginxTestCfgDirPath,
					"DownloadCfgDirPath":DownloadCfgDirPath,
					"DefaultNginxServerType":DefaultNginxServerType,
					"DomainSuffix":DomainSuffix,
					"WorkMode":WorkMode,
					"NginxTestCommand":NginxTestCommand,
					"StandbyUpstreamNodes":StandbyUpstreamNodes,
					"K8sWatcherStatus":K8sWatcherStatus
					}
			};

			watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers?NodeIP="+NodeIP+"&ClientID="+ClientID;
			
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
					$.ajax({
					    url : watchersUrl,
						dataType: "json",
						contentType: "text/html; charset=UTF-8",
						type: "get", 
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json",
						},
						//data: JSON.stringify(addCfgInfo),
						success :function(data){
							var data=data;
							$(obj).parent().parent().parent().parent().children(".needHideWatcher").remove();
							$(obj).parent().parent().find(".caretTd").empty().html('<a><i class="fa fa-caret-down" flag="2"></i></a>');
							var watchersHtml2 = showWatcherHtml(data);
							$(obj).parent().parent().after(watchersHtml2);
						}
							
					});
				}
					
			});
			layer.close(index);
		}
	})
}


/*删除*/
function delOneWatcher(obj){

	var WatcherID = $(obj).parent().attr("WatcherID");
	var NodeIP = $(obj).parent().parent().attr("NodeIP");
	var ClientID = $(obj).parent().parent().attr("ClientID");
	var deleteUrl = "http://"+areaIP+":"+areaPort+"/watchers/"+WatcherID+"?NodeIP="+NodeIP+"&ClientID="+ClientID;

	layer.open({
		title: "删除", //不显示标题
		content: "确认删除?",
		btn: ['确定', '取消'],
		yes: function(index, layero){
			$.ajax({
				 url: deleteUrl,
				 dataType: "json",
				 contentType: "text/html; charset=UTF-8",
				 type:"delete",
				 headers: {
				 	"Content-Type": "application/json",
				 	"Accept": "application/json",
				 },
				success:function(data){
				 	var data=data;
					if(data.Result==true){
						$(obj).parent().parent().remove();
				 		layer.msg('删除成功！', {icon: 1});
					}else{
						layer.alert(data.ErrorMessage, {
							icon: 2,
							title:"删除失败",
							skin: 'layer-ext-moon'
						})
					}
				 		
				}
			});
			layer.close(index);
		},
		cancel: function(index, layero){
			layer.close(index);
		}
	});
}
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
				$(obj).parent().parent().remove();
				layer.msg('停止成功！', {icon: 1});
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
				$(obj).parent().parent().remove();
				layer.msg('启动成功！', {icon: 1});
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
					if(dataType == areaType){
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
	
	var NodeIPB = $(".compareItem:checked").attr("NodeIP");
	var clientB = $(".compareItem:checked").attr("ClientID");
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
				var compareClientK8sUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'?AppSrcType=k8s';
			}
		    
		},
		btn2: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
				var compareClientExternUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'?AppSrcType=extern';
			}
		    
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
					if(dataType == areaType){
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
				var compareClientK8sUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/'+thisWatcherID+'/?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'?AppSrcType=k8s';
														
			}
		    
		},
		btn2: function(index, layero){
			if($(".compareItem:checked").length==0){
				layer.alert('请选择需要与此对比的一个client', {
				  icon: 0,
				  skin: 'layer-ext-moon' 
				})
				
			}else{
				var compareClientExternUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/compare/'+thisClientID+'-'+clientB+'/'+thisWatcherID+'/?NodeIPA='+thisNodeIP+'&NodeIPB='+NodeIPB+'?AppSrcType=extern';
			}
		    
		},
		btn3: function(index, layero){
		    layer.close(index);
		}
	})
}

/*下载*/
function nginxExport(obj){
	var NodeIPInfo = $(obj).parent().attr("NodeIP");
	var ClientIDInfo = $(obj).parent().attr("ClientID");
	var downloadData={
	      	"NodeIP": NodeIPInfo,
	        "ClientID":ClientIDInfo
	    };
	        	
	var downloadUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/download';
	$.ajax({
		url : downloadUrl,
		type: "get", 
		data: downloadData,
		success :function(data){
		location.href = data.NginxCfgDownloadURL;
		}
	});
}

function areaRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront";
}
function clientsRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients?areaType="+areaType;
}
