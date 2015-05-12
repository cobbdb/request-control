var StatNode = require('./spy-stat-node.js'),
    log = require('./log.js');

/**
 * @param {String} opts.id ID of the frameElement.
 * @param {String} opts.type
 * @param {Boolean} opts.debug True to enable console logging.
 */
module.exports = function (opts) {
    var block = {
        rps: StatNode(),
        net: StatNode()
    };
    if (global.top.rcDebug) {
        global.setInterval(function () {
            if (block.rps.attempted > 0) {
                /*log(
                    'requests/second',
                    opts.id,
                    opts.type,
                    block.rps.toString()
                );*/
            }
            block.rps.made = 0;
            block.rps.attempted = 0;
        }, 1000);
        global.setInterval(function () {
            if (block.net.attempted > 0) {
                log(
                    '\tnet requests',
                    opts.id,
                    opts.type,
                    block.net.toString()
                );
            }
        }, 9000);
    }
    return block;
};
