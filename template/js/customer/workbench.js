$(document).ready(function(){
    $(".app-list a[class=icon-view]").on("click",function(){
        window.location.href = $(this).attr("action");
    });
});
