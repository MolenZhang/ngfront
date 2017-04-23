$(function(){

    // 全选  全选checkbox class设为 chkAll
    $(".chkAll").click(function(){
        $(this).parents("table").find("input.chkItem").prop('checked',$(".chkAll").is(":checked"));
        //$(".chkItem").prop('checked',$(".chkAll").is(":checked"));
    });
 
    // 每条数据 checkbox class设为 chkItem
    $(document).on("click",".chkItem", function(){
        if($(this).is(":checked")){
            if ($(".chkItem:checked").length == $(".chkItem").length) {
                $(".chkAll").prop("checked", "checked");
            }
        }else{
            $(".chkAll").prop('checked', $(this).is(":checked"));
        }
    });
    // setCookie("areaIP", "192.168.19.128");
    // setCookie("areaPort", "8083");
    // var areaIP = getCookie("areaIP");
    // var areaPort = getCookie("areaPort");
});
 

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1)
                c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

function setCookie(c_name, value) {
    document.cookie = c_name + "=" + escape(value) + ";maxage=-1;path=/"
}

function sliderFn(sliderId, max, min, value){

    if(value == undefined){
        value = 10;
    }

    var sliderObj = $("#"+sliderId).slider({
        formatter: function(value) {
            return value;
        },
        max:max,
        min:min,
        value : value,
        tooltip:'hide'
    });

    sliderObj.on("slide", function(slideEvt) {
        $("#"+sliderId+'_input').val(slideEvt.value);
    }).on("change", function(slideEvt){
        $("#"+sliderId+'_input').val(slideEvt.value.newValue);
    });

    $("#"+sliderId+'_input').on("change",function(){
        var sliderVal = Number($(this).val());
        //sliderObj.setValue(sliderVal);
        sliderObj.slider('setValue', sliderVal);
    });

    return sliderObj;
}


/*function testFun(){
    var testUrl = "http://192.168.85.130:8083/watchers/1/stop?NodeIP=192.168.85.130&ClientID=73093";
    var testData = {
    }
    
    $.ajax({
        url: testUrl,
        dataType: "json",
        contentType: "text/html; charset=UTF-8",
        type:"put",            // get put post delete
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
       // data: JSON.stringify(testData),
        success:function(data){
            var data=data;
        }
    });
}*/



function testFunForWatcherTestOK(){
    var testUrl = "http://192.168.85.130:8083/watchers/1/stop?NodeIP=192.168.85.130&ClientID=73093";
    var testData = {
    }
    
    $.ajax({
        url: testUrl,
        dataType: "json",
        contentType: "text/html; charset=UTF-8",
        type: "put",            // get put post delete
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },

       // data: JSON.stringify(testData),
        success:function(data){
            var data=data;
        }
    })
}
