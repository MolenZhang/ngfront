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
			 		//var K8sWatcherStatus = clientsVal[i].K8sWatcherStatus
			 		var statusHtml = "";
			 		/*if(K8sWatcherStatus == "start"){
			 			statusHtml = '<img src="/images/running.gif" alt=""/>&nbsp;工作中';
			 		}else{
			 			statusHtml = '<img src="/images/stop.png" alt=""/>&nbsp;未工作';
			 		}*/
			 		clientsHtml += '<tr>'+
                                    '<td style="text-indent: 30px;">'+
                                    '<input type="checkbox" class="chkItem chkNodeItem" name="ids" NodeIP="'+NodeIP+'" ClientID="'+ClientID+'"></td>'+	
                                    '<td><a onclick="watcherAll(this)"><i class="fa fa-caret-right" flag="1"></i></a></td>'+
                                    '<td>'+ClientID+'</td>'+
                                    '<td>'+NodeName+'</td>'+
                                    '<td>'+NodeIP+'</td>'+
                                    '<td>'+APIServerPort+'</td>'+
                                    '<td class="operationBtns">'+
                                    	'<a><i class="fa fa-play hide"></i></a>'+
                                    	'<a><i class="fa fa-power-off hide"></i></a>'+
                                    	/*'<a href="'+watcherUrl+NodeIP+'&ClientID='+ClientID+'&areaType='+areaType+'"><i class="fa fa-gear"></i></a>'+*/
                                    	
                                    	'<a ><i>新增</i></a>'+
                                    	'<a ><i>删除</i></a>'+
                                    	'<a ><i>下载</i></a>'+
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

	$("#JobZoneTypeOldVal").append(areaType);
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

function watcherAll(obj,ClientID,NodeIP){
	//alert(111)
	var watchersHtml = '<tr class="needHideWatcher" style="background-color:#ddd">'
					   +'<th colspan="2">&nbsp;</th>'
                       +'<th>watcherID</th>'
                       +'<th>工作状态</th>'
                       +'<th colspan="2">监控的租户</th>'
                       +'<th>操作</th>'
                       +'</tr>';
    watchersHtml +='<tr class="needHideWatcher" style="background-color:#ddd">'
    			+'<td colspan="2">&nbsp;</td>'
			    +'<td>1</td>'
			    +'<td class="statusImg"><img src="../../images/stop.png" alt=""/>&nbsp;未工作</td>'
			    +'<td colspan="2">dddd,dyrdf</td>'
			    +'<td><a><i>停止</i></a><a><i>启动</i></a><a><i>编辑</i></a><a><i>删除</i></a></td>'
			    +'</tr>';
	var thisFlag = $(obj).children().attr("flag");
	if(thisFlag==1){
		$(obj).parent().parent().after(watchersHtml);
		$(obj).empty().html('<i class="fa fa-caret-down" flag="2"></i>');
	}else{
		$(obj).parent().parent().parent().find("tr.needHideWatcher").hide();
		$(obj).empty().html('<i class="fa fa-caret-right" flag="1"></i>');
	}
    
	//watchersUrl= 'http://'+areaIP+':'+areaPort+"/watchers";
	// $.ajax({
	//     url : watchersUrl,
	// 	dataType: "json",
	// 	contentType: "text/html; charset=UTF-8",
	// 	type: "get", 
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 		"Accept": "application/json",
	// 	},
	// 	data: {
	// 		"ClientID":ClientID,
	// 		"NodeIP":NodeIP
	// 	},
	// 	success :function(data){
	// 		var data=data;
				
	// 	}
			
	// });
}

function areaRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront";
}
function clientsRefresh(){
	location.href = "http://"+areaIP+":"+areaPort+"/ngfront/zone/clients?areaType="+areaType;
}
