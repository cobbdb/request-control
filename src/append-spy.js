var log = require('./log.js'),
    harness = global.document.createElement('div'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
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
    function spy(child) {
        var asText;
        harness.innerHTML = '';
        oldappend.call(harness, child);
        asText = harness.innerHTML;
        if (asText.indexOf('//') >= 0) {
            if (gate.check()) {
                log('append', {
                    msg: 'request allowed',
                    id: opts.id,
                    text: asText
                });
                return oldappend.call(this, child);
            } else {
                mark(opts.id);
                return child;
            }
        } else {
            log('append', {
                msg: 'non-request append allowed',
                id: opts.id
            });
            return oldappend.call(this, child);
        }
    }
    spy.rcSpy = true;

    if (oldappend.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldappend;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};
