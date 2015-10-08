/**
 * Created by Sergey on 8/21/2015.
 */

UserApp.initialize({ appId: "55d4b6eb20d74" });

// Get the logged in user
function getCurrentUser(callback) {
    UserApp.User.get({ user_id: "self" }, function(error, user) {
        if (error) {
            callback && callback(null);
        } else {
            callback && callback(user[0]);
        }
    });
}


function onUserLoaded(user){
    $('#sLogin').hide();
    $('#sInfo').show();

    console.log('USER', user);

    if (user.first_name && user.last_name){
        $('#greeting').text(user.first_name + ' '+ user.last_name + ' (' + user.email + ')');
    } else {
        $('#greeting').text(user.email);
    }

    $.get( "info", function( data ) {
        $("#server_data").html(data);
    }).fail(function(res) {
        $("#server_data").text(res.responseText);
    });

}

function onUserMissing(){
    $('#sLogin').show();
    $('#sInfo').hide();
}

function checkUser(){

    // Check if there is a session cookie
    var token = $.cookie("ua_session_token");

    if (token) {
        // Yes, there is
        UserApp.setToken(token);

        // Get the logged in user
        getCurrentUser(function(user) {

            if (user) {
                onUserLoaded(user);
            } else {
                $.removeCookie("ua_session_token");
                onUserMissing();
            }
        });
    } else {
        onUserMissing();
    }

}

function socialLogin(providerId) {
    var redirectUrl = window.location.protocol+'//'+window.location.host+window.location.pathname;
    UserApp.OAuth.getAuthorizationUrl({ provider_id: providerId, redirect_uri: redirectUrl },
        function(error, result) {
            if (!error) {
                window.location.href = result.authorization_url;
            }
        }
    );
}

function reload(){
    var redirectUrl = window.location.protocol+'//'+window.location.host+window.location.pathname;
    window.location.href = redirectUrl;
}

function verify_email(token) {

    UserApp.User.verifyEmail({
        "email_token": token
    }, function(error, result){
        if (error){
            alert(error.message ? error.message : JSON.stringify(error));
        } else {
            alert("Email verified! You can now login.");
        }
    });

}


$( document ).ready(function() {

    var matches = window.location.href.match(/ua_token=([a-z0-9_-]+)/i);
    if (matches && matches.length == 2) {
        var token = matches[1];
        $.cookie("ua_session_token", token);
        reload();
    }

    matches = window.location.href.match(/email_token=([a-z0-9_-]+)/i);
    if (matches && matches.length == 2) {
        var token = matches[1];
        verify_email(token);
    }

    checkUser();
});

// Logout function
function logout() {
    $.removeCookie("ua_session_token");
    UserApp.User.logout(function() {
        onUserMissing();
    });
}


function signupuser() {
    // Show the loader

    // This will sign up the user
    UserApp.User.save({
        login: $('#email').val(),
        email: $('#email').val(),
        password: $('#password').val()
    }, function(error, user) {
        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Thanks for signing up! Please check mailbox for email confirmation instructions.");

            //reload();
        }

    });

    return false;
}

// Login the user
function login() {
    // This will authenticate the user
    UserApp.User.login({
        login: $('#email').val(),
        password: $('#password').val()
    }, function(error, result) {
        if (error) {
            // Wrong password maybe?
            alert("Error: " + error.message);
        } else {
            onLoginSuccessful();
        }
    });

    return false;
}

// When the user has been logged in successfully
function onLoginSuccessful() {
    // Now, save the token in a cookie
    $.cookie("ua_session_token", UserApp.global.token);

    // Redirect the user to the index page
    reload();
}


function signinorup(){
    if (window.signup){
        signupuser();
    } else {
        login();
    }
    window.signup = false;
    return false;
}


