var Stats = require('./stat-set.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest;
    opts.type = 'AJAX';
    opts.context.rcAjaxStats = opts.context.rcAjaxStats || Stats(opts);

    var spy = Spy(opts.context.XMLHttpRequest, 'AJAX');
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
            stats.count.attempted();
            if (firstReq || greenLight) {
                stats.count.made();
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
