var gulpfile = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulpfile.task("build", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulpfile.dest("./dist"));
});