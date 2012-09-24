// Call this inside of an app to set up the app to work with a model
// previously set up with middleware
i18n.setup = function(app) {
    app.view.fn 't', i18n.translate
    app.view.fn 'l', i18n.localize
    app.view.fn 'locale', i18n.locale
}