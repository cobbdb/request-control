/**
 * # Request Control
 * ### ***Throttle aggressive 3rd party http requests***
 */

var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
    log = require('./log.js'),
    hash;

/**
 * ## RequestControl([opts])
 * Starts the system.
 * @param {Number} [opts.grace] Defaults to 50. Number of requests to ignore
 * before activating the request throttle.
 * @param {Number} [opts.throttle] Defaults to 800. Minimum time in
 * milliseconds between successive requests. Only applies after grace period.
 * @param {Boolean} [opts.top] True to throttle the top window as well
 * as iframes.
 * @param {Boolean} [opts.log] True to enable system logging.
 * @return {Function} Callable to stop the system.
 */
module.exports = function (opts) {
    opts = opts || {};
    opts.grace = opts.grace || 100;
    opts.throttle = opts.throttle || 800;

    function invade(context, id) {
        var i, frame, len, spyConf;
        context = context || global.self;

        if (opts.log || global.top.rcDebug) {
            log.enable();
        }

        spyConf = {
            context: context,
            id: id || 'top',
            grace: opts.grace,
            throttle: opts.throttle
        };

        // Place spies.
        if (id || (!id && opts.top)) {
            context.XMLHttpRequest = ajaxSpy(spyConf);
            context.Image = imgSpy(spyConf);
            context.Element.prototype.appendChild = appendSpy(spyConf);
        }

        // Invade any iframes as well.
        len = context.frames.length;
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i];
                invade(frame, frame.frameElement.id);
            } catch (err) {
                if (global.top.rcDebug === 2) {
                    log('summary', {
                        msg: 'Denied access to iFrame',
                        frame: frame,
                        error: err
                    });
                }
            }
        }
    }

    // Run and reapply every 10sec to catch new frames.
    if (!hash) {
        invade();
        hash = global.setInterval(invade, 10000);
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
 * Expose the system logger.
 */
module.exports.log = log;
