module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      base: {
        src: ['*.ts'],
        dest: './',
        options: {
          module: 'commonjs'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-typescript');

  grunt.registerTask('default', ['typescript']);
}