var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter Image constructor.
 */
module.exports = function (opts) {
    var oldimage = opts.context.Image,
        gate = RequestGate('Image', opts);

    /**
     * @param {Number} [width]
     * @param {Number} [height]
     * @return {Object} Valid Image instance or empty generic.
     */
    return function (width, height) {
        if (gate.check()) {
            log('>>> <Image> request allowed', opts.id);
            return new oldimage(width, height);
        } else {
            mark(opts.id);
            return {};
        }
    };
};
