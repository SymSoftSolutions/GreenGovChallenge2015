// JS Partials - Used in concat & uglify tasks
var jssrc = [
    // BOOTSTRAP
    'source/js/bootstrap/button.js',
    'source/js/bootstrap/transition.js'
];

var csssrc = {
    "css/greengov.css": "source/less/greengov.less"
}
            
module.exports = function (grunt) {

    require('time-grunt')(grunt);

    grunt.initConfig({
		/* Load the package.json so we can use pkg variables */
		pkg: grunt.file.readJSON('package.json'),
        
        concat: {
          options: {
            banner: '<%= banner %><%= jqueryCheck %>',
            stripBanners: false
          },
          javascripts: {
            src: jssrc,
            dest: 'js/greengov.js'
          }
        },

        uglify: {
    			my_target: {
    			  files: {
    				  'js/greengov.js': jssrc
    			  }
    			},
    			options: {
        			// the banner is inserted at the top of the output
       				banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mmm-dd-yyyy") %> */\n/* JS COMPILED FROM SOURCE DO NOT MODIFY */\n'
     			}
    		},
        
        less: {
          development: {
            options: {
              paths: ["css"],
              compress:false,
              ieCompat:true,
              banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mmm-dd-yyyy") %> */\n/* STYLES COMPILED FROM SOURCE (LESS) DO NOT MODIFY */\n'
            },
            files: csssrc
          },
          
          production: {
            options: {
              paths: ["css"],
              compress:true,
              ieCompat:true,
              banner: '/* CSS COMPILED FROM SOURCE DO NOT MODIFY */\n'
            },
            files: csssrc
          }
        },

        autoprefixer: {
          development: {
            browsers: [
              'Android 2.3',
              'Android >= 4',
              'Chrome >= 20',
              'Firefox >= 24', // Firefox 24 is the latest ESR
              'Explorer >= 8',
              'iOS >= 6',
              'Opera >= 12',
              'Safari >= 6'
            ],
            expand: true,
            flatten: true,
            src: 'css/greengov.css',
            dest: 'css'
          }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'source/images/',
                    src: ['**/*.{png,jpg,gif,svg}'],
                    dest: 'images/'
                }]
            }
        },
                        		
        watch: {
            /* watch for less changes */
            less: {
                files: [
                  'source/**/*.less'
                ],
                tasks: ['less:development', 'autoprefixer']
            },
			
            /* watch and see if our javascript files change, or new packages are installed */
            js: {
                files: [
                    'source/js/**/*.js'
                  ],
                tasks: ['concat']
            },

            /* Compress fat images */
            images: {
                files: ['source/images/*.{png,jpg,gif,svg}'],
                tasks: ['newer:imagemin']
            },
            
            /* watch our files for change, reload */
            livereload: {
                files: ['**/*.html', 'css/*.css', 'js/*.js', 'images/*'],
                options: {
                	livereload: true
                }
            },
            
            /* Reload gruntfile if it changes */
            grunt: {
                files: ['Gruntfile.js']
            }

            /* Add new module here. Mind the comma's :) */
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    
    // Default task to watch and output uncompressed
    grunt.registerTask('default', ['concat', 'less:development', 'autoprefixer', 'imagemin', 'watch']);
    
    // Device testing
    grunt.registerTask('test', ['concat', 'less:development', 'autoprefixer', 'imagemin']);
    
    // Build task to minify css and js
    grunt.registerTask('build', ['uglify', 'less:production', 'autoprefixer', 'imagemin']);
    
    // Development task to concat and unminify
    grunt.registerTask('dev', ['concat', 'less:development', 'autoprefixer', 'imagemin']);

};
