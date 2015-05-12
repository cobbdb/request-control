var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest;
    opts.context.rcAjaxStats = opts.context.rcAjaxStats || Stats(opts);
    opts.type = 'AJAX';
    /**
     * @return {XMLHttpRequest}
     */
    return function (args) {
        var req = new oldajax(args),
            oldsend = req.send,
            stats = opts.context.rcAjaxStats;
        req.send = function () {
            var now = Date.now(),
                firstReq = !opts.context.rcLastAjaxReq,
                greenLight = now - opts.context.rcLastAjaxReq > opts.throttle;
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastAjaxReq = now;
                log('>>> <Ajax> request allowed', opts.id);
                oldsend.apply(req, arguments);
            } else {
                //log('>>> <Ajax> request blocked!', opts.id);
            }
        };
        req.addEventListener('load', function () {
            stats[req.status] = stats[req.status] || 0;
            stats[req.status] += 1;
        }, false);
        return req;
    };
};
