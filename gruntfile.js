'use strict';

module.exports = function(grunt){

  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    uglify: {
      build: {
        options: {
          preserveComments: 'some'
        },
        files: {
            'dist/googlesuggest.min.js': ['src/googlesuggest.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['uglify']);

};