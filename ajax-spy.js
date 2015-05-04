var reqCnt = {
        net: 0
    },
    lowpass = 5;

function AjaxSpy(id) {
    var frame = document.getElementById(id),
        oldajax = frame.contentWindow.XMLHttpRequest;
    frame.contentWindow.XMLHttpRequest = function (args) {
        console.log(
            '<AjaxSpy> Spying on XMLHttpRequest object of: ',
            id
        );
        reqCnt.net += 1;
        var req = new oldajax(args);
        req.addEventListener('load', function (event) {
            reqCnt[req.status] = reqCnt[req.status] || 0;
            reqCnt[req.status] += 1;
        }, false);
        return req;
    };
}

setInterval(function () {
    if (reqCnt.net > lowpass) {
        console.log(
            '<AjaxSpy> !!!! reqs/sec is too high !!!!',
            reqCnt.net
        );
    }
    reqCnt.net = 0;
}, 1000);
