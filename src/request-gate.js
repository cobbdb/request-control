var StatSet = require('./stat-set.js'),
    log = require('./log.js'),
    disabled = false;

/**
 * @param {String} name Unique identifier for this gate.
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {String} opts.id Used for logging.
 * @param {Window} [opts.context]
 * @return {Object}
 */
module.exports = function (name, opts) {
    var context = opts.context || global.self;

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
                greenLight = now - context.rcLast[name] > opts.throttle,
                free = this.stats.net.made < opts.grace;
            this.stats.count.attempted();

            if (disabled || free || firstReq || greenLight) {
                this.close();
                this.stats.count.made();
                log('gate', {
                    blocked: false,
                    type: name,
                    id: opts.id,
                    made: this.stats.net.made,
                    attempted: this.stats.net.attempted
                });
                return true;
            }
            log('gate', {
                blocked: true,
                type: name,
                id: opts.id,
                made: this.stats.net.made,
                attempted: this.stats.net.attempted
            });
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

/**
 * Call to disable all request throttling.
 */
module.exports.disable = function () {
    disabled = true;
};
