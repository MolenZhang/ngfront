$(document).ready(function(){

    $(".pull-deploy").click(function(){

        $(".step-inner").css("left","-100%");
        $(".createPadding").removeClass("hide");
        $(".radius_step").removeClass("action").eq(1).addClass("action");
        $(".two_step").removeClass("hide");

    });

    $(".two_step").click(function(){

        $(this).addClass("hide");
        $(".createPadding").removeClass("hide");
        $(".radius_step").removeClass("action").eq(2).addClass("action");
        $(".step-inner").css("left","-200%");

    });

    $(".go_backs").click(function(){

        if($(".radius_step").eq(1).hasClass("action")){
            $(".createPadding").addClass("hide");
            $(".step-inner").css("left","0");
            $(".radius_step").removeClass("action").eq(0).addClass("action");
        }else if($(".radius_step").eq(2).hasClass("action")){
            $(".createPadding").removeClass("hide");
            $(".step-inner").css("left","-100%");
            $(".radius_step").removeClass("action").eq(1).addClass("action");
        }

    });

});