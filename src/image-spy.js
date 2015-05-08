var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter Image constructor.
 */
module.exports = function (opts) {
    var stats = Stats(opts),
        oldimage = opts.context.Image;
    /**
     * @return {Object} Valid Image instance or empty generic.
     */
    return function (width, height) {
        var now = Date.now(),
            firstReq = !opts.context.rcLastImgReq,
            greenLight = now - opts.context.rcLastImgReq < opts.throttle;
        stats.rps.attempted += 1;
        stats.net.attempted += 1;
        if (firstReq || greenLight) {
            stats.rps.made += 1;
            stats.net.made += 1;
            opts.context.rcLastImgReq = Date.now();
            return new oldimage(width, height);
        } else {
            log('>>> <Image> request blocked!', id);
            return {};
        }
    };
};
