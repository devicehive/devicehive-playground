/**
 * Created by Sergey on 8/21/2015.
 */

// Get the logged in user
function getCurrentUser() {
    $('#sLogin').hide();
    $('#sInfo').show();

    $.get( "info", function( data ) {
        $("#server_data").html(data);
    }).fail(function(res) {
        $("#server_data").text(res.responseText);
        $.removeCookie("is_authenticated");
    });
}

function onUserMissing(){
    $('#sLogin').show();
    $('#sInfo').hide();
}

function checkUser(){

    // Check if there is a session cookie
    var isAuthenticated = $.cookie("connect.sid");

    if (isAuthenticated) {

        // Get the logged in user
        getCurrentUser();
    } else {
        onUserMissing();
    }

}

$( document ).ready(function() {
    checkUser();
    $('#access-jwt').tooltip();
    $('#refresh-jwt').tooltip();
});

// Logout function
function logout() {
    $.removeCookie("connect.sid");
    window.location = "/logout";
}

// Function to copy to clipboard
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}


