 $(document).ready(function () {
	 $(".fa-nodeEdit").click(function(){
		 $(this).parent().hide();
		 $(this).parent().next().css("display","block");
	 });
	 
	 $(".fa-nodeSave").click(function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 
	 $(".fa-nodeTimes").click(function(){
		 $(this).parent().hide();
		 $(this).parent().prev().show();
	 });
	 
	 //停止监控按钮
	 $(".btn-stop").click(function(){
		 var stopSrc = ctx +'/images/stop.png';
		 $(this).parent().find("img").attr("src",stopSrc);
	 });
	//停止监控按钮
	 $(".btn-start").click(function(){
		 var startSrc = ctx +'/images/running.gif';
		 $(this).parent().find("img").attr("src",startSrc);
	 });
	//进入Nginx配置管理界面
	 $(".btn-toNginx").click(function(){
		 location.href = "file:///C:/Users/Administrator/Desktop/src/views/nginx/k8snginxcfg.html" ;
	 });
	 
	 
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
			    xAxis : [
			        {
			            type : 'category',
			            data : ['user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5','user1', 'user2', 'user3', 'user4', 'user5'],
			            axisTick: {
			                alignWithLabel: true
			            }
			        }
			    ],
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
			            data:[3, 4, 6, 1, 7,3, 4, 6, 1, 7,3, 4, 6, 1, 7,3, 4, 6, 1, 7]
			        }
			    ]
			};

	 myChart.setOption(option);

	 //test();
 });/*reday*/
 
 function test(){
//	 data_param = {
//		"timeType" : "LAST_7_DAYS",
//		"hostType" : "ALL_HOSTS"
//	}
	$.ajax({
		url : "http://192.168.0.75:8080/api/v1/namespaces",
		type : "GET",
		data : JSON.stringify(data_param),
		headers : {
			"X-Auth-Token" : "open-sesame",
			"Content-Type" : "application/json"
		},
		contentType : 'text/html; charset=UTF-8',
		dataType : "json",
		success : function(data) {
			alert(data);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.status);
			alert(XMLHttpRequest.readyState);
			alert(textStatus);
		},
		complete : function(XMLHttpRequest, textStatus) {
		}
	});
	 
//		$.ajax({
//			type : "get",
//	        async: false,
//	        headers:{
//	        	"X-Auth-Token":"open-sesame",
//	        	"Content-Type":"application/json"
//	        	},
//	        contentType:"text/html;charset=UTF-8",
//	        dataType: "json",
//			url : "http://192.168.0.75:8080/api/v1/namespaces",
//			success : function(data) {
//				alert(data);
//			}
//		});
	 
//	 $.getJSON('http://192.168.0.75:8080/api/v1/namespaces/longlong', function(data){
//		 alert(data);
//		});

//	 $.ajax({
//		 url : "192.168.0.75:8080/api/v1/namespaces",
//		 type : "get",
//		 success : function(data){
//			 var data = eval("(" + data + ")");
//			 alert(data)
//		 }
//	 });
 }

	