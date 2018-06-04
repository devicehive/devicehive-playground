
module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        sass: {
            options: {
                sourceMap: false,
                outputStyle: 'compressed'
            },
            dist: {
                files: {
                    'public/css/main.css': 'source/scss/main.scss'
                }
            }
        },

        // Use PostCSS Autoprefixer to apply browser prefixes for certain styles
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer-core')({
                        browsers: ['last 3 versions']
                    })
                ]
            },
            dist: {
                src: 'public/css/*.css'
            }
        },

        svg_sprite : {
            basic : {
                expand : true,
                cwd : 'source/img/svg',
                src : ['**/*.svg'],
                dest : 'img',
                options : {
                    mode : {
                        css : {
                            render  : {
                                css : true
                            }
                        }
                    }
                }
            }
        },

        uglify : {
            scripts: {
                files:[{'public/js/main.min.js': ['source/js/**/*.js']}]
            }
        },

        connect: {
            server: {
                options: {
                    port: 3004,
                    base: ''
                }
            }
        },

        watch: {
            files: [
                '*.html',
                'source/js/**/*.js',
                'source/scss/**/*.scss',
                'source/img/**/*.{png,jpg,gif,svg}'
            ],
            tasks: [
                'sass',
                'postcss'
            ]
        }

    });


    grunt.registerTask('sprite', 'svg_sprite');
    grunt.registerTask('contrib-uglify', 'uglify');
    grunt.registerTask('contrib-concat', 'concat');
    //grunt serve
    grunt.registerTask('default', ['connect', 'watch']);
};
