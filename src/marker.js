var cache = {};

/**
 * # Marker
 * Outlines any element with a red border.
 * @param {String} id Element ID.
 */
module.exports = function (id) {
    var el;
    if (!(id in cache)) {
        el = global.top.document.getElementById(id);
        el.style.border = '4px solid red';
    }
    cache[id] = true;
};
