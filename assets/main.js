function outputDat(m, fullM) {
    var d = new Date();
    var p = new Date(d.getTime() - m * 86400000);
    var monthA = (fullM === false) ? '01,02,03,04,05,06,07,08,09,10,11,12'.split(',') : 'января,февраля,марта,апреля,мая,июня,июля,августа,сентября,октября,ноября,декабря'.split(',');
    var w = p.getDate();
    var ret = (fullM === false) ? p.getDate() + '.' + monthA[p.getMonth()] + '.' + p.getFullYear() : p.getDate() + ' ' + monthA[p.getMonth()] + ' ' + p.getFullYear();
    return ret;
}

$(document).ready(function(){
    start_timer();
    var time = 1080;
    var intr;
    function start_timer() {
        intr = setInterval(tick, 1000);
    }


    function tick() {
        time = time-1;
        var mins = Math.floor(time/60);
        var secs = time - mins*60;
        if( mins == 0 && secs == 0 ) {
            clearInterval(intr);
        }
        mins = mins >= 10 ? mins : "0"+mins;
        secs = secs >= 10 ? secs : "0"+secs;
        $("#h_min").html(mins);
        $("#h_sec").html(secs);
    }
    //
    // $('.toform').click(function () {
    //     $("html, body").animate({scrollTop: $("#order_form").offset().top - 100}, 1000);
    //     return false;
    // });
})
