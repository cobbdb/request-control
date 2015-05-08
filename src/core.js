var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    log = require('./log.js');

module.exports = function (opts) {
    var spyList = [];
    function invade(context) {
        var i, frame, len;
        context = context || global.self;
        len = context.frames.length;

        // Place spies.
        if (!context.rcThrottled) {
            context.rcThrottled = true;
            context.XMLHttpRequest = ajaxSpy({
                throttle: opts.throttle,
                context: context,
                id: frame.id
            });
            context.Image = imgSpy({
                throttle: opts.throttle,
                context: context,
                id: frame.id
            });
        }

        // Invade any iframes as well.
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i].frameElement;
                if (!frame.contentWindow.rcThrottled) {
                    spyList.push(frame.id);
                }
                invade(frame.contentWindow);
            } catch (err) {
                log('Denied access to', frame);
            }
        }
    }

    if (!global.rcThrottled) {
        global.setInterval(invade, 5000);
    }

    return spyList;
};
