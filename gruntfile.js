module.exports = function (grunt) {
    require('matchdep').filterDev([
        'grunt-*',
        '!grunt-template-*'
    ]).forEach(grunt.loadNpmTasks);
    grunt.loadTasks('tasks');

    grunt.registerTask('default', 'Full build suite.', [
        'browserify',
        //'jasmine:modules',
        'jshint',
        'uglify:build',
        //'jasmine:global'
    ]);
    grunt.registerTask('test', 'Run tests.', [
        //'browserify:tests',
        //'jasmine:modules'
    ]);
};
