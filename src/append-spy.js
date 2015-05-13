var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    harness = global.document.createElement('div');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter appendChild function.
 */
module.exports = function (opts) {
    var oldappend = opts.context.Element.prototype.appendChild;
    opts.type = 'Append';
    opts.context.rcAppendStats = opts.context.rcAppendStats || Stats(opts);
    /**
     * @param {Element} child
     * @return {Element} The appended child.
     */
    return function (child) {
        var stats = opts.context.rcAppendStats,
            now = Date.now(),
            firstReq = !opts.context.rcLastAppendReq,
            greenLight = now - opts.context.rcLastAppendReq > opts.throttle,
            asText;
        harness.innerHTML = '';
        oldappend.call(harness, child);
        asText = harness.innerHTML;
        if (asText.indexOf('http') >= 0) {
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastAppendReq = now;
                log('>>> <Append> request allowed', opts.id);
                return oldappend.call(this, child);
            } else {
                return child;
            }
        } else {
            return oldappend.call(this, child);
        }
    };
};
