(function($){
    'use strict'

    var resBreakpoint = 992,
        intercomAppId = 'ir6mnqpn';

    /**
     * Forms validation
     **/

    $.validator.addMethod('emailRegex', function (value, element) {
        return this.optional(element) || /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/igm.test(value);
    });

    var Validation = {
        init: function (config) {
            this.config = config;
            this.bindEvents();
        },

        bindEvents: function () {
            this.validate(this.config.form);
            this.enableButton(this.config.form, this.config.field, this.config.btn);
        },

        validate: function (form) {
            $.validator.methods.emailRegex = function (value, element) {
                return this.optional(element) || /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/igm.test(value);
            };
            $(form).validate({
                rules: {
                    EMAIL: {
                        emailRegex: true,
                        required: true
                    }
                },
                messages: {
                    EMAIL: {
                        emailRegex: 'Please enter a valid email address.'
                    }
                },
                submitHandler: function (form) {
                    $(form).submit();
                }
            });
        },

        enableButton: function (form, field, btn) {
            field.on('blur keyup', function () {
                if (form.valid()) {
                    btn.prop('disabled', false);
                } else {
                    btn.prop('disabled', true);
                }
            })
        }
    };


    /**
     * Mobile menu
     **/

    var MobileMenu = {
        init: function (config) {
            var self = this;
            this.config = config;
            this.bindEvents();
            this.footerBar = this.config.footerBar.clone();

            if (window.innerWidth < resBreakpoint) {
                self.config.navbar.hide();
                $(window).on('orientationchange', function () {
                    self.hideMenu()
                });
            }

            $(window).on('resize', function () {
                $('body').removeClass(self.config.classToBodyAdd);
                if (window.innerWidth < resBreakpoint) {
                    self.config.navbar.hide();
                } else {
                    self.config.navbar.show();
                }
            });
        },


        bindEvents: function () {
            var self = this,
                $body = $('body');

            self.config.menuBtn.on('click', this.processMenu);
            self.config.navItem.on('click', function () {
                if ($body.hasClass(self.config.classToBodyAdd)) {
                    $('#headerNav').slideUp();
                    $body.removeClass(self.config.classToBodyAdd)
                }
            });
        },

        processMenu: function () {
            var self = MobileMenu;
            $('body').hasClass(self.config.classToBodyAdd)
                ? self.hideMenu()
                : self.showMenu();
        },

        hideMenu: function () {
            $('body').removeClass(this.config.classToBodyAdd);
            this.config.navbar.slideUp();
        },

        showMenu: function () {
            $('body').addClass(this.config.classToBodyAdd);
            this.config.navbar.append(this.footerBar).slideDown();
        }
    };

    /**
     * Detail page tabs
     **/

    var Tabs = {
        init: function (config) {
            this.config = config;
            this.processTabs();
            this.hideTabs();
        },

        processTabs: function () {
            var self = Tabs;

            this.config.tabs.find(this.config.tab).each(function (index, elem) {
                $(elem).on('click', self.config.tabBtn, function () {
                    if($(this).hasClass('open')){
                        $(this).removeClass('open');
                        $(elem).find(self.config.tabContent).slideUp();
                    } else {
                        $(this).addClass('open');
                        $(elem).find(self.config.tabContent).slideDown();
                    }
                });
            })
        },

        hideTabs: function () {
            this.config.tabs.find(this.config.tabContent).hide();
        }
    };

    /**
     * Copy to clipboard
     **/

    var Copy = {
        init: function (config) {
            this.config = config;
            this.bindEvents();
        },

        bindEvents: function () {
            var self = Copy;

            this.config.panel.each(function (index, elem) {
                $(elem).on('click', self.config.copyBtn, function () {
                    var code = $(elem).find(Copy.config.textToCopy),
                        tabHeading = $(elem).find(self.config.copiedName).text();
                    self.copyToClipboard(code);
                    self.showMsg(tabHeading);
                });
            });
        },

        copyToClipboard: function(element) {
            var temp = $("<textarea>");
            $('body').append(temp);
            temp.val($(element).text());

            if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                var el = temp.get(0);
                var editable = el.contentEditable;
                var readOnly = el.readOnly;
                el.contentEditable = true;
                el.readOnly = false;
                var range = document.createRange();
                range.selectNodeContents(el);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                el.setSelectionRange(0, 999999);
                el.contentEditable = editable;
                el.readOnly = readOnly;
            } else {
                temp.val($(element).text()).select();
            }
            document.execCommand('copy');
            temp.blur();
            temp.remove();
        },

        showMsg: function (text) {
            this.config.copyMsg.text(text + 'copied').addClass('copied');
            setTimeout(function () {
                Copy.config.copyMsg.text('').removeClass('copied');
            }, 2000)
        }
    };

    /**
     * Authorization
     **/

    var Authorization = {
        init: function (config) {
            this.config = config;
            this.checkUser();
        },

        clearCookies: function () {
            Cookies.remove('connect.sid', 'intercom-id-' + intercomAppId);
            window.location = "/logout";
            Intercom('shutdown');
        },

        getCurrentUser: function () {
            this.config.signIn.hide();
            this.config.detailPage.show();

            this.loadContent();
        },

        checkUser: function(){
            var isAuthenticated = Cookies.get("connect.sid");

            if (isAuthenticated) {
                this.getCurrentUser();
            } else {
                this.userIsMissing();
            }
        },

        loadContent: function () {
            var self = this;

            this.config.loader.show();

            $.get( 'info' , function( data ) {
                self.config.detailPage.html(data);
            }).done(function () {
                self.config.loader.hide();
                $(self.config.logoutBtn).on('click', self.clearCookies);

                Copy.init({
                    panel: $('.hasCopy'),
                    copyBtn: '.copyBtn',
                    copyMsg: $('#copyMsg'),
                    textToCopy: '.code',
                    copiedName: '.copy__heading'
                });

                Tabs.init({
                    tabs: $('#detailsTabs'),
                    tab: '.details__tab',
                    tabBtn: '.tab__btn',
                    tabContent: '.tab__content'
                });

                $('.track-link').on('click', function (event) {
                    handleOutboundLinkClicks(event, 'info');
                });

            }).fail(function (res) {
                self.config.loader.hide();
                self.config.relogin.show();
                $(self.config.logoutBtn).on('click', self.clearCookies);

                res.status < 404
                    ? self.config.keyExpiredMsg.show()
                    : self.config.serverErrorMsg.show();
            })
        },

        userIsMissing: function () {
            this.config.signIn.show();
            this.config.detailPage.hide();
            $('.mobile__logout').hide();
        }
    };

    /**
     * Subscribe
     */

    function subscribeForNews(form) {
        $('#footer-email').on('blur, keyup', function () {
            $('span#mailchimp-error').text('');
        });

        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize(),
            cache: false,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            error: function (err) {
                alert('Oops, something went wrong!');
            },
            success: function (data) {
                if($('#footer-email').val() !== ''){
                    if (data.result !== 'success') {
                        if(data.msg.indexOf('is already subscribed') !== -1){
                            $('span#mailchimp-error').text('This email address is already subscribed to the News Digest');
                        } else {
                            $('span#mailchimp-error').text(data.msg);
                        }
                        $('#footerSubscribeBtn').prop('disabled', true)
                    } else {
                        $('#footer-email').val('');
                        $('#subscribedMsg').fadeIn(200);
                        setTimeout(function () {
                            $('#subscribedMsg').fadeOut(200);
                        }, 2000)
                    }
                }
            }
        });
        return false;
    }

    /**
     *  track users clicks
     */

    function handleOutboundLinkClicks(event, page) {
        ga('send', 'event', {
            eventCategory: 'Outbound Link PG',
            eventAction: 'click',
            eventLabel: page ? 'Link to ' + event.currentTarget.innerText : event.currentTarget.href,
            transport: 'beacon'
        });
    }

    /**
     * Init
     **/

    $(function () {

        var header = $(".header");

        $(window).scrollTop() > 100 ? header.addClass('bg-header') : header.removeClass('bg-header');

        $(window).on('scroll', function () {
            $(window).scrollTop() > 100 ? header.addClass('bg-header') : header.removeClass('bg-header');
        });

        $('.intercomBtn').on('click', function () {
            event.preventDefault();
            Intercom('show');
        });

        var $footerForm = $('#footerEmailForm');

        if ($footerForm.length > 0) {
            $($footerForm.find('input[type="submit"]')).bind('click', function (event) {
                if (event) event.preventDefault();
                subscribeForNews($footerForm);
            })
        }

        $('.track-link').on('click', function (event) {
            handleOutboundLinkClicks(event);
        });

        Authorization.init({
            logoutBtn: '.logout-btn',
            loader: $('.loading'),
            signIn: $('#sign-in'),
            detailPage: $('#playground-detail'),
            keyExpiredMsg: $('#key-expired'),
            serverErrorMsg: $('#server-error'),
            relogin: $('#playground-relogin')
        });


        MobileMenu.init({
            footerBar: $('#footerLinks'),
            menuBtn: $('#mobileBtn'),
            classToBodyAdd: 'mobile-menu-visible',
            navbar: $('#headerNav'),
            navItem: $('.nav__item')
        });

        Validation.init({
            form: $('#footerEmailForm'),
            btn: $('#footerSubscribeBtn'),
            field: $('#footer-email')
        });

    });

})(jQuery);
