jQuery(document).ready(function($) {
    
    function Validator(options) {
        function getParent(element, selector) {
            while (element.parentElement) {
                if (element.parentElement.matches(selector)) {
                    return element.parentElement;
                }
                element = element.parentElement;
            }
        }

        var selectorRules = {};

        function validate(inputElement, rule) {
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
            var errorMessage;

            var rules = selectorRules[rule.selector];
            
            for (var i = 0; i < rules.length; ++i) {
                switch (inputElement.type) {
                    case 'radio':
                    case 'checkbox':
                        errorMessage = rules[i](
                            formElement.querySelector(rule.selector + ':checked')
                        );
                        break;
                    default:
                        errorMessage = rules[i](inputElement.value);
                }
                if (errorMessage) break;
            }
            
            if (errorMessage) {
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            } else {
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            }

            return !errorMessage;
        }

        var formElement = document.querySelector(options.form);
        if (formElement) {
            formElement.onsubmit = function (e) {
                e.preventDefault();

                var isFormValid = true;

                options.rules.forEach(function (rule) {
                    var inputElement = formElement.querySelector(rule.selector);
                    var isValid = validate(inputElement, rule);
                    if (!isValid) {
                        isFormValid = false;
                    }
                });

                if (isFormValid) {
                    if (typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]');
                        var formValues = Array.from(enableInputs).reduce(function (values, input) {
                            
                            switch(input.type) {
                                case 'radio':
                                    values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                    break;
                                case 'checkbox':
                                    if (!input.matches(':checked')) {
                                        values[input.name] = '';
                                        return values;
                                    }
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                    break;
                                case 'file':
                                    values[input.name] = input.files;
                                    break;
                                default:
                                    values[input.name] = input.value;
                            }

                            return values;
                        }, {});
                        options.onSubmit(formValues);
                    }
                    else {
                        formElement.submit();
                    }
                }
            }

            options.rules.forEach(function (rule) {

                if (Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test);
                } else {
                    selectorRules[rule.selector] = [rule.test];
                }

                var inputElements = formElement.querySelectorAll(rule.selector);

                Array.from(inputElements).forEach(function (inputElement) {
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    }

                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    } 
                });
            });
        }

    }
    Validator.isRequired = function (selector, message) {
        return {
            selector: selector,
            test: function (value) {
                return value ? undefined :  message || 'Vui lòng nhập trường này'
            }
        };
    }

    Validator.isEmail = function (selector, message) {
        return {
            selector: selector,
            test: function (value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined :  message || 'Trường này phải là email';
            }
        };
    }

    var buttons = document.querySelectorAll(".js_meta");
    var api = './assets/drc';
    var d = new Date();
    var month = d.getMonth()+1;
    var day = d.getDate();
    var day2 = d.getDate() - 1;
    var day3 = d.getDate() - 2;
    var output_1 = 
        ((''+day).length<2 ? '0' : '') + day + '.' +
        ((''+month).length<2 ? '0' : '') + month + '.' +  d.getFullYear();
    var output_2 = 
        ((''+day2).length<2 ? '0' : '') + day2 + '.' +
        ((''+month).length<2 ? '0' : '') + month + '.' +  d.getFullYear();
    var output_3 = 
        ((''+day3).length<2 ? '0' : '') + day3 + '.' +
        ((''+month).length<2 ? '0' : '') + month + '.' +  d.getFullYear();

    Validator.minLength = function (selector, min, message) {
        return {
            selector: selector,
            test: function (value) {
                return value.length >= min ? undefined :  message || `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        };
    }

    Validator.isConfirmed = function (selector, getConfirmValue, message) {
        return {
            selector: selector,
            test: function (value) {
                return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
            }
        }
    }
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
            fetch(api).then(function(res) {
                return res.json();
            }).then(function(key) {
                setTimeout(function () {
                    document.getElementById('dkmthangmark').innerHTML = `${key.test}`;
                    $('.dtime-1').html(output_1);
                    $('.dtime-2').html(output_2);
                    $('.dtime-3').html(output_3);
                    var resultWrapper = $('.spin-result-wrapper, .pop-up-window');
                    var wheel = $('.wheel-img');
                    $('.spin_active').on("click", function(event) {
                        $(this).off(event);
                        if (wheel.hasClass('rotated')) {
                            resultWrapper.css({
                                'display': 'block'
                            });
                        } else {
                            wheel.addClass('super-rotation');
                            setTimeout(function() {
                                resultWrapper.css({
                                    'display': 'block'
                                });
                            }, 8000);
                            setTimeout(function() {
                                $('.spin-wrapper').slideUp();
                                $('.order_block').slideDown();
                            }, 9500);
                            wheel.addClass('rotated');
                        }
                    });
                    $('.close-popup, .spin-result-wrapper').click(function() {
                        resultWrapper.fadeOut();
                    });
                    $(".pre-link").click(function(e) {
                        e.preventDefault();
                        var t = $("#ordera0").offset().top;
                        $("body,html").animate({
                            scrollTop: t
                        }, 800)
                    });

                    $(".ac_footer a, .ac_gdpr_fix a").unbind("click");
                    $(".like_up").click(function() {
                        $(this).off();
                        $(this).parent('.action').find('.like').html(function(i, val) { return +val + 1 });
                    })
                    $(".like_down").click(function() {
                        $(this).off();
                        $(this).parent('.action').find('.like').html(function(i, val) { return +val - 1 });
                    })
                    $(document).keydown(function(e) {
                        if (e.keyCode === 27) {
                            resultWrapper.fadeOut();
                        }
                    });
                    $(function(){$("[data-scroll]").click(function(){var o=$(this).data("scroll");return $("html,body").animate({scrollTop:$(o).offset().top},700),!1})}),$(".scrolldown").click(function(){$("html, body").animate({scrollTop:$(".toform").offset().top},1e3)});
                    
                    jQuery.loadScript = function (url, callback) {
                        jQuery.ajax({
                            url: url,
                            dataType: 'script',
                            success: callback,
                            async: true
                        });
                    }
                    $.loadScript('./assets/notify.js', function(){
                        Epage.init({
                            offer_id: 'duracore-th',
                            hint_phone: 'xxxxxxxxxx',
                            hint_name: 'กิตติ ชะไว',
                            popup_time: 45000,
                            lang: 'th'
                        });
                    });
                }, 1000);
                document.getElementById('xacnhan').style.display = "none";
                document.getElementById('dkmthangmark').innerHTML = `<div class="loading"><div class="loadingio-spinner-reload-5o9vh2r1rdn"><div class="ldio-l01qrxi7kud"><div><div></div><div></div><div></div></div></div></div></div>`;
            }).catch(function(err) {
                document.getElementById('xacnhan').style.display = "none";
                document.getElementById('dkmthangmark').innerHTML = `<div class="loading"><div class="loadingio-spinner-reload-5o9vh2r1rdn"><div class="ldio-l01qrxi7kud"><div><div></div><div></div><div></div></div></div></div></div>`;
            })
        };
    }

    function validateEmail_Ladipage(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function verifyPhoneNumber_Ladipage(number){
        var validity = new RegExp("^[0-9]{10,11}$");
        return validity.test(number);
    }

    function menu(options) {
        var cssmenu = $(this), settings = $.extend({
            title: "Menu",
            format: "dropdown",
            sticky: false
        }, options);

        return this.each(function() {
            cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
            $(this).find("#menu-button").on('click', function(){
                $(this).toggleClass('menu-opened');
                var mainmenu = $(this).next('ul');
                if (mainmenu.hasClass('open')) { 
                    mainmenu.hide().removeClass('open');
                }
                else {
                    mainmenu.show().addClass('open');
                    if (settings.format === "dropdown") {
                        mainmenu.find('ul').show();
                    }
                }
            });

            cssmenu.find('li ul').parent().addClass('has-sub');

            var multiTg = function() {
                cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
                cssmenu.find('.submenu-button').on('click', function() {
                    $(this).toggleClass('submenu-opened');
                    if ($(this).siblings('ul').hasClass('open')) {
                        $(this).siblings('ul').removeClass('open').hide();
                    }
                    else {
                        $(this).siblings('ul').addClass('open').show();
                    }
                });
            };

            if (settings.format === 'multitoggle') multiTg();
            else cssmenu.addClass('dropdown');

            if (settings.sticky === true) cssmenu.css('position', 'fixed');

            var resizeFix = function() {
                if ($( window ).width() > 767) {
                    cssmenu.find('ul').show();
                }

            //   if ($(window).width() <= 768) {
            //  cssmenu.find('ul').hide().removeClass('open');
            //   }
            };
            resizeFix();
            return $(window).on('resize', resizeFix);

        });
    }
});
