$(function(){

    // 全选  全选checkbox class设为 chkAll
    $(".chkAll").click(function(){
        $(".chkItem").prop('checked',$(".chkAll").is(":checked"));
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
    
});

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
