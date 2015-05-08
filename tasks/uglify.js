module.exports = function (grunt) {
    grunt.config.merge({
        uglify: {
            build: {
                files: {
                    'dist/reqctrl.min.js': 'bin/reqctrl.js'
                }
            }
        }
    });
};
