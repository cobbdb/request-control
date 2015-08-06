var Lumberjack = require('lumberjackjs');
module.exports = Lumberjack();

module.exports.on('summary', function (data) {
    global.console.log(data);
});
module.exports.on('image', function (data) {
    if (global.top.rcDebug === 2) {
        global.console.log('image', data);
    }
});
module.exports.on('ajax', function (data) {
    if (global.top.rcDebug === 2) {
        global.console.log('ajax', data);
    }
});
module.exports.on('append', function (data) {
    if (global.top.rcDebug === 2) {
        global.console.log('append', data);
    }
});
