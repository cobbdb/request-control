var throttle = 5;

function makeAjax(frameWindow, id) {
    var oldajax = frameWindow.XMLHttpRequest;
    frameWindow.isThrottled = true;
    frameWindow.reqCnt = {
        net: 0
    };
    return function (args) {
        var req, oldsend,
            timeOfLastRequest = Date.now();
        frameWindow.reqCnt.net += 1;
        req = new oldajax(args);
        oldsend = req.send;
        req.send = function () {
            var now;
            console.log('*** last time was:', timeOfLastRequest);
            if (frameWindow.reqCnt.net < throttle) {
                oldsend.apply(req, arguments);
                timeOfLastRequest = Date.now();
            } else {
                console.log('>>> Ajax request blocked!');
                now = Date.now();
                if (now - timeOfLastRequest > 1000) {
                    console.log('*** Resetting req count');
                    frameWindow.reqCnt.net = 0;
                }
            }
        };
        req.addEventListener('load', function () {
            frameWindow.reqCnt[req.status] = frameWindow.reqCnt[req.status] || 0;
            frameWindow.reqCnt[req.status] += 1;
        }, false);
        return req;
    };
}

function AjaxSpy() {
    var i, frameWindow,
        len = frames.length;
    for (i = 0; i < len; i += 1) {
        frameWindow = frames[i].frameElement.contentWindow;
        frameWindow.XMLHttpRequest = makeAjax(frameWindow, frames[i].frameElement.id);
    }
}
