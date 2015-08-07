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
 * @return {Function} Imposter createElement function.
 */
module.exports = function (opts) {
    var oldcreate = opts.context.document.createElement,
        gate = RequestGate('Image', opts);

    /**
     * @param {String} tagName
     * @return {DOM Node}
     */
    function spy(tagName) {
        if (tagName === 'img') {
            if (gate.check()) {
                return NewImage(opts.context);
            } else {
                mark(opts.id);
                return oldcreate.call(opts.context.document, 'span');
            }
        }
        return oldcreate.call(opts.context.document, tagName);
    }
    spy.rcSpy = true;

    if (oldcreate.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldcreate;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};
