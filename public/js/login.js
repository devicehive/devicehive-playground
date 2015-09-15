$(document).ready(function() {

    if($.cookie('device-hive-user-login') !== 'user-login'){
        $.cookie('device-hive-user-login','user-login');
        $('#signUpModal').modal('show');
    }

    $('#menuPlayground').bind("click", function(e){
        $('.menuOverlay').hide();
        $('.mainContent').toggleClass('hide');
        $('#loginModal').toggleClass('hide');
    });

    $('#loginBtn').bind("click", function(e){
        $('.mainContent').toggleClass('hide');
        $('#loginModal').toggleClass('hide');
    });

    $('#signupBtn').bind("click", function(e){
        $('.mainContent').toggleClass('hide');
        $('#loginModal').toggleClass('hide');
    });

});
