var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js'),
    NewImage = require('./image.js');

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
     * @return {Object} Valid image Node or empty generic.
     */
    function spy(width, height) {
        if (gate.check()) {
            return NewImage(opts.context);
        } else {
            mark(opts.id);
            return {};
        }
    }
    spy.rcSpy = true;

    if (oldimage.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldimage;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};
