var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
    createSpy = require('./create-spy.js'),
    RequestGate = require('./request-gate.js'),
    log = require('./log.js'),
    hash;

/**
 * ## RequestControl([opts])
 * Starts the system.
 * @param {Number} [opts.grace] Defaults to 50. Number of requests to ignore
 * before activating the request throttle.
 * @param {Number} [opts.throttle] Defaults to 800. Minimum time in
 * milliseconds between successive requests. Only applies after grace period.
 * Falsy to run the system but disable all request throttling.
 * @param {Boolean} [opts.top] Defaults to false. True to throttle the top
 * window as well as iframes.
 * @param {Boolean} [opts.log] Defaults to false. True to enable system logging.
 * @return {Function} Callable to stop the system.
 */
module.exports = function (opts) {
    opts = opts || {};
    opts.grace = ('grace' in opts) ? opts.grace : 100;
    opts.throttle = ('throttle' in opts) ? opts.throttle : 800;
    opts.top = opts.top || false;
    opts.log = opts.log || false;

    // Check to disable request throttling.
    if (!opts.throttle) {
        RequestGate.disable();
    }

    // Enable logging from start.
    if (opts.log) {
        log.enable();
    }

    function invade(context, id) {
        var i, frame, len, spyConf;
        context = context || global.self;

        // Enable logging during runtime.
        if (global.top.rcDebug) {
            log.enable();
        }

        spyConf = {
            context: context,
            id: id || 'top',
            grace: opts.grace,
            throttle: opts.throttle
        };

        // Place spies. Don't place spies on top Window by default.
        if (id || (!id && opts.top)) {
            context.XMLHttpRequest = ajaxSpy(spyConf);
            context.Image = imgSpy(spyConf);
            context.document.createElement = createSpy(spyConf);
            context.Element.prototype.appendChild = appendSpy(spyConf);
        }

        // Invade any iframes as well.
        len = context.frames.length;
        for (i = 0; i < len; i += 1) {
            // Fails on same-origin policy violations.
            try {
                frame = context.frames[i];
                invade(frame, frame.frameElement.id);
            } catch (err) {}
        }
    }

    // Run and reapply every 10sec to catch new frames.
    if (!hash) {
        invade();
        hash = global.setInterval(invade, 500);
    }

    /**
     * ## halt()
     * Stops RequestControl from invading new frames.
     */
    return function () {
        // Stop the heartbeat.
        global.clearInterval(hash);
    };
};

/**
 * ## RequestControl.log
 * Expose the system logger.
 * @type {Function} Instance of Lumberjack.
 * @see [Lumberjack Github](https://github.com/cobbdb/lumberjack)
 */
module.exports.log = log;
