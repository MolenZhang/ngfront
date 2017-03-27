 var NodeIP = "";
 var ClientID = "";
 $(document).ready(function () {
 	var locationUrl = window.location;
	//http://192.168.252.133:8011/ngfront/zone/clients/watcher/nginxcfg?NodeIP=192.168.252.133&ClientID=71906&KubernetesMasterHost=http://192.168.0.75:8080&KubernetesAPIVersion=api/v1&JobZoneType=all
 	NodeIP = locationUrl.search.substring(locationUrl.search.indexOf("NodeIP=")+7,locationUrl.search.indexOf("&C"));
	ClientID = locationUrl.search.substring(locationUrl.search.indexOf("ClientID=")+9,locationUrl.search.indexOf("&KubernetesMasterHost"));
	var KubernetesMasterHost = locationUrl.search.substring(locationUrl.search.indexOf("KubernetesMasterHost=")+21,locationUrl.search.indexOf("&KubernetesAPIVersion"));
	var KubernetesAPIVersion = locationUrl.search.substring(locationUrl.search.indexOf("KubernetesAPIVersion=")+21,locationUrl.search.indexOf("&J"));
	var JobZoneType = locationUrl.search.substring(locationUrl.search.indexOf("JobZoneType=")+12,locationUrl.search.length);
	
	showAllNgs(NodeIP,ClientID);
	
 	//加载所有租户option
	showAllUsers(KubernetesMasterHost,KubernetesAPIVersion,JobZoneType);
    //折叠ibox
    $(document).on('click','.collapse-link',function(){
        var ibox = $(this).closest('div.ibox');
        var button = $(this).find('i');
        var content = ibox.find('div.ibox-content');
        content.slideToggle(200);
        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        ibox.toggleClass('').toggleClass('border-bottom');
        setTimeout(function () {
            ibox.resize();
            ibox.find('[id^=map-]').resize();
        }, 50);
        ibox.css("border-bottom","1px solid #dadada");
    });

    //与填写的端口号保持一致
//	var ListenPort = $("#ListenPort").val();
//	$(".sameToListenPort").val(ListenPort);
//	$("#ListenPort").blur(function(){
//		ListenPort = $("#ListenPort").val();
//		$(".sameToListenPort").val(ListenPort);
//	});


	
 });/*reday*/

 //加载所有租户option
 var NamespacesList = "";
 var NamespacesAppCounts = "";

 function showAllUsers(KubernetesMasterHost,KubernetesAPIVersion,JobZoneType){
 	var areaIP = "localhost";
	var areaPort = "port";
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
			NamespacesList = data.NamespacesList;
			NamespacesAppCounts = data.AppInfoList;
			//租户option
			var userOptionHtml = "";
			if(NamespacesList != null){
				for(var nsNum=0; nsNum<NamespacesList.length; nsNum++){
				userOptionHtml += '<option value="'+NamespacesList[nsNum]+'">'+NamespacesList[nsNum]+'</option>';
				}
				$("#search_user").append(userOptionHtml);
			}
			
		}
	})
 }
 var AppSrcType="";
 function searchByUser(obj){
 	var userVal = $(obj).val();
 	if(userVal==""){
 		showAllNgs(NodeIP,ClientID);
 	}else{
 		//租户option改变生成对应的服务
		var serviceOptionHtml = "";
		for(var i=0; i<NamespacesList.length; i++){
			if(NamespacesList[i] == userVal ){
				if(NamespacesAppCounts[i] != null){
					serviceOptionHtml += '<option value="">-----请选择-----</option>'
					for(var j=0; j<NamespacesAppCounts[i].length; j++){
						AppSrcType = NamespacesAppCounts[i][j].AppSrcType;
						var AppSrcTypeText = "";
						if(AppSrcType == "k8s"){
							AppSrcTypeText = "K8S服务";
						}else{
							AppSrcTypeText = "外部服务";
						}

					serviceOptionHtml += '<option value="'+NamespacesAppCounts[i][j].NamespacesApp+'" namespacesName="'+NamespacesList[i]+'">'+NamespacesAppCounts[i][j].NamespacesApp+'('+AppSrcTypeText+')'+'</option>';
					}
					
				}else{
					serviceOptionHtml += '<option>--无服务--</option>';
				}
				$("#search_service").empty().append(serviceOptionHtml);
			}
			
	 	}
 	}
}

//展示同一个node下的所有nginx配置
function showAllNgs(NodeIP,ClientID){
	var areaIP = "localhost";
	var areaPort = "port";
	var showAllNgsUrl = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP="+NodeIP+"&ClientID="+ClientID;
	$.ajax({
			url : showAllNgsUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "get", 
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			"success":function(data){
				showNgsHtml(data);
			}	
	})
	
}

