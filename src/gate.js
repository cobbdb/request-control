/**
 * @param {Number} throttle
 * @return {Object}
 */
module.exports = function (throttle) {
    var lastReq = 0;

    return {
        /**
         * @return {Boolean}
         */
        isOpen: function () {
            var now = global.Date.now(),
                firstReq = !lastReq,
                greenLight = now - lastReq > throttle;
            return firstReq || greenLight;
        },
        close: function () {
            lastReq = global.Date.now();
        },
        open: function () {
            lastReq = 0;
        }
    };
};
