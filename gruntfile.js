module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'jquery.preload',

    typescript: {
      options: {
        sourceMap: false,
        comments: true
      },
      build: {
        options: {
          watch: false
        },
        src: 'src/ts/**/*.ts',
        dest: 'temp/<%= filename %>.js'
      },
      watch: {
        options: {
          watch: true
        },
        src: 'src/ts/**/*.ts',
        dest: 'temp/<%= filename %>.js'
      }
    },

    tslint: {
      options: {
        configuration: grunt.file.readJSON("src/ts/tslint.json")
      },
      files: {
        src: ['src/ts/**/*.ts']
      }
    },

    concat: {
      ts: {
        options: {
          banner: [
            '/**',
            ' * ',
            ' * <%= pkg.name %>',
            ' * ',
            ' * @name <%= pkg.name %>',
            ' * @version <%= pkg.version %>',
            ' * ---',
            ' * @author <%= pkg.author %> <%= pkg.homepage %>',
            ' * @copyright 2014, <%= pkg.author %>',
            ' * @license <%= pkg.license %>',
            ' * ',
            ' */',
            '',
            'new (function(window, document, undefined, $) {',
            '"use strict";',
            ''
          ].join('\n'),
          footer: [
            '})(window, window.document, void 0, jQuery);',
            ''
          ].join('\n'),
          separator: ''
        },
        src: ['temp/<%= filename %>.js'],
        dest: 'dist/raw/<%= filename %>.js'
      }
    },

    uglify: {
      js: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) 2014, <%= pkg.author %> | <%= pkg.license %> Licence */\n'
        },
        src: 'dist/raw/<%= filename %>.js',
        dest: 'dist/min/<%= filename %>.min.js'
      }
    },

    jekyll: {
      options: {
        bundleExec: true,
        config: 'gh-pages/_config.yml',
        src: 'gh-pages',
        dest: 'gh-pages/_site'
      },
      build: {},
      serve: {
        options: {
          serve: true
        }
      }
    },

    watch: {
      options: {
        livereload: true,
        nospawn: true
      },
      ts: {
        files: ['temp/**/*.js'],
        tasks: ['concat']
      },
      jekyll: {
        files: ['gh-pages/**', '!gh-pages/{api,coverage,_site}/**'],
        tasks: ['jekyll:build']
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
        client: {
          args: [{
            jquery: process.env.jquery
          }]
        }
      },
      dev: {
        browsers: ['PhantomJS', 'Chrome', 'Firefox', 'IE'],
        singleRun: false
      },
      ci: {
        reporters: process.env.output ? ['progress', 'coverage', 'coveralls'] : ['progress', 'coverage'],
        browsers: ['PhantomJS'],
        singleRun: true
      }
    },

    coveralls: process.env.output ? {
      options: {
        debug: true,
        coverage_dir: 'gh-pages/coverage',
        dryRun: true,
        force: true,
        recursive: true
      }
    } : undefined,

    shell: {
      options: {
        async: true,
        stdout: true,
        stderr: true
      },
      typescript: {
        command: 'grunt typescript:watch'
      },
      watch: {
        command: 'grunt watch'
      },
      jekyll: {
        command: 'grunt jekyll:serve'
      }
    },

    clean: {
      temp: ['temp'],
      dest: ['dist', 'test/cov', 'gh-pages/test', 'gh-pages/api', 'gh-pages/coverage']
    }

  });


  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-shell-spawn');
  
  grunt.registerTask('build', ['typescript:build', 'concat', 'uglify']);
  grunt.registerTask('view', ['build', 'shell:typescript', 'shell:watch', 'jekyll:serve']);
  grunt.registerTask('dev', ['build', 'shell:typescript', 'shell:watch', 'shell:jekyll', 'karma:dev']);
  grunt.registerTask('test', ['build', 'karma:test']);
  grunt.registerTask('travis', ['dist', 'karma:ci']);
  grunt.registerTask('dist', ['clean:dest', 'build', 'clean:temp']);
};
