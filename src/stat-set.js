var StatNode = require('./stat-node.js'),
    log = require('./log.js');

/**
 * @param {String} name Type this set belongs to.
 * @param {String} id Element id of parent frame.
 * @return {Object}
 */
module.exports = function (name, id) {
    var block = {
            rps: StatNode(),
            net: StatNode(),
            count: {
                made: function () {
                    block.rps.made += 1;
                    block.net.made += 1;
                },
                attempted: function () {
                    block.rps.attempted += 1;
                    block.net.attempted += 1;
                }
            }
        },
        rpsLastMade = 0,
        rpsLastAttempted = 0;

    global.setInterval(function () {
        // Update rps counter.
        block.rps.made = block.net.made - rpsLastMade;
        block.rps.attempted = block.net.attempted - rpsLastAttempted;
        rpsLastMade = block.net.made;
        rpsLastAttempted = block.net.attempted;

        // Update log data.
        log.update(id, name, block.net.toString());
    }, 1000);

    return block;
};
