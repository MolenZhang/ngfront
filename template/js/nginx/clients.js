 $(document).ready(function () {
	var locationUrl = window.location;
	//http://192.168.252.133:8083/ngfront/zone/clients?areaType=user
	
	 var areaType=locationUrl.search.substring(locationUrl.search.indexOf("=")+1,locationUrl.search.length);
	 showClients(areaType);
	
 });/*reday*/
// var objTest = [
//    {
//        "JobZoneType": "",
//        "Clients": []
//    },
//    {
//        "JobZoneType": "",
//        "Clients": []
//    },
//    {
//        "JobZoneType": "dmz1",
//        "Clients": [
//            {
//                "NodeIP": "192.168.252.133",
//                "NodeName": "192.168.252.133",
//                "ClientID": "8039",
//                "APIServerPort": ":8886",
//                "K8sWatcherStatus": "stop"
//            }
//        ]
//    },
//    {
//        "JobZoneType": "user",
//        "Clients": [
//            {
//                "NodeIP": "192.168.252.133",
//                "NodeName": "192.168.252.133",
//                "ClientID": "10230",
//                "APIServerPort": ":8888",
//                "K8sWatcherStatus": "start"
//            }
//        ]
//    }
//];
function showClients(areaType){
	var areaIP = "192.168.252.133";
	var areaPort = "8083";
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
			 		var APIServerPort = clientsVal[i].APIServerPort;
			 		var K8sWatcherStatus = clientsVal[i].K8sWatcherStatus;
			 		var statusHtml = "";
			 		if(K8sWatcherStatus == "start"){
			 			statusHtml = '<img src="/images/running.gif" alt=""/>&nbsp;工作中';
			 		}else{
			 			statusHtml = '<img src="/images/stop.png" alt=""/>&nbsp;工作中';
			 		}
			 		clientsHtml += '<tr>'+
                                    		'<td style="text-indent: 30px;">'+
                                    		'<input type="checkbox" class="chkItem" name="ids" value=""></td>'+
											'<td class="statusImg">'+statusHtml+'</td>'+
                                    		'<td>'+ClientID+'</td>'+
                                    		'<td>'+NodeName+'</td>'+
                                    		'<td>'+NodeIP+'</td>'+
                                    		'<td>'+APIServerPort+'</td>'+
                                    		'<td class="operationBtns">'+
                                    			'<a><i class="fa fa-play"></i></a>'+
                                    			'<a><i class="fa fa-power-off"></i></a>'+
                                    			'<a href="file:///C:/Users/Administrator/Desktop/src/views/nginx/area-nodes.html"><i class="fa fa-gear"></i></a>'+
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
