var i18n = module.exports;
    i18n.config = {
        interpolationPrefix: '__',
        interpolationSuffix: '__',
        reusePrefix: '$t(',
        reuseSuffix: ')',
        pluralSuffix: '_plural',
        pluralNotFound: ['plural_not_found', Math.random()].join(''),
        contextNotFound: ['context_not_found', Math.random()].join('')
    };

var util = require('./util'),
    FsBackend = require('./backends/filesystem');

i18n.plurals = require('./plurals');
i18n.localize = function(app, options) {

    /*
     *  Configuration for this app
     */

    if (!options) {
        options = {};
    }

    var o = util.merge({
        backend: new FsBackend(options),

        ns: util.parseName(app.view._appFilename),

        urlScheme: false,
        forceScheme: /^\/(.)+/,
        availableLocales: ['en'],
        checkHeader: true
    }, options);

    if (o.defaultLocale === undefined) {
        o.defaultLocale = o.availableLocales[0];
    }

    o.availableLocales.forEach(function (locale) {
        if (!i18n.plurals.isSupported(locale.split('-')[0])) {
            throw new Error('unsupported language set as available');
        }
    });

    if (o.availableLocales.indexOf(o.defaultLocale) == -1) {
        throw new Error('default locale is not set as available');
    }

    /*
     *  Localize app routes
     */

    if (o.urlScheme == "path") {
        function localify(fn) {
            return function() {
                arguments[0] = '/:locale' + (arguments[0] == '/' ? '' : arguments[0]);
                fn.apply(null, arguments);
            }
        }
        ['get', 'post', 'put', 'del'].forEach(function(method) {
            app[method] = localify(app[method]);
        });
    }

    /*
     *  Inject middleware into app router
     */

    var pathRegex = /^\/(([a-z]{1,2})(-([A-Z]{1,2}))?)(\/.*)?$/,
        originalRouter = app.router;

    function middleware(req, res, next) {
        var language, locale, region,
            parsedPath,
            pathIncludesLocale = false,
            model = req.getModel();

        // If a url scheme is given, first look for the locale there
        if (o.urlScheme) {
            var parsedPath = req.path.match(pathRegex);
            if (parsedPath && _isLanguageAvailable(parsedPath[1], o)) {
                pathIncludesLocale = true;
                locale = parsedPath[1];
            }

            if (o.urlScheme != 'path') {
                throw new Error('urlScheme '+urlScheme+' is unsupported');
            }

            // If we are enforcing that the locale is in the current path,
            // but don't have an available locale yet, the URL is invalid.
            if (o.forceScheme && !locale && o.forceScheme.test(req.path)) {
                throw new Error('404');
            }
        }

        // If locale can't be detected from the url, try the default options
        if (!locale
         && o.checkHeader
         && Array.isArray(req.acceptedLanguages)
         && req.acceptedLanguages.length > 0
         && _isLanguageAvailable(req.acceptedLanguages[0], o)) {
            locale = req.acceptedLanguages[0];
        }

        // Try and get the locale from the model
        if (!locale) {
            locale = model.get('_i18n.locale');
        }

        // Failing everything else just use the default
        if (!locale) {
            locale = o.defaultLocale;
        }

        var parts = locale.split('-');
        language = parts[0];
        region = parts[1];

        // If the given locale isn't available, the language should be (from
        // above checks) so set the locale to the language.
        if (o.availableLocales.indexOf(locale) == -1) {
            locale = language;
            if (o.urlScheme == 'path' && pathIncludesLocale) {
                res.redirect('/'+locale+(parsedPath[5] || ""));
                return;
            }
        }

        // If the url does not match the url scheme, redirect to one that does
        if (o.urlScheme == 'path' && !pathIncludesLocale) {
            res.redirect('/'+locale+(req.path == '/' ? '' : req.path));
            return;
        }


        // Thunberbirds are go.
        model.set('_i18n.locale', locale);
        model.set('_i18n.language', language);
        model.set('_i18n.region', region);
        model.set('_i18n.namespace', o.ns);

        // Load the required locale and then continue down the middleware chain
        o.backend.init(model, locale, o.ns, function(err) {
            if (err) {
                throw new Error("Couldn't load translations: "+locale+"."+o.ns);
            }

            // Call the main app router once we have loaded our locales
            (originalRouter())(req, res, next);
        })

    }
    app.router = function() { return middleware; };

    /*
     *  Add i18n view helpers
     */

    function _translate(key) {
        var model = this.view.model;
        return o.backend.get(model, model.get('_i18n.locale'), model.get('_i18n.namespace'), key);
    }
    function _locale() {
        return this.view.model.get('_i18n.locale');
    }
    function _language() {
        return this.view.model.get('_i18n.language');
    }
    function _region() {
        return this.view.model.get('_i18n.region');
    }
    function _localizedPath(path) {
        return o.urlScheme == 'path' ? '/'+this.view.model.get('_i18n.locale')+'/'+path : path;
    }
    app.view.fn('t', _translate);
    app.view.fn('translate', _translate);
    //app.view.fn 'l', i18n.localize
    app.view.fn('localizedPath', _localizedPath)

    return app;
}

function _isLanguageAvailable(locale, o) {
    var parts = locale.split('-');
    return (o.availableLocales.indexOf(locale) != -1
         || o.availableLocales.indexOf(parts[0]) != -1);
}