import webpack from "webpack";
import webpackStream from "webpack-stream";

const bundleJs = webpackStream.default ?? webpackStream;

export const js = () => {
	return app.gulp
		.src(app.path.src.js, { sourcemaps: app.isDev })
		.pipe(
			app.plugins.plumber(
				app.plugins.notify.onError({
					title: "JS",
					message: "Error: <%= error.message %>",
				})
			)
		)
		.pipe(
			bundleJs(
				{
					mode: app.isBuild ? "production" : "development",
					output: {
						filename: "app.js",
					},
					module: {
						rules: [
							{
								test: /\.m?js$/,
								resolve: {
									fullySpecified: false,
								},
							},
						],
					},
				},
				webpack
			)
		)
		.pipe(app.gulp.dest(app.path.build.js))
		.pipe(app.plugins.browsersync.stream());
};

export const copyJsLibs = () => {
	return app.gulp.src(app.path.src.jsLibs).pipe(app.gulp.dest(app.path.build.jsLibs));
};
