var $ = require('curb');

module.exports = function () {
    return {
        attempted: 0,
        made: 0,
        toString: function () {
            return $('(made/attempted) %s/%s %s%',
                this.made,
                this.attempted,
                (!this.attempted) ? 0 : Math.round(this.made / this.attempted * 100)
            );
        }
    };
};
