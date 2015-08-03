var Lumberjack = require('lumberjackjs');
module.exports = Lumberjack();

module.exports.on('summary', function (data) {
    global.console.log(data);
});
module.exports.on('update', function (data) {
    if (global.top.rcDebug === 2) {
        global.console.log(data);
    }
});
