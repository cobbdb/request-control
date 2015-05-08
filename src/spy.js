/**
 * @param {Number} opts.throttle Maximum successive requests between rests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 */
module.exports = function (opts) {
    return {
        rps: {
            attempted: 0,
            made: 0
        },
        net: {
            attempted: 0,
            made: 0
        },
        current: 0
    };
};
