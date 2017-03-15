 $(document).ready(function () {
	
	 var option = {
			    title : {
			        text: 'nginx代理区域',
			        x:'center'
			    },
			    tooltip : {
			        trigger: 'item',
			        formatter: "{a} <br/>{b} : {c} (个节点)"
			    },
			    legend: {
			        orient: 'vertical',
			        left: 'left',
			        data: ['user','dmz1','dmz2']
			    },
			    series : [
			        {
			            name: '节点IP',
			            type: 'pie',
			            radius : '55%',
			            center: ['50%', '60%'],
			            data:[],
			            itemStyle: {
			                emphasis: {
			                    shadowBlur: 10,
			                    shadowOffsetX: 0,
			                    shadowColor: 'rgba(0, 0, 0, 0.5)'
			                }
			            }
			        }
			    ]
			};

	
	 
	 //滚动条
	 $('#areaNodesTbody').niceScroll({ cursorcolor: "#ccc" });
	 
	  test(option);
	
	
	
 });/*reday*/
 
function test(option){
	var areaIP = "192.168.252.133";
	var areaPort = "8083";
	var areaUrl = "http://"+areaIP+":"+areaPort+"/ngfront/zone";
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
					 dataNum = objTest[areaNum].Clients.length;
					 optionDataNum = {value:dataNum, name:dataType};
					 option.series[0].data.push(optionDataNum);
					 //table
					 var countNum = "count"+areaNum;
					 tbodyHtml = '<tr><td class="center tdType" rowspan="'+dataNum+'">'+dataType+'</td>';
					 tbodyHtml+='<td><a>'+objTest[areaNum].Clients[0].NodeIP+'</a></td>'
						'</tr>';
					 if(dataNum!=1){
						 for(countNum = 1; countNum< dataNum; countNum++){
							 tbodyHtml+='<tr><td><a>'+objTest[areaNum].Clients[countNum].NodeIP+'</a></td></tr>';
						 }
					 }
					 $("#areaNodesTbody").append(tbodyHtml);
					  
				 }
				 
			 }
			//画饼状图
			 var myChart = echarts.init(document.getElementById('areas'));
	 myChart.setOption(option);
	 
		}
	})
}
	
