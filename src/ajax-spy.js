var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * # Ajax Spy
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest,
        gate = RequestGate('AJAX', opts);

    /**
     * @return {XMLHttpRequest}
     */
    function spy(args) {
        var req = new oldajax(args),
            oldsend = req.send;
        req.send = function () {
            if (gate.check()) {
                log('ajax', {
                    msg: 'request allowed',
                    id: opts.id
                });
                oldsend.apply(req, arguments);
            } else {
                mark(opts.id);
            }
        };
        return req;
    }
    spy.rcSpy = true;

    if (oldajax.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldajax;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};
