<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="/WEB-INF/tlds/c.tld" %>
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <title>用户登录</title>
   <%@include file="frame/dashboard-header.jsp" %>
    <link rel="stylesheet" type="text/css" href="<%=path %>/css/core/layout.css">
</head>
<body>

<header class="header">
    <div class="navbar navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <a href="javascript:void(0);">
                    <h2>BONC-PaaS</h2>
                </a>
            </div>
        </div>
    </div>
</header>
<div class="container">
    <div class="login-container">
        <div class="sign-container">
            <h3>登录</h3>
            <div class="sign-form">
                <div class="loginMsg">
                    <span class="">${err_code }</span>
                </div>
                <form id="loginForm" class="form" action="<%=path %>/signin" method="post">
                    <div class="form-group">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <i class="fa fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="userName" name="userName" placeholder="请输入用户名" value="${user.userName }">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <i class="fa fa-lock"></i>
                            </span>
                            <input type="password" class="form-control" id="password" name="password" placeholder="请输入密码" value="${user.password }">
                        </div>
                    </div>
                    <c:choose>
                        <c:when test="${showAuthCode}">
		                    <div class="form-group">
		                            <input id="authCode" name="authCode" placeholder="请输入验证码" type="text"/>
		                            <label><img type="image" src="<%=path %>/authCode" id="codeImage" onclick="chageCode()" title="图片看不清？点击重新得到验证码" style="cursor:pointer;"/></label>
		                            <label><a onclick="chageCode()" style="cursor:pointer;">换一张</a></label>
		                    </div>
                        </c:when>
                     </c:choose>
					    
                    <div class="form-group">
                        <button id="btn-signin" class="btn btn-primary btn-block" type="button" disabled="disabled">登录</button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
var showAuthCode = ${showAuthCode};
    $(function(){
        checkEnter();

        $("#userName").on("keyup", function(){
            checkEnter();
        }).on("change", function(){
        	checkEnter();
        });

        $("#password").on("keyup", function(){
            checkEnter();
        }).on("change", function(){
        	checkEnter();
        });
        
        $("#authCode").on("keyup", function(){
            checkEnter();
        }).on("change", function(){
            checkEnter();
        });
        
        function checkEnter(){
            var checkFlag = $("#userName").val() && $("#password").val();
            if (showAuthCode) {
            	checkFlag = $("#authCode").val() && checkFlag;
            }
            if(checkFlag){
                $("#btn-signin").removeAttr("disabled");
                return true;
            }else{
                $("#btn-signin").attr("disabled", "disabled");
                return false;
            }
        }

        $(window).keydown(function(e){
            if(e.keyCode==13){
                if(checkEnter()) {
                    $("#loginForm").submit();
                }
            }
        });
        
        $("#btn-signin").click(function(){
            $("#loginForm").submit();
        });

    });
    
    function chageCode(){
        $('#codeImage').attr('src',ctx+'/authCode?abc='+Math.random());//链接后添加Math.random，确保每次产生新的验证码，避免缓存问题。
    }

</script>
</body>
</html>