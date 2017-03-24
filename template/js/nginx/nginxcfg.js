// var data = {
//  "NodeIP": "192.168.252.133",
//  "ClientID": "50395",
//  "APIServerPort": ":8887",
//  "NginxList": [
//   {
//    "CfgType": "k8s",
//    "CfgsList": [
//     {
//      "ServerName": "bonc.local",
//      "ListenPort": "8081",
//      "RealServerPath": "/testa",
//      "Namespace": "huyuepeng",
//      "AppName": "testa",
//      "Location": "/huyuepeng/testa",
//      "ProxyRedirectSrcPath": "http://testa:8080/testa",
//      "ProxyRedirectDestPath": "/huyuepeng/testa",
//      "UpstreamIPs": null,
//      "UpstreamPort": "",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": false,
//      "OperationType": "create",
//      "IsK8sNotify": false,
//      "UpstreamUserRules": {
//      		 "UserRuleSet": null
//       },
//      "ServerUserRules": {
// 	       "UserRuleSet": [
// 	        {
// 	         "RuleCMD": "rewrite",
// 	         "RuleParam": "cccc cccc"
// 	        },
// 	        {
// 	         "RuleCMD": "rewrite",
// 	         "RuleParam": "dddd dddd"
// 	        }
// 	       ]
//      },
//      "LocationUserRules": {
// 	       "UserRuleSet": [
// 	        {
// 	         "RuleCMD": "rewrite",
// 	         "RuleParam": "eeee eeee"
// 	        },
// 	        {
// 	         "RuleCMD": "rewrite",
// 	         "RuleParam": "ffff ffff"
// 	        }
// 	       ]
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/bonc.local-8081/huyuepeng",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": false,
//      "AppSrcType": "k8s"
//     },
//     {
//      "ServerName": "longlong.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/alot",
//      "Namespace": "longlong",
//      "AppName": "alot",
//      "Location": "/alot",
//      "ProxyRedirectSrcPath": "http://alot:8080/alot",
//      "ProxyRedirectDestPath": "/alot",
//      "UpstreamIPs": [
//       "192.168.0.80"
//      ],
//      "UpstreamPort": "32353",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/longlong.yz.local-80/longlong",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "k8s"
//     },
//     {
//      "ServerName": "testbonc.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/demo-a",
//      "Namespace": "testbonc",
//      "AppName": "demo-a",
//      "Location": "/demo-a",
//      "ProxyRedirectSrcPath": "http://demo-a:8080/demo-a",
//      "ProxyRedirectDestPath": "/demo-a",
//      "UpstreamIPs": [
//       "192.168.0.82"
//      ],
//      "UpstreamPort": "31594",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/testbonc.yz.local-80/testbonc",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "k8s"
//     },
//     {
//      "ServerName": "testbonc.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/demo-b",
//      "Namespace": "testbonc",
//      "AppName": "demo-b",
//      "Location": "/demo-b",
//      "ProxyRedirectSrcPath": "http://demo-b:8080/demo-b",
//      "ProxyRedirectDestPath": "/demo-b",
//      "UpstreamIPs": [
//       "192.168.0.82"
//      ],
//      "UpstreamPort": "32285",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/testbonc.yz.local-80/testbonc",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "k8s"
//     }
//    ]
//   },
//   {
//    "CfgType": "extern",
//    "CfgsList": [
//     {
//      "ServerName": "nginx.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/testnginx",
//      "Namespace": "nginx",
//      "AppName": "testnginx",
//      "Location": "/testnginx",
//      "ProxyRedirectSrcPath": "http://testnginx:8080/testnginx",
//      "ProxyRedirectDestPath": "/testnginx",
//      "UpstreamIPs": [
//       "192.168.0.29"
//      ],
//      "UpstreamPort": "3306",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/nginx.yz.local-80/nginx",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "extern"
//     },
//     {
//      "ServerName": "testbonc.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/testdemoui",
//      "Namespace": "testbonc",
//      "AppName": "testdemoui",
//      "Location": "/testdemoui",
//      "ProxyRedirectSrcPath": "http://testdemoui:8080/testdemoui",
//      "ProxyRedirectDestPath": "/testdemoui",
//      "UpstreamIPs": [
//       "192.168.0.76"
//      ],
//      "UpstreamPort": "58985",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/testbonc.yz.local-80/testbonc",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "extern"
//     },
//     {
//      "ServerName": "testbonc.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/testwk",
//      "Namespace": "testbonc",
//      "AppName": "testwk",
//      "Location": "/testwk",
//      "ProxyRedirectSrcPath": "http://testwk:8080/testwk",
//      "ProxyRedirectDestPath": "/testwk",
//      "UpstreamIPs": [
//       "192.168.0.76"
//      ],
//      "UpstreamPort": "3306",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/testbonc.yz.local-80/testbonc",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "extern"
//     },
//     {
//      "ServerName": "nginx.yz.local",
//      "ListenPort": "80",
//      "RealServerPath": "/deletetest",
//      "Namespace": "nginx",
//      "AppName": "deletetest",
//      "Location": "/deletetest",
//      "ProxyRedirectSrcPath": "http://deletetest:8080/deletetest",
//      "ProxyRedirectDestPath": "/deletetest",
//      "UpstreamIPs": [
//       "192.168.0.29"
//      ],
//      "UpstreamPort": "1234",
//      "IsUpstreamIPHash": true,
//      "IsAppActivity": true,
//      "OperationType": "",
//      "IsK8sNotify": true,
//      "UpstreamUserRules": {
//       "UserRuleSet": null
//      },
//      "ServerUserRules": {
//       "UserRuleSet": null
//      },
//      "LocationUserRules": {
//       "UserRuleSet": null
//      },
//      "LogRule": {
//       "LogRuleName": "access_log",
//       "LogFileDirPath": "/var/log/nginx/nginx.yz.local-80/nginx",
//       "LogTemplateName": "main"
//      },
//      "DeleteUserCfgs": false,
//      "IsDefaultCfg": true,
//      "AppSrcType": "extern"
//     }
//    ]
//   }
//  ]
// };

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
	
