var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
    log = require('./log.js'),
    hash;

/**
 * @param {Number} [opts.throttle]
 */
module.exports = function (opts) {
    opts = opts || {};
    function invade(context, id) {
        var i, frame, len;
        context = context || global.self;

        opts.context = context;
        opts.id = id || 'top';

        // Place spies.
        context.XMLHttpRequest = ajaxSpy(opts);
        context.Image = imgSpy(opts);
        context.Element.prototype.appendChild = appendSpy(opts);

        // Invade any iframes as well.
        len = context.frames.length;
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i].frameElement;
                invade(frame.contentWindow, frame.id);
            } catch (err) {
                log('Denied access to', frame, err);
            }
        }
    }

    // Run and reapply every 10sec to catch new frames.
    if (!hash) {
        invade();
        hash = global.setInterval(invade, 10000);
    }
};
