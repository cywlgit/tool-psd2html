

const { series, src, dest, watch, parallel } = require('gulp')
const path = require('path')
const pug = require('gulp-pug')
const rename = require('gulp-rename') // 移除目录结构
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create();


const paths = {
    html: './pug/**/*.pug',
    css: 'stylus/**/*.styl',
    js: 'script/**/*.js',
    asset: 'assets/**', // 静态资源
}


function stylus_task(done) {
    src(['./stylus/*.styl'])
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./_css-map'))
        .pipe(dest(path.resolve('./', './css')))
    done()
}

function pug_task(done) {
    // return src(['./pug/**/!(_*.pug)'])
    src(paths.html)
        .pipe(pug({ pretty: true }))
        // .pipe(rename({ dirname: '' })) // 去掉文件夹嵌套，所有html平级
        .pipe(dest(path.resolve('./', './html')))
    done()
}

function script_task(done) {
    src('./ts/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: [['@babel/env', {
                "targets": {
                    "node": "8.0",
                    "browsers": "ie > 4"
                },
                "useBuiltIns": "entry",
                "corejs": {
                    "version": 3,
                    "shippedProposals": true,
                    "proposals": true
                }
            }]],

        }))
        .pipe(sourcemaps.write('./_js-map'))
        .pipe(dest(path.resolve('./', './js')))
    done()
}

function reload(done) {
    browserSync.reload()
    done()
}

function serve(done) {
    browserSync.init({ server: { baseDir: './' } })
    done()
}

function watch_task(done) {
    watch(paths.html, series(pug_task, reload))
    watch(paths.css, series(stylus_task, reload))
    watch(paths.js, series(script_task, reload))
    watch(paths.asset, series(script_task, reload))
    done()
}
function build(done) {
    parallel(pug_task, stylus_task, script_task)
    done()
}

exports.default = series(parallel(pug_task, stylus_task, script_task), serve, watch_task)
exports.build = build