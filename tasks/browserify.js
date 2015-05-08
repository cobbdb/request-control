var fs = require('fs');

module.exports = function (grunt) {
    var specSet,
        name = grunt.option('spec');

    if (name) {
        specSet = [
            name + '.spec.js'
        ];
    } else {
        specSet = fs.readdirSync('tests');
    }

    grunt.config.merge({
        browserify: {
            global: {
                files: {
                    'bin/reqctrl.js': 'src/reqctrl.js'
                },
                options: {
                    browserifyOptions: {
                        standalone: 'RequestControl'
                    }
                }
            },
            tests: {
                files: specSet.reduce(function (prev, cur) {
                    prev['bin/tests/' + cur] = [
                        'tests/' + cur,
                        'tests/helpers/*.setup.js'
                    ];
                    return prev;
                }, {})
            }
        }
    });
};
