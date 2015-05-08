var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var stats = Stats(opts),
        oldajax = opts.context.XMLHttpRequest;
    /**
     * @return {XMLHttpRequest}
     */
    return function (args) {
        var req = new oldajax(args),
            oldsend = req.send;
        req.send = function () {
            var now = Date.now(),
                firstReq = !opts.context.rcLastAjaxReq,
                greenLight = now - opts.context.rcLastAjaxReq < opts.throttle;
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastAjaxReq = Date.now();
                oldsend.apply(req, arguments);
            } else {
                log('>>> <Ajax> request blocked!', id);
            }
        };
        req.addEventListener('load', function () {
            stats[req.status] = stats[req.status] || 0;
            stats[req.status] += 1;
        }, false);
        return req;
    };
};