function showNgsHtml(data){
	var NginxList = data.NginxList;
	var strs = "";
	for(var i =0;i< NginxList.length;i++){
		var nginxList = NginxList[i];
					if("k8s"==nginxList.CfgType){
						strs+='<div class="ibox float-e-margins" >'
			 				+'<div class="ibox-title">'
			 				+'<h5> NODE '+data.NodeIP+data.APIServerPort+'-'+'K8S服务</h5>';
			 			strs+= '<div class="ibox-tools">'
													+'<a class="hide" onclick="nginxFormCommOfNode(this)">'
						                             +   '<i class="fa fa-save" ></i>'
						                            +'</a>'
												   + '<a class="hide" onclick="" index="index"'
												   + 'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
                                                   +     '<i class="fa fa-trash" ></i>'
                                                   + '</a>'
													+'<a class="collapse-link" index="index"'
													+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
						                             +   '<i class="fa fa-chevron-down"></i>'
						                           + '</a>'
												+'</div>'
			 			+'</div>';
			 		}else{
			 			strs+='<div class="ibox float-e-margins" >'
			 				+'<div class="ibox-title">'
			 				+'<h5> NODE '+data.NodeIP+data.APIServerPort+'-'+'外部服务</h5>';
			 			strs+= '<div class="ibox-tools">'
													+'<a class="hide" onclick="nginxFormCommOfNode(this)">'
						                             +   '<i class="fa fa-save" ></i>'
						                            +'</a>'
												   + '<a class="hide" onclick="" index="index"'
												   + 'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
                                                   +     '<i class="fa fa-trash" ></i>'
                                                   + '</a>'
													+'<a class="collapse-link" index="index"'
													+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
						                             +   '<i class="fa fa-chevron-down"></i>'
						                           + '</a>'
												+'</div>'
			 			+'</div>';
			 		}
			 		strs += '<div class="ibox-content" style="display:block">'
			 				+'<div class="ngConfigPartList">';
		var ngConfigPartHtml = "";
		for(var j=0; j< nginxList.CfgsList.length; j++){
			var CfgsList = nginxList.CfgsList[j];
			 		ngConfigPartHtml += '<div class="ngConfigPart">'
											+'<input type="checkbox" class="ngConfigCheckbox"/>'
											+'<span class="hide addOneSerPart">'
											+'<i class="fa fa-plus fa-serverPlus fa-one" onClick="addOneSerPart(this)" ServerName="'+CfgsList.ServerName+'" ListenPort="'+CfgsList.ListenPort+'" RealServerPath="'+CfgsList.RealServerPath+'" Namespace="'+CfgsList.Namespace+'" AppName="'+CfgsList.AppName+'" Location="'+CfgsList.Location+'" ProxyRedirectSrcPath="'+CfgsList.ProxyRedirectSrcPath+'" ProxyRedirectDestPath="'+CfgsList.ProxyRedirectDestPath+'" IsUpstreamIPHash="'+CfgsList.IsUpstreamIPHash+'" DeleteUserCfgs="'+CfgsList.DeleteUserCfgs+'" IsDefaultCfg="'+CfgsList.IsDefaultCfg+'" CfgType="'+nginxList.CfgType+'"></i></span>'
                                             + '<span><i class="fa fa-save fa-one" onClick="saveSerPart(this)"></i></span>'
                                             + '<span><i class="fa fa-trash fa-one" onClick="delOneSerPart(this)"></i></span>'
                                             + '<span><i class="fa fa-caret-down fa-one" onClick="toggleOneSerPart(this)"></i></span>'
                                             + '<span class="ngConfigPartTit"></span>'
												+ '<div class="ngConfigPartCon">'
												+ '<form class="nginxForm" method="post" action="" AppSrcType="'+nginxList.CfgType+'">'
												+	'<div class="nginx-label">'
												+		'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" AppName="'+CfgsList.AppName+'" Namespace="'+CfgsList.Namespace+'" value="'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled>{'
												+	'</div>'
												+	'<div class="nginx-label col-md-offset-1">'
												+		'<select id="IsUpstreamIPHash" name="IsUpstreamIPHash" value="'+CfgsList.IsUpstreamIPHash+'">';
												var iphash='';	
							 					if(CfgsList.IsUpstreamIPHash==false){
												    iphash+='<option value="false" selected="selected">none</option>'
												    	  +'<option value="true">ip_hash</option>';
												}else{
													iphash+='<option value="false">none</option>'
														  +'<option value="true" selected="selected">ip_hash</option>';
												}
							ngConfigPartHtml += iphash
												+		'</select>;'
												+	'</div>'
												+'<div id="nginx-sers">';
												var UpstreamIPsHtml = '';
												var UpstreamIPsArray = CfgsList.UpstreamIPs;
												if(UpstreamIPsArray != null){
													for(var m=0; m<UpstreamIPsArray.length; m++){
													UpstreamIPsHtml	+='<div class="nginx-label col-md-offset-1">'
														+'<span>server:</span><input type="text" class="ipAndUpstreamPort" value="'+UpstreamIPsArray[m]+':'+CfgsList.UpstreamPort+'">;'
														+	'</div>';
													}
												}
												
												
							ngConfigPartHtml +=	UpstreamIPsHtml
												+'</div>';
												var UpstreamUserRulesStr='';
												var UpstreamUserRules = CfgsList.UpstreamUserRules.UserRuleSet;
								 				if(UpstreamUserRules != null){
								 					
									 				for(var upNum=0; upNum<UpstreamUserRules.length; upNum++){
									 					
									 					UpstreamUserRulesStr+='<div class="col-md-offset-1 nginx-label UpstreamUserRulesDiv" RuleCMD="'+UpstreamUserRules[upNum].RuleCMD+'" RuleParam="'+UpstreamUserRules[upNum].RuleParam+'">'
									 	 	 					+'<span>|-<span>'
									 	 	 					+'<input type="text" id="UpstreamRuleCMD" class="def-input RuleCMD" name="UpstreamRuleCMD" value="'+UpstreamUserRules[upNum].RuleCMD+'"><span>:</span>'
									 	 	 					+'<input type="text" id="UpstreamRuleParam" class="def-input RuleParam" name="UpstreamRuleParam" value="'+UpstreamUserRules[upNum].RuleParam+'">;'
									 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
									 	 	 					+'</div>'
									 					
									 				}
								 				}
							ngConfigPartHtml += UpstreamUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span></div>'
												
												+	'<div class="nginx-label">'
												+		'<span>}</span>'
												+	'</div>'
												+	'<div class="serverPartList">'
												+		'<div class="serverPart">'
												+			'<div class="nginx-label">'
												+				'<span class="serverPartTit">server{</span>'
												+			'</div>'
												+			'<div class="serverPartCon">'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>listen:</span><input type="text" id="ListenPort" name="ListenPort" value="'+CfgsList.ListenPort+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>server_name:</span><input type="text" id="ServerName"  name="ServerName" value="'+CfgsList.ServerName+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>location:</span><input type="text" id="Location" name="Location" value="'+CfgsList.Location+'">{'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled><input type="text" class="RealServerPath" name="" value="'+CfgsList.RealServerPath+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+CfgsList.ListenPort+'" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+CfgsList.ListenPort+'" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+CfgsList.ProxyRedirectSrcPath+'">'
												+					'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+CfgsList.ProxyRedirectDestPath+'">;'
												+				'</div>'
												+'<div class="nginx-label col-md-offset-2">'
	 											+'<select id="LogRuleName" class="LogRuleName" name="LogRuleName" value="'+CfgsList.LogRule.LogRuleName+'">';
	 											var rname ='';
							 					if(CfgsList.LogRule.LogRuleName=="access_log"){
							 						rname+='<option value="access_log" selected>access_log</option>'
							 						+'<option value="error_log" >error_log</option>';
							 					}else{
							 						rname+='<option value="access_log">access_log</option>'
								 						+'<option value="error_log" selected>error_log</option>';
							 					}
							 					ngConfigPartHtml += rname					
	 											+'</select>'
	 											+'<input type="text" id="LogFileDirPath" class="LogFileDirPath" name="LogFileDirPath" value="'+CfgsList.LogRule.LogFileDirPath+'">'
							 					+'<input type="text" id="" name="" value="'+CfgsList.Location+'_access_log" disabled>'
							 					+'<input type="text" id="LogTemplateName" class="LogTemplateName" name="LogTemplateName" value="'+CfgsList.LogRule.LogTemplateName+'">;'
							 					+'</div>';
							 					var LocationUserRulesStr='';
							 					var LocationUserRules = CfgsList.LocationUserRules.UserRuleSet;
							 	 	 	 		if(LocationUserRules != null){
							 	 	 	 		
							 	 				for(var loNum=0; loNum<LocationUserRules.length; loNum++){
							 	 					
							 	 						LocationUserRulesStr+='<div class="col-md-offset-2 nginx-label LocationUserRulesDiv" RuleCMD="'+LocationUserRules[loNum].RuleCMD+'" RuleParam="'+LocationUserRules[loNum].RuleParam+'">'
							 	 	 	 					+'<span>|-<span>'
							 	 	 	 					+'<input type="text" class="def-input RuleCMD" id="LocationRuleCMD" name="LocationRuleCMD" value="'+LocationUserRules[loNum].RuleCMD+'"><span>:</span>'
							 	 	 	 					+'<input type="text" class="def-input RuleParam" id="LocationRuleParam" name="LocationRuleParam" value="'+LocationUserRules[loNum].RuleParam+'">;'
							 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
							 	 	 	 					+'</div>'
							 	 					
							 	 				}
							 	 	 	 		}
							 	 	 				
							ngConfigPartHtml += LocationUserRulesStr
							 					+'<div class="col-md-offset-2 def-text">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
							 					+'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>}</span>'
												+				'</div>'
												var ServerUserRulesStr='';
												var ServerUserRules= CfgsList.ServerUserRules.UserRuleSet;
												if(ServerUserRules != null){
													
							 	 	 				for(var seNum=0; seNum<ServerUserRules.length; seNum++){
							 	 	 					
							 	 	 					ServerUserRulesStr+='<div class="col-md-offset-1 nginx-label ServerUserRulesDiv" RuleCMD="'+ServerUserRules[seNum].RuleCMD+'" RuleParam="'+ServerUserRules[seNum].RuleParam+'">'
							 	 	 	 	 					+'<span>|-<span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleCMD" class="def-input RuleCMD" name="ServerRuleCMD" value="'+ServerUserRules[seNum].RuleCMD+'"><span>:</span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleParam" class="def-input RuleParam" name="ServerRuleParam" value="'+ServerUserRules[seNum].RuleParam+'">;'
							 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
							 	 	 	 	 					+'</div>'
							 	 	 					
							 	 	 				}
												}
							ngConfigPartHtml += ServerUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span></div>'
												+				'<div class="nginx-label">'
												+					'<span>}</span>'
												+				'</div>'
												+			'</div>'
												+		'</div>'
												+	'</div>'
												+'</form> '
												+'</div>'
											+'</div>';
										
		}
		strs += ngConfigPartHtml+'</div>';
		strs +='</div></div>';	
	}
	$("#nginxCfgHtml").empty().append(strs);
	
}

/**
	 * 增加一个upstreamUserRules
	 */
	function addOneupstreamUserRulesPlus(obj){
		var strs='';
		strs+='<div class="col-md-offset-1 def-input nginx-label UpstreamUserRulesDiv">'
				+'<span>|-<span>'
				+'<input type="text" class="first-text RuleCMD" name="UpstreamRuleCMD" value=""><span>:</span>'
				+'<input type="text" class="sec-text RuleParam" name="UpstreamRuleParam" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
				+'</div>'
		$(obj).parent().parent().after(strs);
	}
	function removeOneupstreamUserRulesPlus(obj){
		$(obj).parent().parent().parent().parent().remove();
	}
/**
	 * 增加一个location的用户自定义配置
	 * @param obj
	 */
	function addOnelocationUserRulesPlus(obj){
		var LogRuleHtml='';
		LogRuleHtml+='<div class="col-md-offset-2 def-input nginx-label LocationUserRulesDiv">'
				+'<span>|-<span>'
				+'<input type="text" class="first-text RuleCMD" name="LocationRuleCMD" value=""><span>:</span>'
				+'<input type="text" class="sec-text RuleParam" name="LocationRuleParam" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
				+'</div>'
		$(obj).parent().parent().after(LogRuleHtml);
	}
	function removeOnelocationUserRulesPlus(obj){
		$(obj).parent().parent().parent().parent().remove();
	}
	/**
	 * 增加一个server用户自定义配置
	 * @param obj
	 */
	function addOneserverUserRulesPlus(obj){
		var strs='';
		strs+='<div class="col-md-offset-1 def-input nginx-label ServerUserRulesDiv">'
				+'<span>|-<span>'
				+'<input type="text" class="first-text RuleCMD" name="ServerRuleCMD" value=""><span>:</span>'
				+'<input type="text" class="sec-text RuleParam" name="ServerRuleParam" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
				+'</div>'
		$(obj).parent().parent().after(strs);
	}
	function removeOneserverUserRulesPlus(obj){
		$(obj).parent().parent().parent().parent().remove();
	}

	/**
	 * 新增一个ng
	 * @param obj
	 */
	function addOneSerPart(obj){
	//function addOneSerPart(obj,ServerName,ListenPort,RealServerPath,Namespace,AppName,Location,ProxyRedirectSrcPath,ProxyRedirectDestPath,IsUpstreamIPHash,DeleteUserCfgs,IsDefaultCfg,AppSrcType){	
		var ServerName =$(obj).attr("ServerName");
        var ListenPort = $(obj).attr("ListenPort");
        var RealServerPath = $(obj).attr("RealServerPath");
        var Namespace = $(obj).attr("Namespace");
        var AppName = $(obj).attr("AppName");
        var Location = $(obj).attr("Location");
        var ProxyRedirectSrcPath = $(obj).attr("ProxyRedirectSrcPath");
        var ProxyRedirectDestPath = $(obj).attr("ProxyRedirectDestPath");
        var IsUpstreamIPHash = $(obj).attr("IsUpstreamIPHash");
        var DeleteUserCfgs = $(obj).attr("DeleteUserCfgs");
        var IsDefaultCfg = $(obj).attr("IsDefaultCfg");
        var AppSrcType = $(obj).attr("CfgType");

		var str='<div class="ngConfigPart" border:1px solid #FF0000 >' 
			+'<input type="checkbox" class="ngConfigCheckbox"/> '
//			+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> '
			+'<span><i class="fa fa-save fa-one" onClick="nginxFormCommOne(this)"></i></span> '
			+'<span><i class="fa fa-trash fa-one" onClick="removeOneSerPart(this)"></i></span> '
			+'<span><i class="fa fa-caret-down fa-one" onClick="toggleOneSerPart(this)"></i></span> '
			+'<span>未提交的配置</span>'
			+'<span class="ngConfigPartTit"></span>'
			+'<div class="ngConfigPartCon">'
			+'<form class="nginxForm" id="nginxForm" method="post" action="" AppSrcType="'+AppSrcType+'">'
			// +'<input type="hidden" name="serviceAppName" value="'+namespace+'-'+appName+'"/>'
			// +'<input type="hidden" name="appName" value="'+appName+'"/>'
			// +'<input type="hidden" name="namespace" value="'+namespace+'"/>'
			// +'<input type="hidden" name="nodeIp" value="'+nodeIp+'"/>'
			// +'<input type="hidden" name="nodePort" value="'+nodePort+'"/>'
			+'<div class="nginx-label">'
			+'<span class="upstreamPartTit">upstream</span><input type="text" id="appNameAndNamespace" class="appNameAndNamespace" appname="'+AppName+'" namespace="'+Namespace+'" name="appNameAndNamespace" value="'+AppName+'-'+Namespace+'" disabled>{'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">'
			var iphash='';	
			if(IsUpstreamIPHash==false){
				iphash+='<option value="false" selected="selected">none</option>'
					+'<option value="true">ip_hash</option>';
				}else{
					iphash+='<option value="false">none</option>'
					+'<option value="true" selected="selected">ip_hash</option>';
				}
			str += iphash
			+'</select>;'
			+'</div>'
			+'<div id="nginx-sers"><div class="nginx-label col-md-offset-1">'
			+'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="系统自动获取">;'
			+'</div>'
			+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span>'
			+'</div>'
			+'</div>'
			
			+'<div class="nginx-label">'
			+'<span>}</span>'
			+'</div>'
			+'<div class="serverPartList">'
			+'<div class="serverPart">'
			+'<div class="nginx-label">'
			+'<span class="serverPartTit">server{</span>'
			+'</div>'
			+'<div class="serverPartCon">'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>listen:</span><input type="text" id="ListenPort" class="ListenPort" name="ListenPort" value="'+ListenPort+'">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>server_name:</span><input type="text" id="ServerName" class="ServerName"  name="ServerName" value="'+ServerName+'">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>location:</span><input type="text" id="Location" class="Location" name="Location" value="'+Location+'">{'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+AppName+'-'+Namespace+'" disabled><input type="text" id="RealServerPath" class="RealServerPath" name="RealServerPath" value="'+RealServerPath+'">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+ListenPort+'" disabled>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+ListenPort+'" disabled>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" class="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+ProxyRedirectSrcPath+'">'
			+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" class="ProxyRedirectDestPath" value="'+ProxyRedirectDestPath+'">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>log规则名：</span>'
			+'<select id="LogRuleName" name="LogRuleName" >'
			+'<option value="access_log" >access_log</option>'
			+'<option value="error_log" >error_log</option>'
			+'</select>'
			+'<span>log日志路径：</span><input type="text" id="LogFileDirPath" name="LogFileDirPath" value="">'
			+'<span>log模板名：</span><input type="text" id="LogTemplateName" name="LogTemplateName" value="">;'
			+'</div>'
			+'<div class="col-md-offset-2 def-text">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>}</span>'
			+'</div>'
			+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
			+'</div>'
			+'<div class="nginx-label">'
			+'<span>}</span>'
			+'</div>'
			+'</div>'
			+'</div>'
			+'</div>'
			+'</form> '
			+'</div>'
			+'</div>';
		$(obj).parent().parent().after(str);
	}
	
	/**
	 * 删除一个没有提交的ng配置
	 */
	function removeOneSerPart(obj){
		$(obj).parent().parent().remove();
	}
	
	/**
	 * 提交一个ng配置
	 * @param obj
	 */
	function saveSerPart(obj){
		var ngConfigPart = $(obj).parent().parent().find('.nginxForm');
		var nginxform = ngConfigPart;
		localRefreshNg(obj);
	} 
	
	/**
 	 * 局部刷新
 	 */
 	function RulesData(RulesDiv){
 		var itemRules = new Array();
		for(var i=0; i<RulesDiv.length; i++){
			var tranRulesDiv = RulesDiv[i];
			var RuleCMD = $(tranRulesDiv).find(".RuleCMD").val();
			var RuleParam = $(tranRulesDiv).find(".RuleParam").val();
			var eveRule = {
				"RuleCMD": RuleCMD,
         		"RuleParam": RuleParam
			};
			itemRules.push(eveRule);
		}
		return itemRules;
 	}

 	function localRefreshNg(obj){
		var ngConfigPart = $(obj).parent().parent().find('.nginxForm');
		var ServerName = ngConfigPart.find("#ServerName").val();
		var ListenPort = ngConfigPart.find("#ListenPort").val();
		var RealServerPath = ngConfigPart.find(".RealServerPath").val();
		var Namespace = ngConfigPart.find(".appNameAndNamespace").attr("namespace");
		var AppName = ngConfigPart.find(".appNameAndNamespace").attr("appname");
		var Location = ngConfigPart.find("#Location").val();
		var ProxyRedirectSrcPath = ngConfigPart.find("#ProxyRedirectSrcPath").val();
		var ProxyRedirectDestPath = ngConfigPart.find("#ProxyRedirectDestPath").val();
		var IsUpstreamIPHash = ngConfigPart.find("#IsUpstreamIPHash").val();
		if(IsUpstreamIPHash == "true"){
			IsUpstreamIPHash = true;
		}else{
			IsUpstreamIPHash = false;
		}
		//OperationType 新建create 删除delete 更新update

		var OperationType = "create";

		var UpstreamUserRules = "";
		if(ngConfigPart.find(".UpstreamUserRulesDiv")){
			UpstreamUserRules = RulesData(ngConfigPart.find(".UpstreamUserRulesDiv"));
		}else{
			UpstreamUserRules = null;
		}

		var ServerUserRules = "";
		if(ngConfigPart.find(".ServerUserRulesDiv")){
			ServerUserRules = RulesData(ngConfigPart.find(".ServerUserRulesDiv"));
		}else{
			ServerUserRules = null;
		}

		var LocationUserRules ="";
		if(ngConfigPart.find(".LocationUserRulesDiv")){
			LocationUserRules = RulesData(ngConfigPart.find(".LocationUserRulesDiv"));
		}else{
			LocationUserRules = null;
		}

		var LogRuleName = ngConfigPart.find(".LogRuleName").val();
		var LogFileDirPath = ngConfigPart.find(".LogFileDirPath").val();
		var LogTemplateName = ngConfigPart.find(".LogTemplateName").val();
		var DeleteUserCfgs = false;
		var IsDefaultCfg = false;
		var AppSrcType = ngConfigPart.attr("AppSrcType");
		
	var saveData = {
      "ServerName": ServerName,
      "ListenPort": ListenPort,
      "RealServerPath": RealServerPath,
      "Namespace": Namespace,
      "AppName": AppName,
      "Location": Location,
      "ProxyRedirectSrcPath": ProxyRedirectSrcPath,
      "ProxyRedirectDestPath": ProxyRedirectDestPath,
      "IsUpstreamIPHash": IsUpstreamIPHash,
      "OperationType": OperationType,
      "UpstreamUserRules": {
       "UserRuleSet": UpstreamUserRules
      },
      "ServerUserRules": {
       "UserRuleSet": ServerUserRules
      },
      "LocationUserRules": {
       "UserRuleSet": LocationUserRules
      },
      "LogRule": {
       "LogRuleName": LogRuleName,
       "LogFileDirPath": LogFileDirPath,
       "LogTemplateName": LogTemplateName
      },
      "DeleteUserCfgs": DeleteUserCfgs,
      "IsDefaultCfg": IsDefaultCfg,
      "AppSrcType": AppSrcType
     };

		var areaIP = "localhost";
		var areaPort = "port";
		var AppNameAndNamespace = Namespace+'-'+AppName;
		var saveUrl = "http://"+areaIP+":"+areaPort+"/nginxcfg?AppNameAndNamespace="+AppNameAndNamespace+"&NodeIP="+NodeIP+"&ClientID="+ClientID;
		$.ajax({
			url : saveUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "put",//update操作 
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: JSON.stringify(saveData),
			success :function(data){
				var CfgsList = data.WebCfg;
				if(data.Result == false){
					layer.alert(data.ErrorMessage, {
					  icon: 2,
					 title:"保存失败",
					  skin: 'layer-ext-moon'
					})
				}else{
					
				
				
	 		var saveDataHtml = "";	
				
            saveDataHtml +='<div class="ngConfigPartCon">'
												+ '<form class="nginxForm" method="post" action="" AppSrcType="'+CfgsList.AppSrcType+'">'
												+	'<div class="nginx-label">'
												+		'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" AppName="'+CfgsList.AppName+'" Namespace="'+CfgsList.Namespace+'" value="'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled>{'
												+	'</div>'
												+	'<div class="nginx-label col-md-offset-1">'
												+		'<select id="IsUpstreamIPHash" name="IsUpstreamIPHash" value="'+CfgsList.IsUpstreamIPHash+'">';
												var iphash='';	
							 					if(CfgsList.IsUpstreamIPHash==false){
												    iphash+='<option value="false" selected="selected">none</option>'
												    	  +'<option value="true">ip_hash</option>';
												}else{
													iphash+='<option value="false">none</option>'
														  +'<option value="true" selected="selected">ip_hash</option>';
												}
							saveDataHtml += iphash
												+		'</select>;'
												+	'</div>'
												+'<div id="nginx-sers">';
												var UpstreamIPsHtml = '';
												var UpstreamIPsArray = CfgsList.UpstreamIPs;
												if(UpstreamIPsArray != null){
													for(var m=0; m<UpstreamIPsArray.length; m++){
													UpstreamIPsHtml	+='<div class="nginx-label col-md-offset-1">'
														+'<span>server:</span><input type="text" class="ipAndUpstreamPort" value="'+UpstreamIPsArray[m]+':'+CfgsList.UpstreamPort+'">;'
														+	'</div>';
													}
												}
												
												
							saveDataHtml +=	UpstreamIPsHtml
												+'</div>';
												var UpstreamUserRulesStr='';
												var UpstreamUserRules = CfgsList.UpstreamUserRules.UserRuleSet;
								 				if(UpstreamUserRules != null){
								 					
									 				for(var upNum=0; upNum<UpstreamUserRules.length; upNum++){
									 					
									 					UpstreamUserRulesStr+='<div class="col-md-offset-1 nginx-label UpstreamUserRulesDiv" RuleCMD="'+UpstreamUserRules[upNum].RuleCMD+'" RuleParam="'+UpstreamUserRules[upNum].RuleParam+'">'
									 	 	 					+'<span>|-<span>'
									 	 	 					+'<input type="text" id="UpstreamRuleCMD" class="def-input RuleCMD" name="UpstreamRuleCMD" value="'+UpstreamUserRules[upNum].RuleCMD+'"><span>:</span>'
									 	 	 					+'<input type="text" id="UpstreamRuleParam" class="def-input RuleParam" name="UpstreamRuleParam" value="'+UpstreamUserRules[upNum].RuleParam+'">;'
									 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
									 	 	 					+'</div>'
									 					
									 				}
								 				}
							saveDataHtml += UpstreamUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span></div>'
												
												+	'<div class="nginx-label">'
												+		'<span>}</span>'
												+	'</div>'
												+	'<div class="serverPartList">'
												+		'<div class="serverPart">'
												+			'<div class="nginx-label">'
												+				'<span class="serverPartTit">server{</span>'
												+			'</div>'
												+			'<div class="serverPartCon">'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>listen:</span><input type="text" id="ListenPort" name="ListenPort" value="'+CfgsList.ListenPort+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>server_name:</span><input type="text" id="ServerName"  name="ServerName" value="'+CfgsList.ServerName+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>location:</span><input type="text" id="Location" name="Location" value="'+CfgsList.Location+'">{'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled><input type="text" class="RealServerPath" name="" value="'+CfgsList.RealServerPath+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+CfgsList.ProxyRedirectSrcPath+'">'
												+					'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+CfgsList.ProxyRedirectDestPath+'">;'
												+				'</div>'
												+'<div class="nginx-label col-md-offset-2">'
	 											+'<select id="LogRuleName" class="LogRuleName" name="LogRuleName" value="'+CfgsList.LogRule.LogRuleName+'">';
	 											var rname ='';
							 					if(CfgsList.LogRule.LogRuleName=="access_log"){
							 						rname+='<option value="access_log" selected>access_log</option>'
							 						+'<option value="error_log" >error_log</option>';
							 					}else{
							 						rname+='<option value="access_log">access_log</option>'
								 						+'<option value="error_log" selected>error_log</option>';
							 					}
							saveDataHtml += rname					
	 											+'</select>'
	 											+'<input type="text" id="LogFileDirPath" class="LogFileDirPath" name="LogFileDirPath" value="'+CfgsList.LogRule.LogFileDirPath+'">'
							 					+'<input type="text" id="" name="" value="'+CfgsList.Location+'_access_log" disabled>'
							 					+'<input type="text" id="LogTemplateName" class="LogTemplateName" name="LogTemplateName" value="'+CfgsList.LogRule.LogTemplateName+'">;'
							 					+'</div>';
							 					var LocationUserRulesStr='';
							 					var LocationUserRules = CfgsList.LocationUserRules.UserRuleSet;
							 	 	 	 		if(LocationUserRules != null){
							 	 	 	 		
							 	 				for(var loNum=0; loNum<LocationUserRules.length; loNum++){
							 	 					
							 	 						LocationUserRulesStr+='<div class="col-md-offset-2 nginx-label LocationUserRulesDiv" RuleCMD="'+LocationUserRules[loNum].RuleCMD+'" RuleParam="'+LocationUserRules[loNum].RuleParam+'">'
							 	 	 	 					+'<span>|-<span>'
							 	 	 	 					+'<input type="text" class="def-input RuleCMD" id="LocationRuleCMD" name="LocationRuleCMD" value="'+LocationUserRules[loNum].RuleCMD+'"><span>:</span>'
							 	 	 	 					+'<input type="text" class="def-input RuleParam" id="LocationRuleParam" name="LocationRuleParam" value="'+LocationUserRules[loNum].RuleParam+'">;'
							 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
							 	 	 	 					+'</div>'
							 	 					
							 	 				}
							 	 	 	 		}
							 	 	 				
							saveDataHtml += LocationUserRulesStr
							 					+'<div class="col-md-offset-2 def-text">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
							 					+'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>}</span>'
												+				'</div>'
												var ServerUserRulesStr='';
												var ServerUserRules= CfgsList.ServerUserRules.UserRuleSet;
												if(ServerUserRules != null){
													
							 	 	 				for(var seNum=0; seNum<ServerUserRules.length; seNum++){
							 	 	 					
							 	 	 					ServerUserRulesStr+='<div class="col-md-offset-1 nginx-label ServerUserRulesDiv" RuleCMD="'+ServerUserRules[seNum].RuleCMD+'" RuleParam="'+ServerUserRules[seNum].RuleParam+'">'
							 	 	 	 	 					+'<span>|-<span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleCMD" class="def-input RuleCMD" name="ServerRuleCMD" value="'+ServerUserRules[seNum].RuleCMD+'"><span>:</span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleParam" class="def-input RuleParam" name="ServerRuleParam" value="'+ServerUserRules[seNum].RuleParam+'">;'
							 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
							 	 	 	 	 					+'</div>'
							 	 	 					
							 	 	 				}
												}
							saveDataHtml += ServerUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span></div>'
												+				'<div class="nginx-label">'
												+					'<span>}</span>'
												+				'</div>'
												+			'</div>'
												+		'</div>'
												+	'</div>'
												+'</form> '
												+'</div>';
		 		ngConfigPart.empty().append(saveDataHtml);
			}
			}
		});
 	}
	
	
	/**
	 * 删除一个ng配置
	 * @param obj
	 */
	// function delOneSerPart(obj){
	// 	var appName = $(obj).attr("appName");
	// 	var namespace= $(obj).attr("namespace");
	//  	var serviceName= namespace+'-'+appName;
	//  	var serverName=$(obj).attr("serverName");
	//  	var listenPort=$(obj).attr("listenPort");
	//  	confseq=serverName+':'+listenPort;
	//  	var flag = $(obj).attr("flag");
	//  	var nodeIp = $(obj).attr("nodeIp");
	//  	var nodePort = $(obj).attr("nodePort");
	//  	$.ajax({
 // 			url:""+ctx+"/deleteNginxCfgs",
 // 			type:"POST",
 // 			data:{"serviceName":serviceName,"flag":flag,"confseq":confseq,"had":true,"appName":appName,"namespace":namespace,"nodeIp":nodeIp,"nodePort":nodePort},
 // 			success:function(data){
 // 				 var data = eval("("+data+")");
 // 				 if("200"==data.status){
 // 					layer.msg( "删除成功！", {
	// 	                icon: 1
	// 	            })
 // 					$(obj).parent().parent().remove();
 // 				 }else if("502"==data.status){
 // 					alert(data.message);
 // 				 }else if("501"==data.status){
 // 					 alert(data.message);
 // 				 }else{
 // 					 alert(data.message);
 // 				 }
 // 			}
 // 	 });
	// }

/**
	 * 查询一个应用下的所有NG配置
	 * @param obj
	 */
	function findNgByOneApp(obj){
		var areaIP = "localhost";
		var areaPort = "port";
		//var area=$("#area").val();
		var appName = $(obj).val();
		var namespace= $(obj).parent().next().find("#search_user").val();
		var AppNameAndNamespace = namespace+'-'+appName;
	 	var OneAppUrl = "http://"+areaIP+":"+areaPort+"/nginxcfg/"+AppNameAndNamespace+"?NodeIP="+NodeIP+"&ClientID="+ClientID+"&AppSrcType="+AppSrcType;
		layer.msg('加载中', {
			  icon: 16,
			  shade: 0.1,
			  time: 400
			});
	 	$.ajax({
			url:OneAppUrl,
			type:"get",
			//data:{"appName":appName,"namespace":namespace},
			success:function(data){
				var data = data;
				showNgsHtml(data);
				$(".addOneSerPart").removeClass("hide");
			}
		})
	}

	/**
	 * 删除一个ng配置
	 * @param obj
	 */
	function delOneSerPart(obj){
		var ngConfigPart = $(obj).parent().parent().find('.nginxForm');
		var ServerName = ngConfigPart.find("#ServerName").val();
		var ListenPort = ngConfigPart.find("#ListenPort").val();
		var Namespace = ngConfigPart.find(".appNameAndNamespace").attr("namespace");
		var AppName = ngConfigPart.find(".appNameAndNamespace").attr("appname");
		var AppSrcType = ngConfigPart.attr("AppSrcType");

		var deleteData = {
	      "ServerName": ServerName,
	      "ListenPort": ListenPort,
	      "Namespace": Namespace,
	      "AppName": AppName,
		  "AppSrcType": AppSrcType
	    };

	    var areaIP = "localhost";
		var areaPort = "port";
		var deleteUrl = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP="+NodeIP+"&ClientID="+ClientID;

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
				 	data: JSON.stringify(deleteData),
					
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
	/**
	 * 提交一个ng配置
	 * @param obj
	 */
	function nginxFormCommOne(obj){
		var ngConfigPart = $(obj).parent().parent().find('#nginxForm');
		var nginxform = ngConfigPart;
		
		var ServerName = ngConfigPart.find("#ServerName").val();
		var ListenPort = ngConfigPart.find("#ListenPort").val();
		var RealServerPath = ngConfigPart.find(".RealServerPath").val();
		var Namespace = ngConfigPart.find(".appNameAndNamespace").attr("namespace");
		var AppName = ngConfigPart.find(".appNameAndNamespace").attr("appname");
		var Location = ngConfigPart.find("#Location").val();
		var ProxyRedirectSrcPath = ngConfigPart.find("#ProxyRedirectSrcPath").val();
		var ProxyRedirectDestPath = ngConfigPart.find("#ProxyRedirectDestPath").val();
		var IsUpstreamIPHash = ngConfigPart.find("#IsUpstreamIPHash").val();
		if(IsUpstreamIPHash == "true"){
			IsUpstreamIPHash = true;
		}else{
			IsUpstreamIPHash = false;
		}
		//OperationType 新建create 删除delete 更新update

		var OperationType = "create";

		var UpstreamUserRules = "";
		if(ngConfigPart.find(".UpstreamUserRulesDiv")){
			UpstreamUserRules = RulesData(ngConfigPart.find(".UpstreamUserRulesDiv"));
		}else{
			UpstreamUserRules = null;
		}

		var ServerUserRules = "";
		if(ngConfigPart.find(".ServerUserRulesDiv")){
			ServerUserRules = RulesData(ngConfigPart.find(".ServerUserRulesDiv"));
		}else{
			ServerUserRules = null;
		}

		var LocationUserRules ="";
		if(ngConfigPart.find(".LocationUserRulesDiv")){
			LocationUserRules = RulesData(ngConfigPart.find(".LocationUserRulesDiv"));
		}else{
			LocationUserRules = null;
		}

		var LogRuleName = ngConfigPart.find(".LogRuleName").val();
		var LogFileDirPath = ngConfigPart.find(".LogFileDirPath").val();
		var LogTemplateName = ngConfigPart.find(".LogTemplateName").val();
		var DeleteUserCfgs = false;
		var IsDefaultCfg = false;
		var AppSrcType = ngConfigPart.attr("AppSrcType");
		
	var saveData = {
      "ServerName": ServerName,
      "ListenPort": ListenPort,
      "RealServerPath": RealServerPath,
      "Namespace": Namespace,
      "AppName": AppName,
      "Location": Location,
      "ProxyRedirectSrcPath": ProxyRedirectSrcPath,
      "ProxyRedirectDestPath": ProxyRedirectDestPath,
      "IsUpstreamIPHash": IsUpstreamIPHash,
      "OperationType": OperationType,
      "UpstreamUserRules": {
       "UserRuleSet": UpstreamUserRules
      },
      "ServerUserRules": {
       "UserRuleSet": ServerUserRules
      },
      "LocationUserRules": {
       "UserRuleSet": LocationUserRules
      },
      "LogRule": {
       "LogRuleName": LogRuleName,
       "LogFileDirPath": LogFileDirPath,
       "LogTemplateName": LogTemplateName
      },
      "DeleteUserCfgs": DeleteUserCfgs,
      "IsDefaultCfg": IsDefaultCfg,
      "AppSrcType": AppSrcType
     };

		var areaIP = "localhost";
		var areaPort = "port";
		
		var saveUrl = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP="+NodeIP+"&ClientID="+ClientID;
		$.ajax({
			url : saveUrl,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "post", 
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: JSON.stringify(saveData),
			success :function(data){
				var CfgsList = data.WebCfg;
				// if(data.Result == false){
				// 	layer.alert(data.ErrorMessage, {
				// 	  icon: 2,
				// 	 title:"提交失败",
				// 	  skin: 'layer-ext-moon'
				// 	})
				// }else{
					
				
				
	 		var saveDataHtml = "";	
				
            saveDataHtml +='<div class="ngConfigPartCon">'
												+ '<form class="nginxForm" method="post" action="" AppSrcType="'+CfgsList.AppSrcType+'">'
												+	'<div class="nginx-label">'
												+		'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" AppName="'+CfgsList.AppName+'" Namespace="'+CfgsList.Namespace+'" value="'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled>{'
												+	'</div>'
												+	'<div class="nginx-label col-md-offset-1">'
												+		'<select id="IsUpstreamIPHash" name="IsUpstreamIPHash" value="'+CfgsList.IsUpstreamIPHash+'">';
												var iphash='';	
							 					if(CfgsList.IsUpstreamIPHash==false){
												    iphash+='<option value="false" selected="selected">none</option>'
												    	  +'<option value="true">ip_hash</option>';
												}else{
													iphash+='<option value="false">none</option>'
														  +'<option value="true" selected="selected">ip_hash</option>';
												}
							saveDataHtml += iphash
												+		'</select>;'
												+	'</div>'
												+'<div id="nginx-sers">';
												var UpstreamIPsHtml = '';
												var UpstreamIPsArray = CfgsList.UpstreamIPs;
												if(UpstreamIPsArray != null){
													for(var m=0; m<UpstreamIPsArray.length; m++){
													UpstreamIPsHtml	+='<div class="nginx-label col-md-offset-1">'
														+'<span>server:</span><input type="text" class="ipAndUpstreamPort" value="'+UpstreamIPsArray[m]+':'+CfgsList.UpstreamPort+'">;'
														+	'</div>';
													}
												}
												
												
							saveDataHtml +=	UpstreamIPsHtml
												+'</div>';
												var UpstreamUserRulesStr='';
												var UpstreamUserRules = CfgsList.UpstreamUserRules.UserRuleSet;
								 				if(UpstreamUserRules != null){
								 					
									 				for(var upNum=0; upNum<UpstreamUserRules.length; upNum++){
									 					
									 					UpstreamUserRulesStr+='<div class="col-md-offset-1 nginx-label UpstreamUserRulesDiv" RuleCMD="'+UpstreamUserRules[upNum].RuleCMD+'" RuleParam="'+UpstreamUserRules[upNum].RuleParam+'">'
									 	 	 					+'<span>|-<span>'
									 	 	 					+'<input type="text" id="UpstreamRuleCMD" class="def-input RuleCMD" name="UpstreamRuleCMD" value="'+UpstreamUserRules[upNum].RuleCMD+'"><span>:</span>'
									 	 	 					+'<input type="text" id="UpstreamRuleParam" class="def-input RuleParam" name="UpstreamRuleParam" value="'+UpstreamUserRules[upNum].RuleParam+'">;'
									 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
									 	 	 					+'</div>'
									 					
									 				}
								 				}
							saveDataHtml += UpstreamUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span></div>'
												
												+	'<div class="nginx-label">'
												+		'<span>}</span>'
												+	'</div>'
												+	'<div class="serverPartList">'
												+		'<div class="serverPart">'
												+			'<div class="nginx-label">'
												+				'<span class="serverPartTit">server{</span>'
												+			'</div>'
												+			'<div class="serverPartCon">'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>listen:</span><input type="text" id="ListenPort" name="ListenPort" value="'+CfgsList.ListenPort+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>server_name:</span><input type="text" id="ServerName"  name="ServerName" value="'+CfgsList.ServerName+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>location:</span><input type="text" id="Location" name="Location" value="'+CfgsList.Location+'">{'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+CfgsList.AppName+'-'+CfgsList.Namespace+'" disabled><input type="text" class="RealServerPath" name="" value="'+CfgsList.RealServerPath+'">;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="" disabled>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
												+				'</div>'
												+				'<div class="nginx-label col-md-offset-2">'
												+					'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+CfgsList.ProxyRedirectSrcPath+'">'
												+					'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+CfgsList.ProxyRedirectDestPath+'">;'
												+				'</div>'
												+'<div class="nginx-label col-md-offset-2">'
	 											+'<select id="LogRuleName" class="LogRuleName" name="LogRuleName" value="'+CfgsList.LogRule.LogRuleName+'">';
	 											var rname ='';
							 					if(CfgsList.LogRule.LogRuleName=="access_log"){
							 						rname+='<option value="access_log" selected>access_log</option>'
							 						+'<option value="error_log" >error_log</option>';
							 					}else{
							 						rname+='<option value="access_log">access_log</option>'
								 						+'<option value="error_log" selected>error_log</option>';
							 					}
							saveDataHtml += rname					
	 											+'</select>'
	 											+'<input type="text" id="LogFileDirPath" class="LogFileDirPath" name="LogFileDirPath" value="'+CfgsList.LogRule.LogFileDirPath+'">'
							 					+'<input type="text" id="" name="" value="'+CfgsList.Location+'_access_log" disabled>'
							 					+'<input type="text" id="LogTemplateName" class="LogTemplateName" name="LogTemplateName" value="'+CfgsList.LogRule.LogTemplateName+'">;'
							 					+'</div>';
							 					var LocationUserRulesStr='';
							 					var LocationUserRules = CfgsList.LocationUserRules.UserRuleSet;
							 	 	 	 		if(LocationUserRules != null){
							 	 	 	 		
							 	 				for(var loNum=0; loNum<LocationUserRules.length; loNum++){
							 	 					
							 	 						LocationUserRulesStr+='<div class="col-md-offset-2 nginx-label LocationUserRulesDiv" RuleCMD="'+LocationUserRules[loNum].RuleCMD+'" RuleParam="'+LocationUserRules[loNum].RuleParam+'">'
							 	 	 	 					+'<span>|-<span>'
							 	 	 	 					+'<input type="text" class="def-input RuleCMD" id="LocationRuleCMD" name="LocationRuleCMD" value="'+LocationUserRules[loNum].RuleCMD+'"><span>:</span>'
							 	 	 	 					+'<input type="text" class="def-input RuleParam" id="LocationRuleParam" name="LocationRuleParam" value="'+LocationUserRules[loNum].RuleParam+'">;'
							 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
							 	 	 	 					+'</div>'
							 	 					
							 	 				}
							 	 	 	 		}
							 	 	 				
							saveDataHtml += LocationUserRulesStr
							 					+'<div class="col-md-offset-2 def-text">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
							 					+'</div>'
												+				'<div class="nginx-label col-md-offset-1">'
												+					'<span>}</span>'
												+				'</div>'
												var ServerUserRulesStr='';
												var ServerUserRules= CfgsList.ServerUserRules.UserRuleSet;
												if(ServerUserRules != null){
													
							 	 	 				for(var seNum=0; seNum<ServerUserRules.length; seNum++){
							 	 	 					
							 	 	 					ServerUserRulesStr+='<div class="col-md-offset-1 nginx-label ServerUserRulesDiv" RuleCMD="'+ServerUserRules[seNum].RuleCMD+'" RuleParam="'+ServerUserRules[seNum].RuleParam+'">'
							 	 	 	 	 					+'<span>|-<span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleCMD" class="def-input RuleCMD" name="ServerRuleCMD" value="'+ServerUserRules[seNum].RuleCMD+'"><span>:</span>'
							 	 	 	 	 					+'<input type="text" id="ServerRuleParam" class="def-input RuleParam" name="ServerRuleParam" value="'+ServerUserRules[seNum].RuleParam+'">;'
							 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
							 	 	 	 	 					+'</div>'
							 	 	 					
							 	 	 				}
												}
							saveDataHtml += ServerUserRulesStr
												+'<div class="col-md-offset-1 def-text">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span></div>'
												+				'<div class="nginx-label">'
												+					'<span>}</span>'
												+				'</div>'
												+			'</div>'
												+		'</div>'
												+	'</div>'
												+'</form> '
												+'</div>';
		 		ngConfigPart.empty().append(saveDataHtml);
			//}
			}
		});
		
	} 
	/**
	 * 导出一个node的配置信息
	 * @param obj
	 */
	function nginxExport(obj){
		layer.open({
			type: 1,
	        title: '请填写该服务器的账号的密码再下载',
	        content: $("#nginxDownload"),
	        area:['400px'],
	        btn: ['确定', '取消'],
	        yes: function(index, layero){
	        	var ngDownUser = $("#nginxDownload #ngDownUser").val();
	        	var ngDownPwd = $("#nginxDownload #ngDownPwd").val();
	        	if(ngDownUser.length == 0){
	        		layer.tips('用户名不能为空', $("#nginxDownload #ngDownUser"),{tips: [1, '#EF6578']});
	        		return;
	        	}
	        	if(ngDownPwd.length == 0){
	        		layer.tips('密码不能为空', $("#nginxDownload #ngDownPwd"),{tips: [1, '#EF6578']});
	        		return;
	        	}
	        	//
	        	var downloadData={
	        		"User":ngDownUser,
	        		"Password":ngDownPwd,
	        		"NodeIP": NodeIP,
	        		"ClientID":ClientID
	        	};
	        	var areaIP = "localhost";
				var areaPort = "port";
				var downloadUrl = 'http://'+areaIP+':'+areaPort+'/nginxcfg/download';
	        	$.ajax({
					url : downloadUrl,
					dataType: "json",
					contentType: "text/html; charset=UTF-8",
		    		type: "post", 
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
					},
					data: JSON.stringify(downloadData),
					success :function(data){
						var data = data;
					}
				});
	        	
	        }
		});
	}
	
	