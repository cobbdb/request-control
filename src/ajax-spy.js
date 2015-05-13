var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    Gate = require('./gate.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest,
        gate = Gate(opts);
    opts.type = 'AJAX';
    opts.context.rcAjaxStats = opts.context.rcAjaxStats || Stats(opts);

    /**
     * @return {XMLHttpRequest}
     */
    return function (args) {
        var req = new oldajax(args),
            oldsend = req.send,
            stats = opts.context.rcAjaxStats;
        req.send = function () {
            stats.count.attempted();
            if (gate.isOpen()) {
                gate.close();
                stats.count.made();
                log('>>> <Ajax> request allowed', opts.id);
                oldsend.apply(req, arguments);
            }
        };
        req.addEventListener('load', function () {
            stats[req.status] = stats[req.status] || 0;
            stats[req.status] += 1;
        }, false);
        return req;
    };
};
