(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['EpageX'], function(EpageX) {
            return (root.Epage = factory(EpageX));
        });
    } else {
        root.Epage = factory(root.EpageX);
    }
}(this, function(EpageX) {
    var _opt = {
        lang: 'vi',
        hint_name: 'Le Ngoc Minh',
        hint_phone: '0912345678',
        popup: true,
        set_input_js: true,
        pre: true,
        popup_time: 30000,
        debug: false
    };
    var sentPhoneList = {};

    function setOpt(name, value) {
        _opt[name] = value;
    }

    function setOpts(opts) {
        for (var o in opts) {
            setOpt(o, opts[o]);
        }
    }
    $.fn.inputFilter = function(inputFilter) {
        return this.on("input keydown keyup", function() {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };

    function valName() {
        $('input[name="name"]').inputFilter(function(value) {
            if (_opt.lang === 'vi') return /^[^0-9!`~@#$%^&*()_+-={}:""'';<>?,./|\\[\]]{0,255}$/.test(value);
            return /^[^0-9]{0,255}$/.test(value);
        });
        $('input[name="name"]').keyup(function(ev) {
            sentPhoneList['name'] = ev.target.value;
        });
        $('input[name="name"]').on('touchend, click', function() {
            if (_opt.hint_name != '') {
                show_form_hint(this, _opt.hint_name);
                return false;
            }
        });
    }

    function valPhone() {
        $('input[name="phone"]').inputFilter(function(value) {
            if (_opt.lang === 'vi') return /^[0-9]{0,12}$/.test(value);
            return /^[0-9]{0,11}$/.test(value);
        });
        $('input[name="phone"]').keyup(function(ev) {
            if (ev.target.value.length === 12 && _opt.lang === 'vi') createPhone(ev.target.value)
        });
        $('input[name="phone"]').on('touchend, click', function() {
            if (_opt.hint_phone != '') {
                show_form_hint(this, _opt.hint_phone);
                return false;
            }
        });
    }

    function valAddress() {
        $('textarea[name="address"], input[name="address"]').on('touchend, click', function() {
            if (_opt.hint_phone != '') {
                return false;
            }
        });
    }

    function getParam(name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(window.location.href);
        if (!results) return '';
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function show_form_hint(elem, msg) {
        $('.js_errorMessage').remove();
        $(`<div class="js_errorMessage">${msg}</div>`).appendTo('body').css({
            'left': $(elem).offset().left,
            'top': $(elem).offset().top - 28,
            'background-color': '#e74c3c',
            'border': '0.5px dashed black',
            'border-radius': '3px',
            'color': '#fff',
            'font-size': '14px',
            'padding': '3px 7px 3px 7px',
            'position': 'absolute',
            'z-index': '9999'
        });
        $(elem).focus();
    }

    function createPhone(phone) {
        var click_id = getParam('click_id');
        var data = {
            source_domain: window.location.hostname,
            customer_phone: phone,
            click_id: click_id,
            offer_id: _opt.offer_id
        }
        if (!click_id) {
            data.pixel_tracking = 1;
        }
        if (getParam('backFromPre')) {
            data.back_from_pre = 1;
        }
        $.ajax({
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: _opt.pre_url,
            method: 'GET',
            data: data,
            async: false,
            success: function(res) {
                sentPhoneList['id'] = res.data._id;
                if (sentPhoneList['name']) {
                    updateName(sentPhoneList['name'], phone);
                }
            }
        });
    }

    function updateName(name, phone) {
        $.ajax({
            contentType: "application/json",
            url: _opt.pre_url + '?id=' + sentPhoneList['id'],
            method: 'PUT',
            data: JSON.stringify({
                name: name
            })
        });
    }

    function updateSubmit(form) {
        $('.js_submit').attr("style","display:none;");
        $('.js_submit').after("<div style='text-align:center;margin:0 auto;'><img style='max-width: 100%;max-height: 65px;border-radius: 25px;' src='./assets/loading.gif'></div>");
        
        var name = form.find('input[name="name"]');
        var phone = form.find('input[name="phone"]');
        var url = 'https://api.rentracksw.com/lead/create?site_id=8936&advertiser_id=181&product_id=70696&token=qhy1b6LMDE5YmM1NjY3N2ZlOGM1YjA2NzBiNzY5ZDNhMjNm' + '&name=' + `${name.val()}` + '&phone=' + `${phone.val()}`;
        const toSend = {
            name: `${name.val()}`,
            phone: `${phone.val()}`
        }
        const jsonString = JSON.stringify(toSend);
        $.ajax({
            url: url,
            type: 'POST',
            data: {jsonString},
             success: function (response) {},
             error: function (error) {}
         });
        var submit_form = document.getElementById('sheetdb-form');
        fetch(submit_form.action, {
            method : "POST",
            body: new FormData(document.getElementById("sheetdb-form")),
        }).then(
            response => response.json()
        ).then((html) => {
            window.location.href = './thankyou.html?fb_pixel_id=600493857630184,932767647301597,672084573820817';
        });
        
    }

    function checkForm(ev) {
        var locale = {
            vi: {
                n_r: "Bạn chưa điền họ tên",
                p_r: "Bạn chưa điền số điện thoại",
                a_r: "Bạn chưa điền địa chỉ",
                n_e: "Tên không hợp lệ",
                p_e: "Số điện thoại không hợp lệ",
                a_e: "Độ dài của địa chỉ không được vượt quá 255 ký tự",
                u_ex: "Bạn có chắc muốn rời đi không? Chỉ còn còn một bước đặt hàng nữa thôi!"
            },
            th: {
                n_r: "ชื่อเป็นฟิลด์บังคับ",
                a_r: "ที่อยู่เป็นฟิลด์บังคับ",
                p_r: "หมายเลขโทรศัพท์เป็นฟิลด์บังคับ",
                n_e: "ที่อยู่เป็นฟิลด์บังคับ",
                p_e: "หมายเลขโทรศัพท์ไม่ถูกต้อง",
                a_e: "ความยาวของที่อยู่จะต้องไม่เกิน 255 ตัวอักษร",
                u_ex: "คุณต้องการปิดแท็บหรือไม่!"
            },
            id: {
                n_r: "Name is a required field",
                p_r: "Phone number is a required field",
                a_r: "Address is a required field",
                n_e: "The name is entered incorrectly",
                p_e: "The phone number is entered incorrectly",
                a_e: "The length of the address cannot exceed 255 characters",
                u_ex: "You really want to close tab?"
            },
            ph: {
                n_r: "Name is a required field",
                p_r: "Phone number is a required field",
                a_r: "Address is a required field",
                n_e: "The name is entered incorrectly",
                p_e: "The phone number is entered incorrectly",
                a_e: "The length of the address cannot exceed 255 characters",
                u_ex: "You really want to close tab?"
            },
            sa: {
                n_r: "Name is a required field",
                p_r: "Phone number is a required field",
                a_r: "Address is a required field",
                n_e: "The name is entered incorrectly",
                p_e: "The phone number is entered incorrectly",
                a_e: "The length of the address cannot exceed 255 characters",
                u_ex: "You really want to close tab?"
            },
        }
        var form = $(ev.target).parents('form').first();
        var name = form.find('input[name="name"]');
        var phone = form.find('input[name="phone"]');
        var address = form.find('textarea[name="address"], select[name="address"], input[name="address"]');
        var rephone = /^(84|0[9|8|7|5|3])+([0-9]{8})$/;
        if (!phone.val().trim() || phone.val().trim().length < 10) {
            show_form_hint(phone, locale[_opt.lang]['p_r']);
            return ev.preventDefault();
        } else
        if (!rephone.test(phone.val().trim()) && _opt.lang === 'vi') {
            show_form_hint(phone, locale[_opt.lang]['p_e']);
            return ev.preventDefault();
        }
        if (!name.val().trim()) {
            show_form_hint(name, locale[_opt.lang]['n_r']);
            return ev.preventDefault();
        }
        // if (!address.val().trim() && _opt.lang == 'th') {
        //     show_form_hint(address, locale[_opt.lang]['a_r']);
        //     return ev.preventDefault();
        // }
        // if (!address.val().trim() && _opt.lang == 'id') {
        //     show_form_hint(address, locale[_opt.lang]['a_r']);
        //     return ev.preventDefault();
        // }
        updateSubmit(form);
        return ev.preventDefault();
    }

    function showPopup() {
        if (_opt.popup) {
            setTimeout(function() {
                $(".cookie-popup-wrap").fadeIn(600);
            }, _opt.popup_time);
            $('#closepopup').click(function(e) {
                e.preventDefault();
                $(".cookie-popup-wrap").fadeOut(200);
            });
            $('html').click(function(e) {
                var a = e.target;
                if ($(a).parents(".cookie-popup-wrap").length === 0) {
                    $(".cookie-popup-wrap").fadeOut(600);
                }
            });
        }
    }

    function cityProvince(name, lang) {
        var places = {
            vi: ['Hà Nội', 'Nghệ An', 'Hồ Chí Minh', 'Vũng Tàu', 'Nha Trang', 'Cà Mau', 'Hà Giang', 'Hải Phòng', 'Quảng Ninh', 'Thanh Hóa', 'Ninh Bình'],
            th: ['กทม.', 'จ.ระยอง', 'จ.พระนครศรีอยุธยา', 'จ.ระนอง', 'กทม', 'จ.ลำปาง', 'จ.แม่ฮ่องสอน', 'จ.น่าน', 'จ.ขอนแก่น', 'จ.เชียงราย'],
            id: ['Surabaya', 'Bandung', 'Bekasi', 'Medan', 'Tangerang', 'Depok', 'Semarang', 'Palembang', 'Makassar', 'Bogor', 'Batam'],
            ph: ['Manila', 'Caloocan', 'Taguig', 'Antipolo', 'Pasig', 'Cagayan de Oro', 'Parañaque', 'Dasmariñas', 'Bacoor', 'Makati', 'Bacolod'],
            sa: ['Abha', 'Tabuk', 'Taif', 'Khamis Mushayt', 'Buraydah', 'Najran', 'Yanbu', 'Sakakah', 'Sharurah', 'Gurayat', 'Unaizah']
        }
        var mins = `(${Math.round(Math.random()*2+1)} นาทีที่ผ่านมา)`;
        var place = places[lang][Math.floor(Math.random() * places[lang].length)];
        var currentNumber = Math.floor(Math.random() * (72 - 20 + 1)) + 20;
        var currentView = currentNumber + (Math.floor(Math.random() * (5 - 1 + 1)) + 1) * (Math.random() > 0.3 ? 1 : -1);
        var locale = {
            vi: {
                u_access: `<p id="proofcontent" style="min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;">Có <span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentNumber} khách truy cập</span> đang xem trang.</p>`,
                u_order: `Một khách hàng từ <span style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${place} </span> vừa đặt hàng thành công!`,
                u_view: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people"  style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentView} người</span> đang xem trang.</p>`
            },
            th: {
                u_access: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.4;margin-top: unset;margin-bottom: unset;">มีลูกค้า <span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentNumber} คนกําลังดู</span>เว็บไซต์อยู่</p>`,
                u_order: `ขอบคุณท่านลูกค้าอยู่ที่ <span style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${place} </span> ได้ทำการสั่งซื้อ ${mins}`,
                u_view: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.4;margin-top: unset;margin-bottom: unset;">มีลูกค้า <span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentView} คนกําลังดู</span>เว็บไซต์อยู่</p>`
            },
            id: {
                u_access: `<p id="proofcontent" style="min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;">There are  ${currentNumber} </span>  visitors viewing page.</p>`,
                u_order: `A customer from <span style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${place} </span> has just placed a successful order!`,
                u_view: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people"  style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentView} people</span> are viewing the page.</p>`
            },
            ph: {
                u_access: `<p id="proofcontent" style="min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;">There are  ${currentNumber} </span>  visitors viewing page.</p>`,
                u_order: `A customer from <span style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${place} </span> has just placed a successful order!`,
                u_view: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people"  style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentView} people</span> are viewing the page.</p>`
            },
            sa: {
                u_access: `<p id="proofcontent" style="min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people" style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;">There are  ${currentNumber} </span>  visitors viewing page.</p>`,
                u_order: `A customer from <span style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${place} </span> has just placed a successful order!`,
                u_view: `<p id="proofcontent" style="width: 235px;min-height: 41px;line-height: 1.25;margin-top: unset;margin-bottom: unset;"><span id="people"  style="color:#F44336;display: inline-block;background-color:#FFEBEE;border-radius: 5px;padding: 0.5px 1.5px;"> ${currentView} people</span> are viewing the page.</p>`
            },
        }
        return locale[lang][name];
    }

    function valProof() {
        var proofWrapper = $('<div id="scpf" style="position: fixed;left: 15px;background-color: #fff;bottom: 5px;z-index: 9999;display: flex;min-height: 65px;display: -ms-flexbox;border-radius: 25px;box-shadow:  0px 0px 5px 0px #ccc;transition: all 2s ease 0s;"></div>');
        var proofLeft = $('<div></div>');
        var proofRight = $('<div style="color: #000;width: 245px;font-size: 15.5px;padding-left: 1.5px;-ms-flex-item-align: center;align-self: center;max-height: 65px;"></div>');

        function proof() {
            var halogen = $('<img style="max-width: 100%;max-height: 65px;border-radius: 25px;" src="./assets/spiner.gif" />')
            var text = cityProvince('u_access', _opt.lang);
            $(proofLeft).append(halogen);
            $(proofRight).append(text);
            $(proofWrapper).append(proofLeft);
            $(proofWrapper).append(proofRight);
            $('body').append(proofWrapper);

            function loopThis() {
                var delay = Math.floor(Math.random() * (20000 - 15000 + 1)) + 15000;
                setTimeout(function() {
                    $('#proofcontent').html(`${cityProvince('u_order',_opt.lang)}`);
                    $('#scpf').css("bottom", "8px");
                    setTimeout(function() {
                        $(proofRight).fadeOut("slow", function() {
                            $('#proofcontent').html(`${cityProvince('u_view',_opt.lang)}`)
                            $(proofRight).fadeIn("slow", function() {
                                setTimeout(function() {
                                    $('#scpf').css('bottom', '-80px');
                                }, 3000);
                                loopThis();
                            });
                        });
                    }, 4000);
                }, delay);
            }
            setTimeout(function() {
                $('#scpf').css("bottom", "-80px");
                loopThis();
            }, 3000);
        }
        proof();
    }

    function _init(opts) {
        setOpts(opts);
        showPopup();
        valName();
        valPhone();
        //valAddress()
        valProof();
        $("body").on('touchend, click', function() {
            $('.' + _opt.error_class).remove();
        });
        $('.js_submit').click(function(ev) {
            var d = new Date();
            var month = d.getMonth()+1;
            var day = d.getDate();
            var output = 
                ((''+day).length<2 ? '0' : '') + day + '/' +
                ((''+month).length<2 ? '0' : '') + month + '/' + 
                d.getFullYear() + ' ' + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();;
            $('#click_time').attr('value',`${output}`);

            checkForm(ev);
            
        });
    }
    return {
        init: _init
    };
}));
