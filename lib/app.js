var i18n = require('./index');

// Call this inside of an app to set up the app to work with a model
// previously set up with middleware
module.exports = function(app) {
	// TODO: only do this if i18n is configured for language in path...
	function localify(fn) {
		return function() {
			arguments[0] = '/:locale' + (arguments[0] == '/' ? '' : arguments[0]);
			fn.apply(null, arguments);
		}
	}
	['get', 'post', 'put', 'del'].forEach(function(method) {
		app[method] = localify(app[method]);
	});

	// TODO: Wrap the .ready callback on the app to bind these to the 
	// language defined in the model
    app.view.fn('t', i18n.translate);
    //app.view.fn 'l', i18n.localize
    app.view.fn('locale', i18n.locale);
    app.view.fn('language', i18n.language);

    return app;
}