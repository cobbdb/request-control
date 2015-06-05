var cache = {};

/**
 * # Marker
 * Outlines any element with a red border.
 * @param {String} id Element ID.
 */
module.exports = function (id) {
    var el;
    if (global.top.rcDebug) {
        if (!(id in cache)) {
            el = global.top.document.getElementById(id);
            if (el) {
                el.style.border = '4px solid red';
            }
        }
        cache[id] = true;
    }
};