//	$("#hypBtn").click(function(){
//		var areaIP = "192.168.85.130";
//		var areaPort = "8083";
//		var Url = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP=192.168.252.133&ClientID=49073";
		
//		var WebMsg = {
//			"ServerName": "测试ServerName222",
//			"ListenPort": "测试ListenPort",
//			"Namespace": "测试Namespace",
//			"AppName": "测试AppName",
//		    "AppSrcType": "k8s",
//			"Location": "测试location"
//	    };
		
//		$.ajax({
//			url : Url,
//			dataType: "json",
//			contentType: "text/html; charset=UTF-8",
//    		type: "delete",//update操作 
//			headers: {
//				"Content-Type": "application/json",
//				"Accept": "application/json",
//			},
//			data: JSON.stringify(WebMsg),
			
//			"success":function(data){
//				var data = eval("("+data+")");
//			}
//		})
//	});
	
	
	
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
 	var areaIP = "192.168.85.130";
	var areaPort = "8083";
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
			NamespacesAppCounts = data.NamespacesAppList;
			//租户option
			var userOptionHtml = "";
			for(var nsNum=0; nsNum<NamespacesList.length; nsNum++){
				userOptionHtml += '<option value="'+NamespacesList[nsNum]+'">'+NamespacesList[nsNum]+'</option>';
			}
			$("#search_user").append(userOptionHtml);
		}
	})
 }

 function searchByUser(obj){
 	var userVal = $(obj).val();

	//租户option改变生成对应的服务
	var serviceOptionHtml = '<option value="">-----请选择-----</option>';
	for(var i=0; i<NamespacesList.length; i++){
		if(NamespacesList[i] == userVal){
			for(var j=0; j<NamespacesAppCounts[i].length; j++){
				serviceOptionHtml += '<option value="'+NamespacesAppCounts[i][j]+'" namespacesName="'+NamespacesList[i]+'">'+NamespacesAppCounts[i][j]+'</option>';
			}
			$("#search_service").empty().append(serviceOptionHtml);
		}
		
 	}
}

