 $(document).ready(function () {
	 findAllNg();
	 //添加多个service
	 $(".fa-minus:last").hide();
	 $(document).on('click','.addSerBtn',function(){
		var serHtml = '<div class="nginx-label col-md-offset-1">'+
		'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" value="">;<i class="fa fa-plus addSerBtn"></i><i class="fa fa-minus delSerBtn"></i>'+
		'</div>';
		$("#nginx-sers").append(serHtml);
		$(".fa-plus:not(.fa-serverPlus):not(':last')").hide();
		$(".fa-minus:not(':last')").show();
		$(".fa-minus:last").hide();
	});
	//与填写的端口号保持一致
	var ListenPort = $("#ListenPort").val();
	$(".sameToListenPort").val(ListenPort);
	$("#ListenPort").blur(function(){
		ListenPort = $("#ListenPort").val();
		$(".sameToListenPort").val(ListenPort);
	});
	//proxy_pass的内容是appName+Namespace拼成的
	var appNameAndNamespace = $("#appNameAndNamespace").val();
	$("#proxy_pass").val('http://'+appNameAndNamespace);
	
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
    
    

	
 });/*reday*/
 
	/**
	 * 查询一个应用下的所有NG配置
	 * @param obj
	 */
//	"gfdg"++
	function findNgByOneApp(obj){
		var area=$("#area").val();
		var appName = $(obj).val();
		var namespace= $(obj).find("option:selected").attr("namespace");
	 	var serviceName= $(obj).find("option:selected").attr("namespace")+'-'+$(obj).val();
	 	var flag = $(obj).find("option:selected").attr("flag");
		var strs='';
		layer.msg('加载中', {
			  icon: 16
			  ,shade: 0.01
			});
	 	$.ajax({
			url:""+ctx+"/findNgByOneApp",
			type:"POST",
			data:{"serviceName":serviceName,"flag":flag,"appName":appName,"namespace":namespace,"area":area},
			success:function(data){
				var data = eval("("+data+")");
				var nginxCfgList = data.nginxCfgList;
				for(var i =0;i<data.nginxCfgList.length;i++){
					if(0==data.nginxCfgList[i].externFlag){
						 strs+='<div class="ibox float-e-margins" >'
			 					+'<div class="ibox-title" style="background-color:rgb(231,228,203)">'
			 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
			 					strs+='K8S服务'
			 			}else{
			 				strs+='<div class="ibox float-e-margins" >'
			 					+'<div class="ibox-title" style="background-color:rgb(242,243,232)">'
			 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
			 					strs+='外部服务'
		 			}
				 strs+='</h5>';
				 strs+='<div class="ibox-tools" appName="'+data.nginxCfgList[i].appName
	 					+'" namespace="'+data.nginxCfgList[i].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.flag+'">'
//	 					+'<a class="" onclick="nginxExport(this)" title="导出配置文件信息" exportType=0>'
//	 					+'<i class="fa fa-download"></i>'
//	 					+'</a>'
	 					+'<a class="addOneSerPart" onclick="addOneSerPart(this)" title="新增一个nginx配置" >'
	 					+'<i class="fa fa-plus fa-serverPlus" ></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxCfgCheck(this)" title="nginx -t 检测" >'
	 					+'<i class="fa fa-bug"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxFormCommOfNode(this)" title="批量提交" >'
	 					+'<i class="fa fa-save" ></i>'
	 					+'</a>'
	 					+'<a class="" onclick="deleteNginxOfNode(this)" index="index" title="批量删除" >'
	 					+'<i class="fa fa-trash" ></i>'
	 					+'</a>'
	 					+'<a class="collapse-link" onclick="" index="index"'
	 					+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
	 					+'<i class="fa fa-chevron-up"></i>'
	 					+'</a>'
	 					+'</div>'
	 					+'</div>'
	 					+'<div class="ibox-content" style="display:block">'
	 					+'<div class="ngConfigPartList">';
				 for(var n=0;n<nginxCfgList[i].nginxCfgs.length;n++){
	 				strs+='<div class="ngConfigPart">'
	 					+'<input type="checkbox" class="ngConfigCheckbox" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'"/> '
	 					//+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> 'listenPort serverName
	 					+'<span><a class="fa fa-openid" onClick="sendSerPart(this)" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.flag+'" title="下发配置"></a></span> '
	 					+'<span><a class="fa fa-trash" onClick="delOneSerPart(this)" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.flag+'" title="删除配置"></a></span> '
	 					+'<span><a class="fa fa-save" onClick="nginxFormCommOne(this)" title="提交配置"></a></span> '
	 					+'<span><a class="fa fa-caret-down" onClick="toggleOneSerPart(this)"></a></span> '
	 					+'<span class="ngConfigPartTit"></span>'
	 					+'<div class="ngConfigPartCon">'
	 					+'<form class="nginxForm" id="nginxForm" method="post" action="'+ctx+'/saveNginxForm">'
	 					+'<input name="flag" value="'+flag+'" type="hidden"/>'
	 					+'<input name="had" value=true type="hidden"/>'
	 					+'<input type="hidden" name="serviceAppName" value="'+data.nginxCfgList[i].namespace+'-'+data.nginxCfgList[i].appName+'"/>'
	 					+'<input type="hidden" name="appName" value="'+appName+'"/>'
	 					+'<input type="hidden" name="namespace" value="'+namespace+'"/>'
	 					+'<input type="hidden" name="nodeIp" value="'+data.nginxCfgList[i].nodeIp+'"/>'
	 					+'<input type="hidden" name="nodePort" value="'+data.nginxCfgList[i].nodePort+'"/>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">删除服务的同时删除个性化配置</span>';
	 					var duc='';
	 					if(nginxCfgList[i].nginxCfgs[n].deleteUserCfgs){
	 						duc+='<input type="checkbox" name="deleteUserCfgs" checked="checked">'
	 					}else{
	 						duc+='<input type="checkbox" name="deleteUserCfgs">'
	 					}
	 				strs+=duc;	
	 				strs+='</div>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" value="'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled>{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">';
					 var iphash='';	
	 					if(nginxCfgList[i].nginxCfgs[n].upstreamIPHash==false){
						    iphash+='<option value="false" selected="selected">none</option>'
						    	  +'<option value="true">ip_hash</option>';
						}else{
							iphash+='<option value="false">none</option>'
								  +'<option value="true" selected="selected">ip_hash</option>';
						}
	 				strs+=iphash;
	 				strs+='</select>;'
	 					+'</div>'
	 					+'<div id="nginx-sers">';
	 				var ips='';
	 					if(undefined==nginxCfgList[i].nginxCfgs[n].upstreamIPs){
	 						ips+='<div class="nginx-label col-md-offset-1">'
	 							+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="系统自动生成">;'
	 							+'</div>';
	 					}else{
	 						for(var m=0;m<nginxCfgList[i].nginxCfgs[n].upstreamIPs.length;m++){
	 		 					ips+='<div class="nginx-label col-md-offset-1">'
	 								+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="'+nginxCfgList[i].nginxCfgs[n].upstreamIPs[m] +':'+nginxCfgList[i].nginxCfgs[n].upstreamPort+'">;'
	 								+'</div>';
	 		 				}
	 					}
	 				strs+=ips;
	 				strs+='<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span>'
	 				+'</div>';
	 				var upstreamUserRuleStr=''
	 				if(false==$.isEmptyObject(nginxCfgList[i].nginxCfgs[n].upstreamUserRules)){
	 					var upstreamUserRules=nginxCfgList[i].nginxCfgs[n].upstreamUserRules.rulesSet;
		 				for(var key in upstreamUserRules){
		 					for(var value in upstreamUserRules[key]){
		 						upstreamUserRuleStr+='<div class="col-md-offset-1">'
		 	 	 					+'<span>|-<span>'
		 	 	 					+'<input type="text" id="upstreamUserRulesKey" name="upstreamUserRulesKey" value="'+key+'"><span>:</span>'
		 	 	 					+'<input type="text" id="upstreamUserRulesValue" name="upstreamUserRulesValue" value="'+upstreamUserRules[key][value]+'">;'
		 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
		 	 	 					+'</div>'
		 					}
		 				}
	 				}
	 				strs+=upstreamUserRuleStr;
	 				strs+='</div>'
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
	 					+'<span>listen:</span><input readonly type="text" id="ListenPort" name="ListenPort" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>server_name:</span><input readonly type="text" id="serverName"  name="serverName" value="'+nginxCfgList[i].nginxCfgs[n].serverName+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>location:</span><input type="text" id="Location" name="Location" value="'+nginxCfgList[i].nginxCfgs[n].location+'">{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled><input type="text" id="realServerPath" name="realServerPath" value="'+nginxCfgList[i].nginxCfgs[n].realServerPath+'"/>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectSrcPath+'">'
	 					+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectDestPath+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<select id="LogRuleName" name="LogRuleName">';
	 					var rname ='';
	 					if(nginxCfgList[i].nginxCfgs[n].logRule.logRuleName=="access_log"){
	 						rname+='<option value="access_log" selected>access_log</option>'
	 						+'<option value="error_log" >error_log</option>';
	 					}else{
	 						rname+='<option value="access_log">access_log</option>'
		 						+'<option value="error_log" selected>error_log</option>';
	 					}
	 					rname+='</select>';
	 					strs+=rname;
	 					strs+='<input type="text" id="LogFileDirPath" name="LogFileDirPath" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logFileDirPath+'">'
	 					+'<input type="text" id="" name="" value="/'+nginxCfgList[i].nginxCfgs[n].appName+'_'+nginxCfgList[i].nginxCfgs[n].logRule.logRuleName+'" disabled>'
	 					+'<input type="text" id="LogTemplateName" name="LogTemplateName" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logTemplateName+'">;'
	 					+'</div>'
	 					+'<div class="col-md-offset-2">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
	 					+'</div>';
	 	 	 	 		var locationUserRuleStr=''
	 	 	 	 		if(false==$.isEmptyObject(nginxCfgList[i].nginxCfgs[n].locationUserRules)){
	 	 	 	 		var locationUserRules=nginxCfgList[i].nginxCfgs[n].locationUserRules.rulesSet;
 	 	 				for(var key in locationUserRules){
 	 	 					for(var value in locationUserRules[key]){
 	 	 						locationUserRuleStr+='<div class="col-md-offset-2">'
 	 	 	 	 					+'<span>|-<span>'
 	 	 	 	 					+'<input type="text" id="locationUserRulesKey" name="locationUserRulesKey" value="'+key+'"><span>:</span>'
 	 	 	 	 					+'<input type="text" id="locationUserRulesValue" name="locationUserRulesValue" value="'+locationUserRules[key][value]+'">;'
 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
 	 	 	 	 					+'</div>'
 	 	 					}
 	 	 				}
	 	 	 	 		}
	 	 	 				
	 	 				strs+=locationUserRuleStr;
	 	 	 			strs+='<div class="nginx-label col-md-offset-1">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
	 					+'</div>';
	 					var serverUserRuleStr=''
 						if(false==$.isEmptyObject(nginxCfgList[i].nginxCfgs[n].serverUserRules)){
 							var serverUserRules=nginxCfgList[i].nginxCfgs[n].serverUserRules.rulesSet;
	 	 	 				for(var key in serverUserRules){
	 	 	 					for(var value in serverUserRules[key]){
	 	 	 					serverUserRuleStr+='<div class="col-md-offset-1">'
	 	 	 	 	 					+'<span>|-<span>'
	 	 	 	 	 					+'<input type="text" id="serverUserRulesKey" name="serverUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 	 					+'<input type="text" id="serverUserRulesValue" name="serverUserRulesValue" value="'+serverUserRules[key][value]+'">;'
	 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
	 	 	 	 	 					+'</div>'
	 	 	 					}
	 	 	 				}
 						}
	 	 	 			strs+=serverUserRuleStr;
	 					strs+='<div class="nginx-label">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</form> '
	 				+'</div>'
	 				+'</div>';
				 }
	 				strs+='</div>'
	 				+'</div><!-- ibox-content -->'
	 			+'</div><!-- ibox -->';
				}
				$('.col-sm-12').empty().append(strs);
			}
		});
//	 	layer.close(index);
	}
 
 /**
  * 选择用户名，以此查询服务
  * @param obj
  */
 function searchByUser(obj){
 	var user= $(obj).val();	
 	var area=$("#area").val();
 	if(user.length==0){
 		var ic ='';
	 	ic+='<span class="ic_left">'+'代理配置'+'</span>';
	 	$(".ic_left").parent().empty().append(ic);	
	 	findAllNg();
 	}else{
 	$.ajax({
 			url:""+ctx+"/findServices",
 			type:"POST",
 			data:{"user":user},
 			success:function(data){
 					var data = eval("("+data+")");
 	       var serList='';
 	       serList+= '<option value="">-----请选择-----</option>';
 	       for(var i=0; i<data.serviceList.length; i++){
 	        serList+=' <option value="'+data.serviceList[i].serviceName+'" flag="'+data.serviceList[i].flag+'" namespace="'+data.serviceList[i].namespace+'">'
 	        +data.serviceList[i].serviceName +'</option>';
 	       }
 	      $('#search_service').empty().append(serList);
 	      
 			}
 	 });
/// 	gfd+"gf"+++
 	$.ajax({
		url:""+ctx+"/findNgByNamespace",
			type:"POST",
			data:{"namespace":user,"area":area},
			success:function(data){
				var strs='';
				var data = eval("("+data+")");
				var nginxCfgList = data.nginxCfgList;
				for(var i =0;i<data.nginxCfgList.length;i++){
				if(0==data.nginxCfgList[i].externFlag){
				 strs+='<div class="ibox float-e-margins" >'
	 					+'<div class="ibox-title" style="background-color:rgb(231,228,203)">'
	 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
	 					strs+='K8S服务'
	 			}else{
	 				strs+='<div class="ibox float-e-margins" >'
	 					+'<div class="ibox-title" style="background-color:rgb(242,243,232)">'
	 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
	 					strs+='外部服务'
	 			}
				 strs+='</h5>'
	 					+'<div class="ibox-tools" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'">'
//	 					+'<a class="" onclick="nginxExport(this)" title="导出配置文件信息" exportType=1>'
//	 					+'<i class="fa fa-download"></i>'
//	 					+'</a>'
	 					+'<a class="" onclick="nginxCfgCheck(this)" title="nginx -t 检测">'
	 					+'<i class="fa fa-bug"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxFormCommOfNode(this)" title="批量提交">'
	 					+'<i class="fa fa-save" ></i>'
	 					+'</a>'
	 					+'<a class="" onclick="deleteNginxOfNode(this)" index="index" title="批量删除"' 
	 					+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
	 					+'<i class="fa fa-trash" ></i>'
	 					+'</a>'
	 					+'<a class="collapse-link" onclick="" index="index"'
	 					+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
	 					+'<i class="fa fa-chevron-up"></i>'
	 					+'</a>'
	 					+'</div>'
	 					+'</div>'
	 					+'<div class="ibox-content" style="display:block">'
	 					+'<div class="ngConfigPartList">';
				 for(var n=0;n<nginxCfgList[i].nginxCfgs.length;n++){
					iphash='';
	 				strs+='<div class="ngConfigPart">'
	 					+'<input type="checkbox" class="ngConfigCheckbox" /> '
	 					//+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> '
	 					+'<span><a class="fa fa-openid" onClick="sendSerPart(this)" title="下发配置" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.nginxCfgList[i].externFlag+'"></a></span> '
	 					+'<span><a class="fa fa-trash" onClick="delOneSerPart(this)" title="删除配置" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.nginxCfgList[i].externFlag+'"></a></span> '
 	 					+'<span><a class="fa fa-save" onClick="nginxFormCommOne(this)" title="提交配置" ></a></span> '
	 					+'<span><a class="fa fa-caret-down" onClick="toggleOneSerPart(this)"></a></span> '
	 					+'<span class="ngConfigPartTit"></span>'
	 					+'<div class="ngConfigPartCon">'
	 					+'<form class="nginxForm" id="nginxForm" method="post" action="'+ctx+'/saveNginxForm">'
	 					+'<input name="flag" value="'+data.nginxCfgList[i].externFlag+'" type="hidden"/>'
	 					+'<input name="had" value=true type="hidden"/>'
	 					+'<input type="hidden" name="serviceAppName" value="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'-'+data.nginxCfgList[i].nginxCfgs[n].appName+'"/>'
	 					+'<input type="hidden" name="appName" value="'+data.nginxCfgList[i].nginxCfgs[n].appName+'"/>'
	 					+'<input type="hidden" name="namespace" value="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'"/>'
	 					+'<input type="hidden" name="nodeIp" value="'+data.nginxCfgList[i].nodeIp+'"/>'
	 					+'<input type="hidden" name="nodePort" value="'+data.nginxCfgList[i].nodePort+'"/>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">删除服务的同时删除个性化配置</span>';
	 					var duc='';
	 					if(nginxCfgList[i].nginxCfgs[n].deleteUserCfgs){
	 						duc+='<input type="checkbox" name="deleteUserCfgs" checked="checked">'
	 					}else{
	 						duc+='<input type="checkbox" name="deleteUserCfgs">'
	 					}
	 				strs+=duc;	
	 				strs+='</div>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" value="'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled>{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">';
	 					if(nginxCfgList[i].nginxCfgs[n].upstreamIPHash==false){
					    iphash+='<option value="false" selected="selected">none</option>'
					    	  +'<option value="true">ip_hash</option>';
					}else{
						iphash+='<option value="false">none</option>'
							  +'<option value="true" selected="selected">ip_hash</option>';
					}
	 				strs+=iphash;
	 				strs+='</select>;'
	 					+'</div>'
	 					+'<div id="nginx-sers">';
	 				var ips='';
	 					if(undefined==nginxCfgList[i].nginxCfgs[n].upstreamIPs){
	 						ips+='<div class="nginx-label col-md-offset-1">'
	 							+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="系统自动生成">;'
	 							+'</div>';
	 					}else{
	 						for(var m=0;m<nginxCfgList[i].nginxCfgs[n].upstreamIPs.length;m++){
	 		 					ips+='<div class="nginx-label col-md-offset-1">'
	 								+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="'+nginxCfgList[i].nginxCfgs[n].upstreamIPs[m] +':'+nginxCfgList[i].nginxCfgs[n].upstreamPort+'">;'
	 								+'</div>';
	 		 				}
	 					}
	 				strs+=ips;
	 				strs+='<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span>'
	 	 				+'</div>';
	 	 				var upstreamUserRuleStr=''
	 	 				var upstreamUserRules=nginxCfgList[i].nginxCfgs[n].upstreamUserRules.rulesSet;
	 	 				for(var key in upstreamUserRules){
	 	 					for(var value in upstreamUserRules[key]){
	 	 						upstreamUserRuleStr+='<div class="col-md-offset-1">'
	 	 	 	 					+'<span>|-<span>'
	 	 	 	 					+'<input type="text" id="upstreamUserRulesKey" name="upstreamUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 					+'<input type="text" id="upstreamUserRulesValue" name="upstreamUserRulesValue" value="'+upstreamUserRules[key][value]+'">;'
	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
	 	 	 	 					+'</div>'
	 	 					}
	 	 				}
	 	 				strs+=upstreamUserRuleStr;
	 				strs+='</div>'
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
	 					+'<span>listen:</span><input readonly type="text" id="ListenPort" name="ListenPort" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>server_name:</span><input readonly type="text" id="serverName"  name="serverName" value="'+nginxCfgList[i].nginxCfgs[n].serverName+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>location:</span><input type="text" id="Location" name="Location" value="'+nginxCfgList[i].nginxCfgs[n].location+'">{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled><input type="text" id="realServerPath" name="realServerPath" value="'+nginxCfgList[i].nginxCfgs[n].realServerPath+'"/>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectSrcPath+'">'
	 					+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectDestPath+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<select id="LogRuleName" name="LogRuleName">';
	 					var rname ='';
	 					if(nginxCfgList[i].nginxCfgs[n].logRule.logRuleName=="access_log"){
	 						rname+='<option value="access_log" selected>access_log</option>'
	 						+'<option value="error_log" >error_log</option>';
	 					}else{
	 						rname+='<option value="access_log">access_log</option>'
		 						+'<option value="error_log" selected>error_log</option>';
	 					}
	 					rname+='</select>';
	 					strs+=rname;
	 					strs+='<input type="text" id="LogFileDirPath" name="LogFileDirPath" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logFileDirPath+'">'
	 					+'<input type="text" id="" name="" value="/'+nginxCfgList[i].nginxCfgs[n].appName+'_'+nginxCfgList[i].nginxCfgs[n].logRule.logRuleName+'" disabled>'
	 					+'<input type="text" id="LogTemplateName" name="LogTemplateName" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logTemplateName+'">;'
	 					+'</div>'
	 					+'<div class="col-md-offset-2">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
 	 					+'</div>';
	 	 	 	 		var locationUserRuleStr=''
	 	 	 				var locationUserRules=nginxCfgList[i].nginxCfgs[n].locationUserRules.rulesSet;
	 	 	 				for(var key in locationUserRules){
	 	 	 					for(var value in locationUserRules[key]){
	 	 	 						locationUserRuleStr+='<div class="col-md-offset-2">'
	 	 	 	 	 					+'<span>|-<span>'
	 	 	 	 	 					+'<input type="text" id="locationUserRulesKey" name="locationUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 	 					+'<input type="text" id="locationUserRulesValue" name="locationUserRulesValue" value="'+locationUserRules[key][value]+'">;'
	 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
	 	 	 	 	 					+'</div>'
	 	 	 					}
	 	 	 			}
 	 	 				strs+=locationUserRuleStr;
	 					strs+='<div class="nginx-label col-md-offset-1">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
 	 					+'</div>';
 	 					var serverUserRuleStr=''
 	 	 	 				var serverUserRules=nginxCfgList[i].nginxCfgs[n].serverUserRules.rulesSet;
 	 	 	 				for(var key in serverUserRules){
 	 	 	 					for(var value in serverUserRules[key]){
 	 	 	 					serverUserRuleStr+='<div class="col-md-offset-1">'
 	 	 	 	 	 					+'<span>|-<span>'
 	 	 	 	 	 					+'<input type="text" id="serverUserRulesKey" name="serverUserRulesKey" value="'+key+'"><span>:</span>'
 	 	 	 	 	 					+'<input type="text" id="serverUserRulesValue" name="serverUserRulesValue" value="'+serverUserRules[key][value]+'">;'
 	 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
 	 	 	 	 	 					+'</div>'
 	 	 	 					}
 	 	 	 				}
 	 	 	 			strs+=serverUserRuleStr;
	 					strs+='<div class="nginx-label">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</form> '
	 				+'</div>'
	 				+'</div>';
				 }
	 				strs+='</div>'
	 				+'</div><!-- ibox-content -->'
	 			+'</div><!-- ibox -->';
				}
				$('.col-sm-12').empty().append(strs);
			}
	});
 	}
  }

	/**
	 * 查询所有app的ng配置
	 */
	function findAllNg(){
		var area =$("#area").val();
		$.ajax({
			url:""+ctx+"/findAllNg",
			type:"POST",
			data:{"area":area},
			success:function(data){
				var strs='';
				var data = eval("("+data+")");
				var nginxCfgList = data.nginxCfgList;
				for(var i =0;i<data.nginxCfgList.length;i++){
					if(0==data.nginxCfgList[i].externFlag){
						 strs+='<div class="ibox float-e-margins" >'
			 					+'<div class="ibox-title" style="background-color:rgb(231,228,203)">'
			 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
			 					strs+='K8S服务'
			 			}else{
			 				strs+='<div class="ibox float-e-margins" >'
			 					+'<div class="ibox-title" style="background-color:rgb(242,243,232)">'
			 					+'<h5> NODE '+data.nginxCfgList[i].nodeIp+data.nginxCfgList[i].nodePort+'-'
			 					strs+='外部服务'
			 			}
				strs+='</h5>'
	 					+'<div class="ibox-tools" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" downloadcfgpath="'+data.nginxCfgList[i].downloadCfgAPIServerPath+'" >'
	 					+'<a class="" onclick="nginxCompare(this)" title="nginx 对比">'
	 					+'<i class="fa fa-arrows"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxExport(this)" title="导出配置文件信息" exportType=2>'
	 					+'<i class="fa fa-download"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxPowerOn(this)" title="启动nginx服务">'
	 					+'<i class="fa fa-play"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxPowerOff(this)" title="停止nginx服务">'
	 					+'<i class="fa fa-power-off"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxCfgCheck(this)" title="nginx -t检测">'
	 					+'<i class="fa fa-bug"></i>'
	 					+'</a>'
	 					+'<a class="" onclick="nginxFormCommOfNode(this)" title="批量提交">'
	 					+'<i class="fa fa-save" ></i>'
	 					+'</a>'
	 					+'<a class="" onclick="deleteNginxOfNode(this)" index="index" title="批量删除" '
	 					+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
	 					+'<i class="fa fa-trash" ></i>'
	 					+'</a>'
	 					+'<a class="collapse-link" onclick="" index="index"'
	 					+'appName="${ngCfgs.appName}" namespace="${ngCfgs.namespace}" serverName="${ngCfgs.serverName }:${ngCfgs.listenPort }"  flag=0 >'
	 					+'<i class="fa fa-chevron-up"></i>'
	 					+'</a>'
	 					+'</div>'
	 					+'</div>'
	 					+'<div class="ibox-content" style="display:block">'
	 					+'<div class="ngConfigPartList">';
				 for(var n=0;n<nginxCfgList[i].nginxCfgs.length;n++){
					iphash='';
	 				strs+='<div class="ngConfigPart">'
	 					+'<input type="checkbox" class="ngConfigCheckbox" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" /> '
	 					//+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> '
	 					+'<span><a class="fa fa-openid" onClick="sendSerPart(this)" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.nginxCfgList[i].externFlag+'"></a></span> '
	 					+'<span><a class="fa fa-trash" onClick="delOneSerPart(this)" '+'listenPort="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" serverName="'+nginxCfgList[i].nginxCfgs[n].serverName+'" appName="'+nginxCfgList[i].nginxCfgs[n].appName+'" namespace="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'" nodeIp="'+data.nginxCfgList[i].nodeIp+'" nodePort="'+data.nginxCfgList[i].nodePort+'" flag="'+data.nginxCfgList[i].externFlag+'"></a></span> '
	 					+'<span><a class="fa fa-save" onClick="nginxFormCommOne(this)"></a></span> '
	 					+'<span><a class="fa fa-caret-down" onClick="toggleOneSerPart(this)"></a></span> '
	 					+'<span class="ngConfigPartTit"></span>'
	 					+'<div class="ngConfigPartCon">'
	 					+'<form class="nginxForm" id="nginxForm" method="post" action="'+ctx+'/saveNginxForm">'
	 					+'<input type="hidden" name="flag" value="'+data.nginxCfgList[i].externFlag+'"/>'
	 					+'<input name="had" value=true type="hidden"/>'
	 					+'<input type="hidden" name="serviceAppName" value="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'-'+data.nginxCfgList[i].nginxCfgs[n].appName+'"/>'
	 					+'<input type="hidden" name="appName" value="'+data.nginxCfgList[i].nginxCfgs[n].appName+'"/>'
	 					+'<input type="hidden" name="namespace" value="'+data.nginxCfgList[i].nginxCfgs[n].namespace+'"/>'
	 					+'<input type="hidden" name="nodeIp" value="'+data.nginxCfgList[i].nodeIp+'"/>'
	 					+'<input type="hidden" name="nodePort" value="'+data.nginxCfgList[i].nodePort+'"/>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">删除服务的同时删除个性化配置</span>';
	 					var duc='';
	 					if(nginxCfgList[i].nginxCfgs[n].deleteUserCfgs){
	 						duc+='<input type="checkbox" name="deleteUserCfgs" checked="checked">'
	 					}else{
	 						duc+='<input type="checkbox" name="deleteUserCfgs">'
	 					}
	 				strs+=duc;	
	 				strs+='</div>'
	 					+'<div class="nginx-label">'
	 					+'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" value="'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled>{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">';
	 					if(nginxCfgList[i].nginxCfgs[n].upstreamIPHash==false){
						    iphash+='<option value="false" selected="selected">none</option>'
						    	  +'<option value="true">ip_hash</option>';
						}else{
							iphash+='<option value="false">none</option>'
								  +'<option value="true" selected="selected">ip_hash</option>';
						}
	 				strs+=iphash;
	 				strs+='</select>;'
	 					+'</div>'
	 					+'<div id="nginx-sers">';
	 				var ips='';
	 					if(undefined==nginxCfgList[i].nginxCfgs[n].upstreamIPs){
	 						ips+='<div class="nginx-label col-md-offset-1">'
	 							+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="系统自动生成">;'
	 							+'</div>';
	 					}else{
	 						for(var m=0;m<nginxCfgList[i].nginxCfgs[n].upstreamIPs.length;m++){
	 		 					ips+='<div class="nginx-label col-md-offset-1">'
	 								+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="'+nginxCfgList[i].nginxCfgs[n].upstreamIPs[m] +':'+nginxCfgList[i].nginxCfgs[n].upstreamPort+'">;'
	 								+'</div>';
	 		 				}
	 					}
	 				strs+=ips;
	 				strs+='<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span></div>';
	 	 				var upstreamUserRuleStr=''
	 	 				var upstreamUserRules=nginxCfgList[i].nginxCfgs[n].upstreamUserRules.rulesSet;
	 	 				for(var key in upstreamUserRules){
	 	 					for(var value in upstreamUserRules[key]){
	 	 						upstreamUserRuleStr+='<div class="col-md-offset-1">'
	 	 	 	 					+'<span>|-<span>'
	 	 	 	 					+'<input type="text" id="upstreamUserRulesKey" name="upstreamUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 					+'<input type="text" id="upstreamUserRulesValue" name="upstreamUserRulesValue" value="'+upstreamUserRules[key][value]+'">;'
	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
	 	 	 	 					+'</div>'
	 	 					}
	 	 				}
	 	 				strs+=upstreamUserRuleStr;
	 				strs+='</div>'
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
	 					+'<span>listen:</span><input readonly type="text" id="ListenPort" name="ListenPort" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>server_name:</span><input readonly type="text" id="serverName"  name="serverName" value="'+nginxCfgList[i].nginxCfgs[n].serverName+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-1">'
	 					+'<span>location:</span><input type="text" id="Location" name="Location" value="'+nginxCfgList[i].nginxCfgs[n].location+'">{'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+nginxCfgList[i].nginxCfgs[n].appName+'-'+nginxCfgList[i].nginxCfgs[n].namespace+'" disabled><input type="text" id="realServerPath" name="realServerPath" value="'+nginxCfgList[i].nginxCfgs[n].realServerPath+'"/>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+nginxCfgList[i].nginxCfgs[n].listenPort+'" disabled>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectSrcPath+'">'
	 					+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+nginxCfgList[i].nginxCfgs[n].proxyRedirectDestPath+'">;'
	 					+'</div>'
	 					+'<div class="nginx-label col-md-offset-2">'
	 					+'<select id="LogRuleName" name="LogRuleName">';
	 					var rname ='';
	 					if(nginxCfgList[i].nginxCfgs[n].logRule.logRuleName=="access_log"){
	 						rname+='<option value="access_log" selected>access_log</option>'
	 						+'<option value="error_log" >error_log</option>';
	 					}else{
	 						rname+='<option value="access_log">access_log</option>'
		 						+'<option value="error_log" selected>error_log</option>';
	 					}
	 					rname+='</select>';
	 					strs+=rname;
	 					strs+='<input type="text" id="LogFileDirPath" name="LogFileDirPath" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logFileDirPath+'">'
	 					+'<input type="text" id="" name="" value="/'+nginxCfgList[i].nginxCfgs[n].appName+'_'+nginxCfgList[i].nginxCfgs[n].logRule.logRuleName+'" disabled>'
	 					+'<input type="text" id="LogTemplateName" name="LogTemplateName" value="'+nginxCfgList[i].nginxCfgs[n].logRule.logTemplateName+'">;'
	 					+'</div>'
	 					+'<div class="col-md-offset-2">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
	 					+'</div>';
	 	 	 	 		var locationUserRuleStr=''
	 	 	 				var locationUserRules=nginxCfgList[i].nginxCfgs[n].locationUserRules.rulesSet;
	 	 	 				for(var key in locationUserRules){
	 	 	 					for(var value in locationUserRules[key]){
	 	 	 						locationUserRuleStr+='<div class="col-md-offset-2">'
	 	 	 	 	 					+'<span>|-<span>'
	 	 	 	 	 					+'<input type="text" id="locationUserRulesKey" name="locationUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 	 					+'<input type="text" id="locationUserRulesValue" name="locationUserRulesValue" value="'+locationUserRules[key][value]+'">;'
	 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
	 	 	 	 	 					+'</div>'
	 	 	 					}
	 	 	 			}
	 	 				strs+=locationUserRuleStr;
	 					strs+='<div class="nginx-label col-md-offset-1">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
	 					+'</div>';
	 					var serverUserRuleStr=''
	 	 	 				var serverUserRules=nginxCfgList[i].nginxCfgs[n].serverUserRules.rulesSet;
	 	 	 				for(var key in serverUserRules){
	 	 	 					for(var value in serverUserRules[key]){
	 	 	 					serverUserRuleStr+='<div class="col-md-offset-1">'
	 	 	 	 	 					+'<span>|-<span>'
	 	 	 	 	 					+'<input type="text" id="serverUserRulesKey" name="serverUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 	 	 					+'<input type="text" id="serverUserRulesValue" name="serverUserRulesValue" value="'+serverUserRules[key][value]+'">;'
	 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
	 	 	 	 	 					+'</div>'
	 	 	 					}
	 	 	 				}
	 	 	 			strs+=serverUserRuleStr;
	 					strs+='<div class="nginx-label">'
	 					+'<span>}</span>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</div>'
	 					+'</form> '
	 				+'</div>'
	 				+'</div>';
				 }
	 				strs+='</div>'
	 				+'</div><!-- ibox-content -->'
	 			+'</div><!-- ibox -->';
				}
				//
				var serList='';
	 	       serList+= '<option value="">-----请选择-----</option>';
	 	       for(var i=0; i<data.serviceList.length; i++){
	 	        serList+=' <option value="'+data.serviceList[i].serviceName+'" flag="'+data.serviceList[i].flag+'" namespace="'+data.serviceList[i].namespace+'">'
	 	        +data.serviceList[i].serviceName +'</option>';
	 	       }
	 	      $('#search_service').empty().append(serList);
				$('.col-sm-12').empty().append(strs);
			}
		});
	}
 	/**
 	 * 点击刷新
 	 */
 	function refreshNg(obj){
			if($('#search_service').val().length>0){
	    		findNgByOneApp($('#search_service'));	
	    	}else{
	    		if($('#search_user').val().length>0){
	    			searchByUser('#search_user');
	    		}else{
	    			findAllNg();
	    		}
	    	}
 	}
 	
 	/**
 	 * 局部刷新
 	 */
 	function localRefreshNg(obj){
 		var ngConfigPart = $(obj).parent().parent();
 		var nodeIp = ngConfigPart.find(".nginxForm input[name='nodeIp']").val();
 		var nodePort = ngConfigPart.find(".nginxForm input[name='nodePort']").val();
 		var appName = ngConfigPart.find(".nginxForm input[name='appName']").val();
 		var namespace = ngConfigPart.find(".nginxForm input[name='namespace']").val();
 		var flag = ngConfigPart.find(".nginxForm input[name='flag']").val();
 		var ListenPort = ngConfigPart.find(".nginxForm input[name='ListenPort']").val();
 		var serverName = ngConfigPart.find(".nginxForm input[name='serverName']").val();
 		var confseq = serverName+':'+ListenPort;
 		var endpoint = "http://"+nodeIp+nodePort+"/";
 		var serviceName = ngConfigPart.find(".nginxForm input[name='serviceAppName']").val();
	 	$.ajax({
			url:""+ctx+"/findNgAfterOperation",
			type:"POST",
			data:{"endpoint":endpoint,"flag":flag,"serviceName":serviceName,"confseq":confseq},
			success:function(data){
				var data = eval("("+data+")");
				if(data.error=="501"){
					layer.msg( "在json转化成类的时候出错！", {
		                icon: 1
		            });
					return;
				}
				if(data.error=="404"){
					layer.msg( "没有找到ng配置，或已经被删除", {
		                icon: 1
		            });
					return;
				}
				var strs="";
 				strs+='<input type="checkbox" class="ngConfigCheckbox" nodeIp="'+nodeIp+'" nodePort="'+nodePort+'"/> '
 					//+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> 'listenPort serverName
 					+'<span><a class="fa fa-openid" onClick="sendSerPart(this)" '+'listenPort="'+data.nginxCfgs.listenPort+'" serverName="'+data.nginxCfgs.serverName+'" appName="'+data.nginxCfgs.appName+'" namespace="'+data.nginxCfgs.namespace+'" nodeIp="'+nodeIp+'" nodePort="'+nodePort+'" flag="'+flag+'" title="下发配置"></a></span> '
 					+'<span><a class="fa fa-trash" onClick="delOneSerPart(this)" '+'listenPort="'+data.nginxCfgs.listenPort+'" serverName="'+data.nginxCfgs.serverName+'" appName="'+data.nginxCfgs.appName+'" namespace="'+data.nginxCfgs.namespace+'" nodeIp="'+nodeIp+'" nodePort="'+nodePort+'" flag="'+flag+'" title="删除配置"></a></span> '
 					+'<span><a class="fa fa-save" onClick="nginxFormCommOne(this)" title="提交配置"></a></span> '
 					+'<span><a class="fa fa-caret-down" onClick="toggleOneSerPart(this)"></a></span> '
 					+'<span class="ngConfigPartTit"></span>'
 					+'<div class="ngConfigPartCon">'
 					+'<form class="nginxForm" id="nginxForm" method="post" action="'+ctx+'/saveNginxForm">'
 					+'<input name="flag" value="'+flag+'" type="hidden"/>'
 					+'<input name="had" value=true type="hidden"/>'
 					+'<input type="hidden" name="serviceAppName" value="'+namespace+'-'+appName+'"/>'
 					+'<input type="hidden" name="appName" value="'+appName+'"/>'
 					+'<input type="hidden" name="namespace" value="'+namespace+'"/>'
 					+'<input type="hidden" name="nodeIp" value="'+nodeIp+'"/>'
 					+'<input type="hidden" name="nodePort" value="'+nodePort+'"/>'
 					+'<div class="nginx-label">'
 					+'<span class="upstreamPartTit">删除服务的同时删除个性化配置</span>';
 					var duc='';
 					if(data.nginxCfgs.deleteUserCfgs){
 						duc+='<input type="checkbox" name="deleteUserCfgs" checked="checked">'
 					}else{
 						duc+='<input type="checkbox" name="deleteUserCfgs">'
 					}
 				strs+=duc;	
 				strs+='</div>'
 					+'<div class="nginx-label">'
 					+'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" value="'+data.nginxCfgs.appName+'-'+data.nginxCfgs.namespace+'" disabled>{'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-1">'
 					+'<select id="IsUpstreamIPHash" name="UpstreamIPHash">';
				 var iphash='';	
 					if(data.nginxCfgs.upstreamIPHash==false){
					    iphash+='<option value="false" selected="selected">none</option>'
					    	  +'<option value="true">ip_hash</option>';
					}else{
						iphash+='<option value="false">none</option>'
							  +'<option value="true" selected="selected">ip_hash</option>';
					}
 				strs+=iphash;
 				strs+='</select>;'
 					+'</div>'
 					+'<div id="nginx-sers">';
 				var ips='';
 					if(undefined==data.nginxCfgs.upstreamIPs){
 						ips+='<div class="nginx-label col-md-offset-1">'
 							+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="系统自动生成">;'
 							+'</div>';
 					}else{
 						for(var m=0;m<data.nginxCfgs.upstreamIPs.length;m++){
 		 					ips+='<div class="nginx-label col-md-offset-1">'
 								+	'<span>server:</span><input type="text" class="ipAndUpstreamPort" name="ipAndUpstreamPort" disabled value="'+data.nginxCfgs.upstreamIPs[m] +':'+data.nginxCfgs.upstreamPort+'">;'
 								+'</div>';
 		 				}
 					}
 				strs+=ips;
 				strs+='<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span>'
 				+'</div>';
 				var upstreamUserRuleStr=''
 				if(false==$.isEmptyObject(data.nginxCfgs.upstreamUserRules)){
 					var upstreamUserRules=data.nginxCfgs.upstreamUserRules.rulesSet;
	 				for(var key in upstreamUserRules){
	 					for(var value in upstreamUserRules[key]){
	 						upstreamUserRuleStr+='<div class="col-md-offset-1">'
	 	 	 					+'<span>|-<span>'
	 	 	 					+'<input type="text" id="upstreamUserRulesKey" name="upstreamUserRulesKey" value="'+key+'"><span>:</span>'
	 	 	 					+'<input type="text" id="upstreamUserRulesValue" name="upstreamUserRulesValue" value="'+upstreamUserRules[key][value]+'">;'
	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
	 	 	 					+'</div>'
	 					}
	 				}
 				}
 				strs+=upstreamUserRuleStr;
 				strs+='</div>'
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
 					+'<span>listen:</span><input readonly type="text" id="ListenPort" name="ListenPort" value="'+data.nginxCfgs.listenPort+'">;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-1">'
 					+'<span>server_name:</span><input readonly type="text" id="serverName"  name="serverName" value="'+data.nginxCfgs.serverName+'">;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-1">'
 					+'<span>location:</span><input type="text" id="Location" name="Location" value="'+data.nginxCfgs.location+'">{'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<span>proxy_pass:</span><input type="text" id="proxy_pass" name="" value="http://'+data.nginxCfgs.appName+'-'+data.nginxCfgs.namespace+'" disabled><input type="text" id="realServerPath" name="realServerPath" value="'+data.nginxCfgs.realServerPath+'"/>;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<span>proxy_set_header Host $host:</span><input type="text" class="sameToListenPort" name="" value="'+data.nginxCfgs.listenPort+'" disabled>;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<span>proxy_set_header X-Real-IP $remote_addr:</span><input type="text" class="sameToListenPort" id="" name="" value="'+data.nginxCfgs.listenPort+'" disabled>;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<span>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for</span>;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<span>proxy_redirect:</span><input type="text" id="ProxyRedirectSrcPath" name="ProxyRedirectSrcPath" value="'+data.nginxCfgs.proxyRedirectSrcPath+'">'
 					+'<input type="text" id="ProxyRedirectDestPath" name="ProxyRedirectDestPath" value="'+data.nginxCfgs.proxyRedirectDestPath+'">;'
 					+'</div>'
 					+'<div class="nginx-label col-md-offset-2">'
 					+'<select id="LogRuleName" name="LogRuleName">';
 					var rname ='';
 					if(data.nginxCfgs.logRule.logRuleName=="access_log"){
 						rname+='<option value="access_log" selected>access_log</option>'
 						+'<option value="error_log" >error_log</option>';
 					}else{
 						rname+='<option value="access_log">access_log</option>'
	 						+'<option value="error_log" selected>error_log</option>';
 					}
 					rname+='</select>';
 					strs+=rname;
 					strs+='<input type="text" id="LogFileDirPath" name="LogFileDirPath" value="'+data.nginxCfgs.logRule.logFileDirPath+'">'
 					+'<input type="text" id="" name="" value="/'+data.nginxCfgs.appName+'_'+data.nginxCfgs.logRule.logRuleName+'" disabled>'
 					+'<input type="text" id="LogTemplateName" name="LogTemplateName" value="'+data.nginxCfgs.logRule.logTemplateName+'">;'
 					+'</div>'
 					+'<div class="col-md-offset-2">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
 					+'</div>';
 	 	 	 		var locationUserRuleStr=''
 	 	 	 		if(false==$.isEmptyObject(data.nginxCfgs.locationUserRules)){
 	 	 	 		var locationUserRules=data.nginxCfgs.locationUserRules.rulesSet;
 	 				for(var key in locationUserRules){
 	 					for(var value in locationUserRules[key]){
 	 						locationUserRuleStr+='<div class="col-md-offset-2">'
 	 	 	 					+'<span>|-<span>'
 	 	 	 					+'<input type="text" id="locationUserRulesKey" name="locationUserRulesKey" value="'+key+'"><span>:</span>'
 	 	 	 					+'<input type="text" id="locationUserRulesValue" name="locationUserRulesValue" value="'+locationUserRules[key][value]+'">;'
 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
 	 	 	 					+'</div>'
 	 					}
 	 				}
 	 	 	 		}
 	 	 				
 	 				strs+=locationUserRuleStr;
 	 	 			strs+='<div class="nginx-label col-md-offset-1">'
 					+'<span>}</span>'
 					+'</div>'
 					+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
 					+'</div>';
 					var serverUserRuleStr=''
					if(false==$.isEmptyObject(data.nginxCfgs.serverUserRules)){
						var serverUserRules=data.nginxCfgs.serverUserRules.rulesSet;
 	 	 				for(var key in serverUserRules){
 	 	 					for(var value in serverUserRules[key]){
 	 	 					serverUserRuleStr+='<div class="col-md-offset-1">'
 	 	 	 	 					+'<span>|-<span>'
 	 	 	 	 					+'<input type="text" id="serverUserRulesKey" name="serverUserRulesKey" value="'+key+'"><span>:</span>'
 	 	 	 	 					+'<input type="text" id="serverUserRulesValue" name="serverUserRulesValue" value="'+serverUserRules[key][value]+'">;'
 	 	 	 	 					+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
 	 	 	 	 					+'</div>'
 	 	 					}
 	 	 				}
					}
 	 	 			strs+=serverUserRuleStr;
 					strs+='<div class="nginx-label">'
 					+'<span>}</span>'
 					+'</div>'
 					+'</div>'
 					+'</div>'
 					+'</div>'
 					+'</form> '
 				+'</div>';
		 		ngConfigPart.empty().append(strs);
			}
		});
 	}
	
	/**
	 * 删除一个节点上选中的ng配置
	 * @param obj
	 */
	function deleteNginxOfNode(obj){
		var ngConfigPartList =$(obj).parent().parent().parent().find('.ngConfigCheckbox:checked').parent().find('.nginxForm');
		if($(ngConfigPartList).length==0){
			alert("请选择至少一个配置");
			return;
		}
		ngConfigPartList.each(function(index,domEle){
			/**
		     * 删除开始
		     */
			var appName = $(domEle).find('input[name="appName"]').val();
			var namespace= $(domEle).find('input[name="namespace"]').val();
		 	var serviceName= namespace+'-'+appName;
		 	var serverName=$(domEle).find('input[name="serverName"]').val();
		 	var listenPort=$(domEle).find('input[name="ListenPort"]').val();
		 	confseq=serverName+':'+listenPort;
		 	var flag = $(domEle).find('input[name="flag"]').val();
		 	var nodeIp =$(domEle).find('input[name="nodeIp"]').val();
		 	var nodePort = $(domEle).find('input[name="nodePort"]').val();
		 	$.ajax({
	 			url:""+ctx+"/deleteNginxCfgs",
	 			type:"POST",
	 			data:{"serviceName":serviceName,"flag":flag,"confseq":confseq,"had":true,"appName":appName,"namespace":namespace,"nodeIp":nodeIp,"nodePort":nodePort},
	 			success:function(data){
	 				 var data = eval("("+data+")");
	 				 if("200"==data.status){
	 					layer.msg( "更新成功！", {
			                icon: 1
			            })
	 					$(obj).parent().parent().remove();
	 				 }else if("502"==data.status){
	 					alert("该应用只有一个配置，无法删除");
	 				 }else if("501"==data.status){
	 					 alert("因逻辑原因删除失败");
	 				 }else{
	 					 alert("因为网络原因删除失败");
	 				 }
	 			}
	 	 });
		});
	}
	
	/**
	 * 删除一个ng配置
	 * @param obj
	 */
	function delOneSerPart(obj){
		var appName = $(obj).attr("appName");
		var namespace= $(obj).attr("namespace");
	 	var serviceName= namespace+'-'+appName;
	 	var serverName=$(obj).attr("serverName");
	 	var listenPort=$(obj).attr("listenPort");
	 	confseq=serverName+':'+listenPort;
	 	var flag = $(obj).attr("flag");
	 	var nodeIp = $(obj).attr("nodeIp");
	 	var nodePort = $(obj).attr("nodePort");
	 	$.ajax({
 			url:""+ctx+"/deleteNginxCfgs",
 			type:"POST",
 			data:{"serviceName":serviceName,"flag":flag,"confseq":confseq,"had":true,"appName":appName,"namespace":namespace,"nodeIp":nodeIp,"nodePort":nodePort},
 			success:function(data){
 				 var data = eval("("+data+")");
 				 if("200"==data.status){
 					layer.msg( "删除成功！", {
		                icon: 1
		            })
 					$(obj).parent().parent().remove();
 				 }else if("502"==data.status){
 					alert(data.message);
 				 }else if("501"==data.status){
 					 alert(data.message);
 				 }else{
 					 alert(data.message);
 				 }
 			}
 	 });
	}
	/**
	 * 在删除之前的一些判断
	 */
	function beforeDelete(){
		
	}
	
	/**
	 * 新增一个ng
	 * @param obj
	 */
	function addOneSerPart(obj){
		var appName=$(obj).parent().attr('appName');
		var namespace=$(obj).parent().attr('namespace');
		var nodeIp=$(obj).parent().attr('nodeIp');
		var flag=$(obj).parent().attr('flag');
		var nodePort=$(obj).parent().attr('nodePort');
		var str='<div class="ngConfigPart" border:1px solid #FF0000 >' 
			+'<input type="checkbox" class="ngConfigCheckbox"/> '
//			+'<span><i class="fa fa-plus fa-serverPlus" onClick="addOneSerPart(this)"></i></span> '
//			+'<span><i class="fa fa-openid" onClick="sendSerPart(this)"></i></span> '
			+'<span><i class="fa fa-trash" onClick="removeOneSerPart(this)"></i></span> '
			+'<span><i class="fa fa-save" onClick="nginxFormCommOne(this)"></i></span> '
			+'<span><i class="fa fa-caret-down" onClick="toggleOneSerPart(this)"></i></span> '
			+'<span>未提交的配置</span>'
			+'<span class="ngConfigPartTit"></span>'
			+'<div class="ngConfigPartCon">'
			+'<form class="nginxForm" id="nginxForm" method="post" action="'+ctx+'/saveNginxForm">'
			+'<input name="flag" value="'+flag+'" type="hidden"/>'
			+'<input type="hidden" name="serviceAppName" value="'+namespace+'-'+appName+'"/>'
			+'<input type="hidden" name="appName" value="'+appName+'"/>'
			+'<input type="hidden" name="namespace" value="'+namespace+'"/>'
			+'<input type="hidden" name="nodeIp" value="'+nodeIp+'"/>'
			+'<input type="hidden" name="nodePort" value="'+nodePort+'"/>'
			+'<div class="nginx-label">'
			+'<span class="upstreamPartTit">upstream</span><input type="text" class="appNameAndNamespace" name="appNameAndNamespace" value="'+appName+'-'+namespace+'" disabled>{'
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
			+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-upstreamUserRulesPlus" onClick="addOneupstreamUserRulesPlus(this)"></i></span>'
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
			+'<div class="col-md-offset-2">自定义配置<span><i class="fa fa-plus fa-locationUserRulesPlus" onClick="addOnelocationUserRulesPlus(this)"></i></span>'
			+'</div>'
			+'<div class="nginx-label col-md-offset-1">'
			+'<span>}</span>'
			+'</div>'
			+'<div class="col-md-offset-1">自定义配置<span><i class="fa fa-plus fa-serverUserRulesPlus" onClick="addOneserverUserRulesPlus(this)"></i></span>'
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
		$(obj).parent().parent().next().find(".ngConfigPartList").append(str);
	}
	
	function addOneSerPart_3(obj){
		$(obj).parent().parent();
		$(obj).parent().parent().after($(obj).parent().parent().prop('outerHTML'));
	}
	function addOneSerPart_2(obj){
		$(obj).parent().parent();
		$(obj).parent().parent().after($(obj).parent().parent().prop('outerHTML'));
	}
	function toggleOneSerPart(obj){
		var str ='<span class="ngConfigPoints">......  }</span>';
		var down = $(obj).attr('class').indexOf('down');
		
		if (down != -1){
			$(obj).parent().parent().find('.ngConfigPartCon').hide();
			$(obj).parent().parent().find('.ngConfigPartTit').append(str);
			$(obj).removeClass('fa-caret-down');
			$(obj).addClass('fa-caret-up');
			
		}else{
			$(obj).parent().parent().find('.ngConfigPartCon').show();
			$(obj).parent().parent().find('.ngConfigPoints').remove();
			$(obj).removeClass('fa-caret-up');
			$(obj).addClass('fa-caret-down');
		}
		
	}
	function delCheckedSer(){
		$(".ngConfigCheckbox:checked").parent().remove();
	}
	/**
	 * 删除一个没有提交的ng配置
	 */
	function removeOneSerPart(obj){
		$(obj).parent().parent().remove();
	}
	
	

	
	/**
	 * 增加一个upstreamUserRules
	 */
	function addOneupstreamUserRulesPlus(obj){
		var strs='';
		strs+='<div class="col-md-offset-1">'
				+'<span>|-<span>'
				+'<input type="text" id="upstreamUserRulesKey" name="upstreamUserRulesKey" value=""><span>:</span>'
				+'<input type="text" id="upstreamUserRulesValue" name="upstreamUserRulesValue" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOneupstreamUserRulesPlus(this)"></i></span> '
				+'</div>'
		$(obj).parent().parent().parent().append(strs);
	}
	function removeOneupstreamUserRulesPlus(obj){
		$(obj).parent().parent().parent().remove();
	}
	/**
	 * 增加一个location的用户自定义配置
	 * @param obj
	 */
	function addOnelocationUserRulesPlus(obj){
		var strs='';
		strs+='<div class="col-md-offset-2">'
				+'<span>|-<span>'
				+'<input type="text" id="locationUserRulesKey" name="locationUserRulesKey" value=""><span>:</span>'
				+'<input type="text" id="locationUserRulesValue" name="locationUserRulesValue" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOnelocationUserRulesPlus(this)"></i></span> '
				+'</div>'
				$(obj).parent().parent().after(strs);
	}
	function removeOnelocationUserRulesPlus(obj){
		$(obj).parent().parent().parent().remove();
	}
	/**
	 * 增加一个server用户自定义配置
	 * @param obj
	 */
	function addOneserverUserRulesPlus(obj){
		var strs='';
		strs+='<div class="col-md-offset-1">'
				+'<span>|-<span>'
				+'<input type="text" id="serverUserRulesKey" name="serverUserRulesKey" value=""><span>:</span>'
				+'<input type="text" id="serverUserRulesValue" name="serverUserRulesValue" value="">;'
				+'<span><i class="fa fa-trash" onClick="removeOneserverUserRulesPlus(this)"></i></span> '
				+'</div>'
		$(obj).parent().parent().after(strs);
	}
	function removeOneserverUserRulesPlus(obj){
		$(obj).parent().parent().parent().remove();
	}
	
	/**
	 * 提交表单之前的检测
	 */
	function deforeNginxFormComm(obj){
		var nginxform=obj;
		var failflag=0;
		if(nginxform.find("#ListenPort").val() <=0 |nginxform.find("#ListenPort").val()>=65535 |nginxform.find("#ListenPort").val().length === 0){
	        layer.tips('端口号的范围应该在1~65535之间', nginxform.find("#ListenPort"),{tips: [1, '#EF6578']});
	        failflag=1;
	        }
//	    if(nginxform.find("#serverName").val().search(/\d+\.\d+\.\d+\.\d+/) === -1 | nginxform.find("#serverName").val().length === 0){
//	        layer.tips('ip地址填写有误例如xxx.xxx.xxx.xxx', nginxform.find("#serverName"),{tips: [1, '#EF6578']});
//	            return false;
//	        }
	    if(nginxform.find("#Location").val().search(/^\/[a-zA-Z0-9][a-zA-Z0-9]+/) === -1 | nginxform.find("#Location").val().length === 0){
	        layer.tips('请以"/"开头的地址，例如/demo', nginxform.find("#Location"),{tips: [1, '#EF6578']});
	        	failflag=1;
	        }
	    if(nginxform.find("#realServerPath").val().search(/^\/[a-zA-Z0-9][a-zA-Z0-9]+/) === -1 | nginxform.find("#realServerPath").val().length === 0){
	        layer.tips('请以"/"开头的地址，例如/demo', nginxform.find("#realServerPath"),{tips: [1, '#EF6578']});
	        	failflag=1;
	        }
	    if(nginxform.find("#ProxyRedirectSrcPath").val().search(/^http:\/\/+/) === -1 | nginxform.find("#ProxyRedirectSrcPath").val().length === 0){
	        layer.tips('请以"/"开头的地址，例如/demo', nginxform.find("#ProxyRedirectSrcPath"),{tips: [1, '#EF6578']});
	        	failflag=1;	
	        }
	    if(nginxform.find("#ProxyRedirectDestPath").val().search(/^\/[a-zA-Z0-9][a-zA-Z0-9]+/) === -1 | nginxform.find("#ProxyRedirectDestPath").val().length === 0){
	        layer.tips('请以"/"开头的地址，例如/demo', nginxform.find("#ProxyRedirectDestPath"),{tips: [1, '#EF6578']});
	        	failflag=1;	
	        }
	    if(nginxform.find("#upstreamUserRulesKey")){
	    	var aflag =0;
	    	for(var i=0;i<nginxform.find("#upstreamUserRulesKey").length;i++){
	    		if($(nginxform.find("#upstreamUserRulesKey")[i]).val().length==0 | $(nginxform.find("#upstreamUserRulesValue")[i]).val().length==0){
	    			layer.tips('key或value不能为空', nginxform.find(".fa-upstreamUserRulesPlus"),{tips: [1, '#EF6578']});
	    			failflag = 1;
	    			return failflag;
	    		}
	    	}
	    }
	    if(nginxform.find("#locationUserRulesKey")){
	    	for(var i=0;i<nginxform.find("#locationUserRulesKey").length;i++){
	    		if($(nginxform.find("#locationUserRulesKey")[i]).val().length==0 | $(nginxform.find("#locationUserRulesKey")[i]).val().length==0){
	    			layer.tips('key或value不能为空', nginxform.find(".fa-locationUserRulesPlus"),{tips: [1, '#EF6578']});
	    			failflag = 1;
	    			return failflag;
	    		}
	    	}
	    }
	    if(nginxform.find("#serverUserRulesKey")){
	    	for(var i=0;i<nginxform.find("#serverUserRulesKey").length;i++){
	    		if($(nginxform.find("#serverUserRulesKey")[i]).val().length==0 | $(nginxform.find("#serverUserRulesKey")[i]).val().length==0){
	    			layer.tips('key或value不能为空', nginxform.find(".fa-serverUserRulesPlus"),{tips: [1, '#EF6578']});
	    			failflag = 1;
	    			return failflag;
	    		}
	    	}
	    }
	    return failflag;
	    
	}
	
	/**
	 * 提交一个ng配置
	 * @param obj
	 */
	function nginxFormCommOne(obj){
		var ngConfigPart = $(obj).parent().parent().find('#nginxForm');
		var nginxform = ngConfigPart;
		if(1==deforeNginxFormComm($(nginxform))){
			return;
		}
		$(ngConfigPart).ajaxSubmit(function(data) {
			var data = eval("("+data+")");
			if('200'==data.status){
            	if($('#search_service').val().length>0){
            		//findNgByOneApp($('#search_service'));	
            		localRefreshNg(obj);
            	}else{
            		if($('#search_user').val().length>0){
            			//searchByUser('#search_user');
            			localRefreshNg(obj);
            		}else{
            			//findAllNg();
            			localRefreshNg(obj);
            		}
            	}
				
				layer.msg( "更新成功！", {
	                icon: 1
	            },function(){
	            	
	
	            });
			}else{
				warningInfo("失败:\\n"+data.error);
			}
		});
	} 
	
	/**
	 * 提交一个node下的所有配置
	 * @param obj
	 */
	function nginxFormCommOfNode(obj){
		var ngConfigPartList =$(obj).parent().parent().parent().find('.ngConfigCheckbox:checked').parent().find('.nginxForm');
		var errorStr="失败:\\n";
		var isError=0;
		var isStop=0;
		if($(ngConfigPartList).length==0){
			alert("请选择至少一个配置");
			return;
		}
		ngConfigPartList.each(function(index,domEle){
			/**
		     * 提交表单
		     */
			nginxform=domEle;
			if(1==deforeNginxFormComm($(nginxform))){
				isStop=1;
				return;
			}
			$(domEle).ajaxSubmit(function(data) {
				var data = eval("("+data+")");
					if('200'==data.status){
					}else{
						isError=1;
						errorStr+=data.error;
					}
				}); 
			 });
			if(isStop==1){
				return;
			}
			if(isError==0){
				if($('#search_service').val().length>0){
		    		findNgByOneApp($('#search_service'));	
		    	}else{
		    		if($('#search_user').val().length>0){
		    			searchByUser('#search_user');
		    		}else{
		    			findAllNg();
		    		}
		    	}
				layer.msg( "更新成功！", {
		            icon: 1
		        },function(){
		        	
		        });
			}else{
				warningInfo(errotStr);
			}
	}
	


	/**
	 * 检测当前ngxin配置是否正确
	 * @param obj
	 */
	function nginxCfgCheck(obj){
		var nodeIp = $(obj).parent().attr("nodeIp");
		var nodePort = $(obj).parent().attr("nodePort");
		$.ajax({
			method:"POST",
			data:{"nodeIp":nodeIp,"nodePort":nodePort},
			url:ctx+"/nginxCfgCheck",
			success:function(data){
				data = eval('('+data+')');
				if(data.testToolResponseBody.result==true & data.testToolResponseBody.errorMessage==0){
					layer.msg( "配置正常！", {
			            icon: 1
			        },function(){
			        	
			        });
				}else{
					warningInfo(data.testToolResponseBody.errorMessage);
				}
			}
		});
	}
	
	/**
	 * 启动一个nginx服务
	 */
	function nginxPowerOn(obj){
		var nodeIp = $(obj).parent().attr("nodeIp");
		var nodePort = $(obj).parent().attr("nodePort");
		$.ajax({
			method:"POST",
			data:{"nodeIp":nodeIp,"nodePort":nodePort},
			url:ctx+"/nginxPowerOn",
			success:function(data){
				data = eval('('+data+')');
				if(data.testToolResponseBody.result==true & data.testToolResponseBody.errorMessage==0){
					layer.msg( "该nginx服务重新启动！", {
			            icon: 1
			        },function(){
			        	
			        });
				}else{
					warningInfo(data.testToolResponseBody.errorMessage);
				}
			}
		});
	}
	/**
	 * 停止一个nginx服务
	 */
	function nginxPowerOff(obj){
		var nodeIp = $(obj).parent().attr("nodeIp");
		var nodePort = $(obj).parent().attr("nodePort");
		$.ajax({
			method:"POST",
			data:{"nodeIp":nodeIp,"nodePort":nodePort},
			url:ctx+"/nginxPowerOff",
			success:function(data){
				data = eval('('+data+')');
				if(data.testToolResponseBody.result==true & data.testToolResponseBody.errorMessage==0){
					layer.msg( "该nginx服务关闭", {
			            icon: 1
			        },function(){
			        	
			        });
				}else{
					warningInfo(data.testToolResponseBody.errorMessage)
				}
			}
		});
	}
	
	/**
	 * 导出配置信息前，先检测
	 * @param nodeIp
	 * @param nodePort
	 * @param ngDownUser
	 * @param ngDownPwd
	 */
	function beforeDownloadCfg(nodeIp, nodePort, ngDownUser, ngDownPwd){
		$.ajax({
			method:"POST",
			url:ctx+"/beforeDownloadCfg",
			data:{"nodeIp":nodeIp, "nodePort":nodePort, "ngDownUser":ngDownUser, "ngDownPwd":ngDownPwd},
			success:function(data){
				data = eval('('+data+')');
				var errcode = data.error;
				if("200" == errcode){
					result = 0;
				}else{
					result = 1;
				}
				callback(result);
			}
		});
	}
	
	/**
	 * 导出一个node的配置信息
	 * @param obj
	 */
	function nginxExport(obj){
		var nodeIp = $(obj).parent().attr("nodeIp");
		var nodePort = $(obj).parent().attr("nodePort");
		var downloadcfgpath = $(obj).parent().attr("downloadcfgpath");
		var area =$("#area").val();
		var appName = $('#search_service').val();
		var namespace= $('#search_service').find("option:selected").attr("namespace");
	 	var serviceName= $('#search_service').find("option:selected").attr("namespace")+'-'+$('#search_service').val();
	 	var flag = $('#search_service').find("option:selected").attr("flag");
	 	var exportType=$(obj).attr("exportType");
		layer.open({
			type: 1,
	        title: '请填写该服务器的账号的密码再下载',
	        content: $("#nginxDownload"),
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
	        	$.ajax({
	    			method:"POST",
	    			url:ctx+"/beforeDownloadCfg",
	    			data:{"nodeIp":nodeIp, "nodePort":nodePort, "ngDownUser":ngDownUser, "ngDownPwd":ngDownPwd},
	    			success:function(data){
	    				data = eval('('+data+')');
	    				var errcode = data.error;
	    				if("200" == errcode){
	    					layer.close(index);
	    		        	if(exportType==0){
	    		    			location.href = ctx + "/nginxExport?nodeIp=" + nodeIp +"&nodePort="+ nodePort
	    		    							+"&area="+ area+"&serviceName="+ serviceName+"&flag="+ flag+"&appName="+appName+"&exportType="+exportType
	    		    							+"&downloadcfgpath="+downloadcfgpath+"&ngDownUser="+ngDownUser+"&ngDownPwd="+ngDownPwd;
	    		    		}else if(exportType==1){
	    		    			namespace=$('#search_user').val();
	    		    			location.href = ctx + "/nginxExport?nodeIp=" + nodeIp +"&nodePort="+ nodePort
	    		    							+"&area="+ area+"&namespace="+ namespace+"&flag="+999+"&appName="+appName+"&exportType="+exportType
	    		    							+"&downloadcfgpath="+downloadcfgpath+"&ngDownUser="+ngDownUser+"&ngDownPwd="+ngDownPwd;
	    		    		}else if(exportType==2){
	    		    			location.href = ctx + "/nginxExport?nodeIp=" + nodeIp +"&nodePort="+ nodePort+"&namespace="+ namespace
	    		    							+"&flag="+999+"&appName="+appName+"&exportType="+exportType
	    		    							+"&downloadcfgpath="+downloadcfgpath+"&ngDownUser="+ngDownUser+"&ngDownPwd="+ngDownPwd;
	    		    		}
	    				}else{
	    					alert("error,请检测与FTP连接正常，并保证用户名密码正确");
	    				}
	    			}
	    		});
	        }
		});
	}
	/**
	 * 弹出警告信息
	 * @param info
	 */
	function warningInfo(info){
		var warningHTML = '<div class="alert alert-warning">'+
	    '<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<div class="waringInfo"><img src="'+ctx+'/images/warning.png" alt="警告标示"/><span>'+info+'</span></div>'+
		'</div>';
		$("#nginxCfgCheckInfo").html(warningHTML);
	}
	
	/**
	 * 批量使用nginxtool
	 */
	function nginxCfgToolMore(obj){
	$("#nginxToolSelect #tbody").empty();
	var area =$("#area").val();
	var tooltype=$(obj).attr("tooltype");
	$.ajax({
		method:"POST",
		url:ctx+"/loadAreaAndNode",
		data:{},
		success:function(data){
			data = eval('('+data+')');
			var bodystr='';
			var areaMap = data.data;
			for (var key in areaMap) {
				if(key==area){
				bodystr+='<tr>'
				var nodeMap = areaMap[key].node;
				for(var key in nodeMap){
					bodystr+='<td><label class="areaNodes"><input type="checkbox" name="nodeCheck" class="node" value="'+nodeMap[key]+'">'+nodeMap[key]+'</label></td>'
				}
				bodystr+='</tr>';
				}
	        }
			$("#nginxToolSelect #tbody").append(bodystr);
			
			layer.open({
				type: 1,
		        title: '选择要使用nginx工具的node',
		        content: $("#nginxToolSelect"),
		        area: ['660px'],
		        btn: ['确定', '取消'],
		        yes: function(index, layero){
		        	var nodeList=$("#nginxToolSelect #tbody .node:checked");
		        	var stack=[];
		        	nodeList.each(function(){    
		        		  stack.push($(this).val());    
		        	  });
		        	if(stack.length==0){
		        		alert("请选择一个node节点进行操作");
		        		return;
		        	}
		        	stack=stack.join(",");
		    	 	$.ajax({
		    			method:"POST",
		    			url:ctx+"/nginxToolMore",
		    			data:{"nodes":stack,"tooltype":tooltype
		    	            },
		    			success:function(data){
		    				layer.close(index);
		    				data = eval('('+data+')');
		    				warningInfo(data.errorMessage)
		    			}
		    			});
		        
		        }}
			
			);
		}
	});
	}
	
	
	/**
	 * 下发到同一个区的各个地方
	 */
	function sendSerPart(obj){
		$("#sendSerSelect #tbody").empty();
	    var area =$("#area").val();
		$.ajax({
			method:"POST",
			url:ctx+"/loadAreaAndNode",
			data:{},
			success:function(data){
				data = eval('('+data+')');
				var bodystr='';
				var areaMap = data.data;
				for (var key in areaMap) {
					if(key==area){
					bodystr+='<tr>'
					var nodeMap = areaMap[key].node;
					for(var key in nodeMap){
						bodystr+='<td><label class="areaNodes"><input type="checkbox" name="nodeCheck" class="node" value="'+nodeMap[key]+'">'+nodeMap[key]+'</label></td>'
					}
					bodystr+='</tr>';
					}
		        }
				$("#sendSerSelect #tbody").append(bodystr);
				
				layer.open({
					type: 1,
			        title: '下发NGINX配置',
			        content: $("#sendSerSelect"),
			        area: ['660px'],
			        btn: ['确定', '取消'],
			        yes: function(index, layero){
			        	var nodeList=$("#sendSerSelect #tbody .node:checked");
			        	var stack=[];
			        	nodeList.each(function(){    
			        		  stack.push($(this).val());    
			        	  });
			        	if(stack.length==0){
			        		alert("请选择一个node节点进行下发");
			        		return;
			        	}
			        	stack=stack.join(",");
			        	var appName = $(obj).attr("appName");
			    		var namespace= $(obj).attr("namespace");
			    	 	var serviceName= namespace+'-'+appName;
			    	 	var serverName=$(obj).attr("serverName");
			    	 	var listenPort=$(obj).attr("listenPort");
			    	 	confseq=serverName+':'+listenPort;
			    	 	var flag = $(obj).attr("flag");
			    	 	var nodeIp = $(obj).attr("nodeIp");
			    	 	var nodePort = $(obj).attr("nodePort");
			        	$.ajax({
			    			method:"POST",
			    			url:ctx+"/sendSerPart",
			    			data:{"nodes":stack,"flag":flag,"serviceName":serviceName
			    	            ,"appName":appName ,"namespace":namespace
			    	            ,"nodeIp":nodeIp,"nodePort":nodePort,"listenPort":listenPort,"serverName":serverName,"confseq":confseq},
			    			success:function(data){
			    				data = eval('('+data+')');
			    				if(data.error==200){
			    					layer.close(index);
			    					if($('#search_service').val().length>0){
		    		            		findNgByOneApp($('#search_service'));	
		    		            	}else{
		    		            		if($('#search_user').val().length>0){
		    		            			searchByUser('#search_user');
		    		            		}else{
		    		            			findAllNg();
		    		            		}
		    		            	}
			    					layer.msg( "成功将配置下发到所选节点", {
			    			            icon: 1
			    			        },function(){
			    			        	
			    			        });
			    				}else if(data.error==501){
			    					warningInfo("你要下发的配置可能不存在，请刷新页面确认");
			    				}
			    			}
			    			});
			        
			        }
				});
			}
		})
		
		
	}
	/**
	 * 比较两套nginx的不同
	 * @param obj
	 */
	function nginxCompare(obj){
		//nginxCompareSelect
		$("#nginxCompareSelect #tbody").empty();
		var area =$("#area").val();
		$.ajax({
			method:"POST",
			url:ctx+"/loadAreaAndNode",
			data:{},
			success:function(data){
				data = eval('('+data+')');
				var bodystr='';
				var areaMap = data.data;
				var nodePort = $(obj).parent().attr("nodePort");
				for (var key in areaMap) {
					if(key==area){
					bodystr+='<tr>'
					var nodeMap = areaMap[key].node;
					for(var key in nodeMap){
						var keyStr = nodeMap[key];
						var index1=keyStr.lastIndexOf(":");
						var index2=keyStr.length;
						var suffix=keyStr.substring(index1,index2);//后缀名
						if(nodePort==suffix){
							bodystr+='<td><label class="areaNodes"><input type="radio" name="nodeCheck" class="node" value="'+nodeMap[key]+'">'+nodeMap[key]+'</label></td>'
						}
					}
					bodystr+='</tr>';
					}
		        }
				$("#nginxCompareSelect #tbody").append(bodystr);
				
				layer.open({
					type: 1,
			        title: '选择要对比的node',
			        content: $("#nginxCompareSelect"),
			        area: ['660px'],
			        btn: ['确定', '取消'],
			        yes: function(index, layero){
			        	var nodeIp = $(obj).parent().attr("nodeIp");
			    	 	var originEndpoint = "http://"+ nodeIp+nodePort+"/";
			        	var compareEndpoint = "http://"+ $("#nginxCompareSelect #tbody .node:checked").val()+"/";
			    	 	$.ajax({
			    			method:"POST",
			    			url:ctx+"/nginxCompare",
			    			data:{"originEndpoint":originEndpoint,"compareEndpoint":compareEndpoint
			    	            },
			    			success:function(data){
			    				layer.close(index);
			    				data = eval('('+data+')');
			    				warningInfo(data.errorMessage)
			    			}
			    			});
			        
			        }}
				
				);
			}
		});
	}
	
