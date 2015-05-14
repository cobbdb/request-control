var StatSet = require('./stat-set.js');

/**
 * @param {String} name Unique identifier for this gate.
 * @param {Number} [opts.throttle] Defaults to 1000 milliseconds.
 * @param {String} opts.id Element id of parent frame.
 * @param {Window} [opts.context]
 * @return {Object}
 */
module.exports = function (name, opts) {
    var throttle = opts.throttle || 1000,
        context = opts.context || global.self;

    context.rcStats = context.rcStats || {};
    context.rcStats[name] = context.rcStats[name] || StatSet(name, opts.id);
    context.rcLast = context.rcLast || {};
    context.rcLast[name] = context.rcLast[name] || 0;

    return {
        /**
         * @return {Boolean}
         */
        check: function () {
            var now = global.Date.now(),
                firstReq = !context.rcLast[name],
                greenLight = now - context.rcLast[name] > throttle;
            context.rcStats[name].count.attempted();
            if (firstReq || greenLight) {
                this.close();
                context.rcStats[name].count.made();
                return true;
            }
            return false;
        },
        close: function () {
            context.rcLast[name] = global.Date.now();
        },
        open: function () {
            context.rcLast[name] = 0;
        },
        stats: context.rcStats[name]
    };
};
