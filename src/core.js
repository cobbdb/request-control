var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
    log = require('./log.js');

/**
 * @param {Number} [opts.throttle]
 */
module.exports = function (opts) {
    var spyList = [];
    opts = opts || {};
    function invade(context, id) {
        var i, frame, len;
        context = context || global.self;
        len = context.frames.length;

        // Place spies.
        context.XMLHttpRequest = ajaxSpy({
            throttle: opts.throttle || 1000,
            context: context,
            id: id || 'top'
        });
        context.Image = imgSpy({
            throttle: opts.throttle || 1000,
            context: context,
            id: id || 'top'
        });
        context.Element.prototype.appendChild = appendSpy({
            throttle: opts.throttle || 1000,
            context: context,
            id: id || 'top'
        });

        // Invade any iframes as well.
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i].frameElement;
                if (!frame.contentWindow.rcThrottled) {
                    spyList.push(frame.id);
                }
                invade(frame.contentWindow, frame.id);
            } catch (err) {
                log('Denied access to', frame);
            }
        }
    }

    if (!global.rcThrottled) {
        invade();
        global.setInterval(invade, 5000);
    }

    return spyList;
};
