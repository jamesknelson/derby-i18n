var i18n = require('./index');

module.exports = function(options) {
    var o = options || {};
    var pathRegex = /^\/(([a-z]{1,2})(-([A-Z]{1,2}))?)(\/.*)?$/;

    o.resourcesPath = o.resourcesPath || 'locales/__locale__/__ns__.json';
    o.urlScheme = o.urlScheme || false;
    o.forceScheme = /^\/(.)+/;
    o.availableLocales = o.availableLocales || ['en'];
    o.checkHeader = o.checkHeader === undefined ? true : o.checkHeader;
    o.defaultLocale = o.defaultLocale === undefined ? o.availableLocales[0] : o.defaultLocale;

    o.availableLocales.forEach(function (locale) {
        if (!i18n.plurals.isSupported(locale.split('-')[0])) {
            throw new Error('unsupported language set as available');
        }
    });
    if (o.availableLocales.indexOf(o.defaultLocale) == -1) {
        throw new Error('default locale is not supported');
    }

    i18n.options = o;

    function handler(req, res, next) {
        var language, locale, region,
            parsedPath,
            pathIncludesLocale = false;

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
         && Array.isArray(req.acceptedLocales)
         && req.acceptedLocales.length > 0
         && _isLanguageAvailable(req.acceptLocales[0], o)) {
            locale = req.acceptedLocales[0];
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

        req.i18n = {
            options: o,
            locale: locale,
            language: language,
            region: region
        }

        // If the url does not match the url scheme, redirect to one that does
        if (o.urlScheme == 'path' && !pathIncludesLocale) {
            console.log("path doesn't include locale");
            res.redirect('/'+locale+(req.path == '/' ? '' : req.path));
            return;
        }

        // Load the required locale and then continue down the middleware chain
        _loadResources(locale, req.getModel(), next);
    }


    return handler;
};

function _isLanguageAvailable(locale, o) {
    var parts = locale.split('-');
    return (o.availableLocales.indexOf(locale) != -1
         || o.availableLocales.indexOf(parts[0]) != -1);
}

function _loadResources(locale, model, next) {
    // Read the various json files in the directory for the given language,
    // then add them as private attributes to the given model.

    // Don't fart around with namespaces or anything, just add the json
    // data straight to the model.
    
    
    next();
}