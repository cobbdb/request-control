global.top.rcDebug = true;

module.exports = function () {
    if (global.top.rcDebug) {
        global.console.debug.apply(global.console, arguments);
    }
};