//展示同一个node下的所有nginx配置
function showAllNgs(NodeIP,ClientID){
	var areaIP = "192.168.85.130";
	var areaPort = "8083";
	var Url = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP="+NodeIP+"&ClientID="+ClientID;
	//showNgsHtml(data);
	$.ajax({
			url : Url,
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
											+'<span class="hide"><i class="fa fa-plus fa-serverPlus fa-one" onClick="addOneSerPart(this)"></i></span>'
                                             + '<span><i class="fa fa-save fa-one" onClick="saveSerPart(this)"></i></span>'
                                             + '<span><i class="fa fa-trash fa-one" onClick="delOneSerPart(this)"></i></span>'
                                             + '<span><i class="fa fa-caret-down fa-one" onClick="toggleOneSerPart(this)"></i></span>'
                                             + '<span class="ngConfigPartTit"></span>'
												+ '<div class="ngConfigPartCon">'
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
	$("#nginxCfgHtml").append(strs);
	
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
		var appName='appName';
		var namespace='namespace';
		var nodeIp='nodeIp';
		var flag='flag';
		var nodePort='nodePort';
		var str='<div class="ngConfigPart" border:1px solid #FF0000 >' 
			+'<input type="checkbox" class="ngConfigCheckbox"/> '
//			+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> '
			+'<span><i class="fa fa-trash fa-one" onClick="removeOneSerPart(this)"></i></span> '
			+'<span><i class="fa fa-save fa-one" onClick="nginxFormCommOne(this)"></i></span> '
			+'<span><i class="fa fa-caret-down fa-one" onClick="toggleOneSerPart(this)"></i></span> '
			+'<span>未提交的配置</span>'
			+'<span class="ngConfigPartTit"></span>'
			+'<div class="ngConfigPartCon">'
			+'<form class="nginxForm" id="nginxForm" method="post" action="">'
			+'<input name="flag" value="'+flag+'" type="hidden"/>'
			+'<input type="hidden" name="serviceAppName" value="'+namespace+'-'+appName+'"/>'
			+'<input type="hidden" name="appName" value="'+appName+'"/>'
			+'<input type="hidden" name="namespace" value="'+namespace+'"/>'
			+'<input type="hidden" name="nodeIp" value="'+nodeIp+'"/>'
			+'<input type="hidden" name="nodePort" value="'+nodePort+'"/>'
			+'<div class="nginx-label">'
			+'<span class="upstreamPartTit">upstream</span><input type="text" id="appNameAndNamespace" class="appNameAndNamespace" name="appNameAndNamespace" value="'+appName+'-'+namespace+'" disabled>{'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">'
			+'<option value="0">none</option>'
			+'<option value="1">ip_hash</option>'
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
			+'<span>listen:</span><input type="text" id="ListenPort" name="ListenPort" value="80">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>server_name:</span><input type="text" id="serverName"  name="serverName" value="'+namespace+'.yz.local">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>location:</span><input type="text" id="Location" name="Location" value="/'+appName+'">{'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+appName+'-'+namespace+'" disabled><input type="text" id="realServerPath" name="realServerPath" value="/'+appName+'">;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="80" disabled>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="80" disabled>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
			+'</div>'
			+'<div class="nginx-label col-md-offset-2">'
			+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="http://'+appName+':8080/'+appName+'">'
			+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="/'+appName+'">;'
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
//		if(1==deforeNginxFormComm($(nginxform))){
//			return;
//		}
//		$(ngConfigPart).ajaxSubmit(function(data) {
//			var data = eval("("+data+")");
//			if('200'==data.status){
//            	if($('#search_service').val().length>0){
//            		//findNgByOneApp($('#search_service'));	
//            		localRefreshNg(obj);
//            	}else{
//            		if($('#search_user').val().length>0){
//            			//searchByUser('#search_user');
//            			localRefreshNg(obj);
//            		}else{
//            			//findAllNg();
//            			localRefreshNg(obj);
//            		}
//            	}
				
//				layer.msg( "更新成功！", {
//	                icon: 1
//	            },function(){
	            	
	
//	            });
//			}else{
//				warningInfo("失败:\\n"+data.error);
//			}
//		});
	} 
	
	/**
 	 * 局部刷新
 	 */
 	function RulesData(RulesDiv){
 		//$($(".LocationUserRulesDiv")[2]).find(".bbb").val()

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

		var areaIP = "192.168.85.130";
		var areaPort = "8083";
		var Url = "http://"+areaIP+":"+areaPort+"/nginxcfg?NodeIP="+NodeIP+"&ClientID="+ClientID;
		$.ajax({
			url : Url,
			dataType: "json",
			contentType: "text/html; charset=UTF-8",
    		type: "post",//update操作 
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
		//var area=$("#area").val();
		var appName = $(obj).val();
		var namespace= $(obj).parent().next().find("#search_user").val();
	 	
//		layer.msg('加载中', {
//			  icon: 16
//			  ,shade: 0.01
//			});
//	 	$.ajax({
//			url:,
//			type:"POST",
//			data:{"serviceName":serviceName,"flag":flag,"appName":appName,"namespace":namespace,"area":area},
//			success:function(data){
//				var data = eval("("+data+")");
//				//showNgsHtml(data);
//			}
//		})
	}
	