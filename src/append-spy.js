var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    harness = global.document.createElement('div'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter appendChild function.
 */
module.exports = function (opts) {
    var oldappend = opts.context.Element.prototype.appendChild,
        gate = RequestGate('DomAppend', opts);

    /**
     * @param {Element} child
     * @return {Element} The appended child.
     */
    return function (child) {
        var asText;
        harness.innerHTML = '';
        oldappend.call(harness, child);
        asText = harness.innerHTML;
        if (asText.indexOf('http') >= 0) {
            if (gate.check()) {
                log('>>> <DomAppend> request allowed', opts.id);
                return oldappend.call(this, child);
            } else {
                mark(opts.id);
                return child;
            }
        } else {
            return oldappend.call(this, child);
        }
    };
};
