<%@ taglib prefix="c" uri="/WEB-INF/tlds/c.tld" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%String path=request.getContextPath(); %>
<html>
<head>
</head>
<body>

<header class="header">
    <div class="navbar navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <a href="javascript:void(0);">
                    <h2>Nginx配置管理</h2>
                </a>
            </div>
            
        </div>
    </div>
</header>

</body>

<script type="text/javascript">

    $(function(){

 //       var menu_flag = '${menu_flag}';
 var menu_flag = 'service';

        $("#menu_"+menu_flag).addClass("item-click");

        // 菜单效果
        $(".nav-menu>li").on("mouseenter",function(){
            $(".nav-menu>li").css("background-color","transparent");
            $(".nav-menu>li").children(".nav-item-hover").css("display","none");
            $(this).css("background-color","#3c81e0");
            $(this).css("font-size","110%");
            $(this).children(".nav-item-hover").css("display","block");
        });

        $(".nav-menu>li").on("mouseleave",function(){
            $(this).css("background-color","transparent");
            $(this).children(".nav-item-hover").css("display","none");
            $(".item-click").css("background-color","#3c81e0");
            
        });

    });
    
    //分页插件中的时间格式的转换;
    function calendarFormat(data){
    	 var date = new Date(data);
         var y = date.getFullYear();  
         var m = date.getMonth() + 1;  
         m = m < 10 ? ('0' + m) : m;  
         var d = date.getDate();  
         d = d < 10 ? ('0' + d) : d;  
         var h = date.getHours();  
         h=h < 10 ? ('0' + h) : h;  
         var minute = date.getMinutes();  
         minute = minute < 10 ? ('0' + minute) : minute;  
         var second=date.getSeconds();  
         second=second < 10 ? ('0' + second) : second;  
         return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second; s
    }
    


</script>

</html>
