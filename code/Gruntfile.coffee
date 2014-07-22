#global module:false

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig

    meta:
      version: '0.1.0',
      banner: '/*!\n * Frog Design INC - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * http://www.frogdesign.com/\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n */\n'

    clean:
      build: ['build']

    copy:
      build:
        files:[
          expand:true
          cwd:'src/img/'
          src:'**'
          dest:'build/img/'
        ,
          expand:true
          cwd:'src/fonts/'
          src:'**'
          dest:'build/fonts/'
        ,
          expand:true
          cwd:'src/lib/'
          src:'**'
          dest:'build/lib/'
        ,
          expand:true
          cwd:'src/data/'
          src:'**'
          dest:'build/data/'
        ]
      after:
        files:[
          expand:true
          cwd:'build/'
          src:'**'
          dest:'../'
        ]

    jade:
      build:
        options:
          pretty: true
        files: grunt.file.expandMapping(["src/jade/*.jade"], "build",
          rename: (destBase, destPath) ->
            destBase + destPath.replace(/src\/jade/, '').replace(/\.jade$/, ".html")
        )


    coffee:
      build:
        files: grunt.file.expandMapping(["src/coffee/**/*.coffee"], "build/js/",
          rename: (destBase, destPath) ->
            destBase + destPath.replace(/src\/coffee/, '').replace(/\.coffee$/, ".js")
        )

    less:
      build:
        options:
          compress: false

        files: grunt.file.expandMapping(["src/less/**/*.less"], "build/css/",
          rename: (destBase, destPath) ->
            destBase + destPath.replace(/src\/less/, '').replace(/\.less$/, ".css")
        )


    # lint: {
    #   files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    # },

    # qunit: {
    #   files: ['test/**/*.html']
    # },

    watch:
      coffee:
        files: ['src/coffee/**/*.coffee']
        tasks: ['coffee:build']

      less:
        files: ['src/less/**/*.less']
        tasks: 'less:build'

      jade:
        files: ['src/jade/**/*.jade']
        tasks: 'jade:build'

      js:
        files: ['src/lib/js/**/*.js']
        tasks: 'copy:build'

      css:
        files: ['src/lib/css/**/*.css']
        tasks: 'copy:build'

      img:
        files: ['src/img/**/*']
        tasks: 'copy:build'

      fonts:
        files: ['src/fonts/**/*']
        tasks: 'copy:build'

      lib:
        files: ['src/lib/**/*']
        tasks: 'copy:build'

    # jshint: {
    #   options: {
    #     curly: true,
    #     eqeqeq: true,
    #     immed: true,
    #     latedef: true,
    #     newcap: true,
    #     noarg: true,
    #     sub: true,
    #     undef: true,
    #     boss: true,
    #     eqnull: true,
    #     browser: true
    #   },
    #   globals: {
    #     jQuery: true
    #   }
    # },

    concat:
      dist:
        options:
          banner: '<%= meta.banner %>'
        src:  'release/js/app.js'
        dest: 'release/js/app.js'

    uglify:
      app:
        options:
          banner: '<%= meta.banner %>'
        files:
          'release/js/app.js': ['<%= concat.dist.dest %>']


  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-clean'

  # Default task.
  grunt.registerTask 'default', ['copy:build', 'jade', 'coffee', 'less:build','copy:after']
  grunt.registerTask 'build',   'default'

  # grunt.registerTask 'release', ['build', 'copy:release', 'less:release', 'concat', 'uglify']

  connect = require 'connect'

  grunt.registerTask "server", "Start a custom static web server.", ->
    grunt.log.writeln "Starting static web server in \"build\" on port 8080."
    connect(connect.static("build")).listen 8080
    grunt.task.run('default')
    grunt.task.run('watch')
