var StatSet = require('./stat-set.js');

/**
 * @param {String} name Unique identifier for this gate.
 * @param {Number} [opts.throttle] Defaults to 1000 milliseconds.
 * @param {String} opts.id Element id of parent frame.
 * @param {Window} opts.context
 * @return {Object}
 */
module.exports = function (name, opts) {
    opts.throttle = opts.throttle || 1000;

    opts.context.rcStats = opts.context.rcStats || {};
    opts.context.rcStats[name] = opts.context.rcStats[name] || StatSet(name, opts.id);
    opts.context.rcLast = opts.context.rcLast || {};
    opts.context.rcLast[name] = opts.context.rcLast[name] || 0;

    return {
        /**
         * @return {Boolean}
         */
        check: function () {
            var now = global.Date.now(),
                firstReq = !opts.context.rcLast[name],
                greenLight = now - opts.context.rcLast[name] > throttle;
            opts.context.rcStats[name].count.attempted();
            if (firstReq || greenLight) {
                this.close();
                opts.context.rcStats[name].count.made();
                return true;
            }
            return false;
        },
        close: function () {
            opts.context.rcLast[name] = global.Date.now();
        },
        open: function () {
            opts.context.rcLast[name] = 0;
        },
        stats: opts.context.rcStats[name]
    };
};
