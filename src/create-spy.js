var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter createElement function.
 */
module.exports = function (opts) {
    var oldcreate = opts.context.document.createElement;
    opts.context.rcCreateStats = opts.context.rcCreateStats || Stats(opts);
    opts.type = 'Create';
    /**
     * @param {String} tagName
     * @return {Element}
     */
    return function (tagName) {
        var now, firstReq, greenLight,
            stats = opts.context.rcCreateStats;
            now = Date.now();
            firstReq = !opts.context.rcLastCreateReq;
            greenLight = now - opts.context.rcLastCreateReq > opts.throttle;
        tagName = tagName.toLowerCase();
        if (tagName === 'object') {
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastCreateReq = now;
                log('>>> <Object/SWF> request allowed', opts.id);
                return oldcreate.call(opts.context.document, tagName);
            } else {
                //log('>>> <Object/SWF> request blocked!', opts.id);
                return oldcreate.call(opts.context.document, 'span');
            }
        } else if (tagName === 'div') {
        } else {
            return oldcreate.call(opts.context.document, tagName);
        }
    };
};
