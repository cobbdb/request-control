var throttle = 5;

function makeAjax(frameWindow, id) {
    var oldajax = frameWindow.XMLHttpRequest;
    frameWindow.isAjaxThrottled = true;
    frameWindow.ajaxReqs = {
        rps: {
            attempted: 0,
            made: 0
        },
        net: {
            attempted: 0,
            made: 0
        },
        allowance: 0
    };
    setInterval(function () {
        var made = frameWindow.ajaxReqs.rps.made,
            attempted = frameWindow.ajaxReqs.rps.attempted;
        if (attempted > 0) {
            console.log(
                '\t<<<AJAX>>>',
                'requests/second',
                id,
                '(made/attempted)',
                Math.floor(made),
                Math.floor(attempted),
                Math.round(made / attempted * 100) + '%'
            );
        }
        frameWindow.ajaxReqs.rps.made = 0;
        frameWindow.ajaxReqs.rps.attempted = 0;
    }, 1000);
    setInterval(function () {
        var made = frameWindow.ajaxReqs.net.made,
            attempted = frameWindow.ajaxReqs.net.attempted;
        if (attempted > 0) {
            console.log(
                '\t\t<<<AJAX>>>',
                'net requests',
                id,
                '(made/attempted)',
                Math.floor(made),
                Math.floor(attempted),
                (attempted === 0) ? '0%' : Math.round(made / attempted * 100) + '%'
            );
        }
    }, 10000);
    return function (args) {
        var req, oldsend;
        frameWindow.ajaxReqs.allowance += 1;
        frameWindow.ajaxReqs.rps.attempted += 1;
        frameWindow.ajaxReqs.net.attempted += 1;
        req = new oldajax(args);
        oldsend = req.send;
        req.send = function () {
            var now;
            if (frameWindow.ajaxReqs.allowance < throttle) {
                frameWindow.timeOfLastRequest = Date.now();
                oldsend.apply(req, arguments);
                frameWindow.ajaxReqs.rps.made += 1;
                frameWindow.ajaxReqs.net.made += 1;
            } else {
                console.log('>>> <Ajax> request blocked!', id);
                now = Date.now();
                if (now - frameWindow.timeOfLastRequest > 1000) {
                    console.log('*** Resetting req count', id);
                    frameWindow.ajaxReqs.allowance = 0;
                }
            }
        };
        req.addEventListener('load', function () {
            frameWindow.ajaxReqs[req.status] = frameWindow.ajaxReqs[req.status] || 0;
            frameWindow.ajaxReqs[req.status] += 1;
        }, false);
        return req;
    };
}

var spyList = spyList || [];
function AjaxSpy(parentWindow) {
    var i, frame, len;
    parentWindow = parentWindow || self;
    len = parentWindow.frames.length;
    for (i = 0; i < len; i += 1) {
        try {
            frame = parentWindow.frames[i].frameElement;
            if (!frame.contentWindow.isAjaxThrottled) {
                frame.contentWindow.XMLHttpRequest = makeAjax(frame.contentWindow, frame.id);
                spyList.push(frame.id);
            }
            AjaxSpy(frame.contentWindow);
        } catch (err) {}
    }
}
AjaxSpy();
