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

var derby = require('derby'),
    path = require('path'),
    util = require('./util'),
    FsBackend = require('./backends/filesystem');

i18n.plurals = require('./plurals');
i18n.localize = function(app, options) {

    /*
     *  Configuration for this app
     */

    if (!options) {
        options = {};
    }

    var o = derby.util.merge({
        backend: new FsBackend(),

        ns: _parseName(app.view._appFilename),

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

        // If the url does not match the url scheme, redirect to one that does
        if (o.urlScheme == 'path' && !pathIncludesLocale) {
            res.redirect('/'+locale+(req.path == '/' ? '' : req.path));
            return;
        }

        // Thunberbirds are go.
        var model = req.getModel();
        model.set('_i18n', {
            locale: locale,
            language: language,
            region: region
        });

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
        //var model = this.view.model;
        //return o.backend.get(model, model.get('_i18n.locale'), o.ns, key);
        return key;
    }
    function _locale(key) {
        this.view.model.get('_i18n.locale');
    }
    function _language(key) {
        this.view.model.get('_i18n.language');
    }
    function _region(key) {
        this.view.model.get('_i18n.region');
    }
    app.view.fn('t', _translate);
    app.view.fn('translate', _translate);
    //app.view.fn 'l', i18n.localize
    app.view.fn('locale', _locale);
    app.view.fn('language', _language);
    app.view.fn('region', _region);

    return app;
}

function _isLanguageAvailable(locale, o) {
    var parts = locale.split('-');
    return (o.availableLocales.indexOf(locale) != -1
         || o.availableLocales.indexOf(parts[0]) != -1);
}

// Based on derby/lib/files.js
function _parseName(parentFilename) {
    var parentDir = path.dirname(parentFilename),
        base = path.basename(parentFilename).replace(/\.(?:js|coffee)$/, '');
    if (base === 'index') {
        base = path.basename(parentDir);
    }
    return base;
}



/*i18n.init = function(app, options) {

    // extend functions with applyReplacement
    var applyReplacement = function(string, replacementHash) {
        i18n.functions.each(replacementHash, function(key, value) {
            string = string.replace([o.interpolationPrefix, key, o.interpolationSuffix].join(''), value);
        });
        return string;
    };
    i18n.functions.extend(i18n.functions, {
        applyReplacement: applyReplacement
    });

        if (typeof o.ns == 'string') {
        o.ns = { namespaces: [o.ns], defaultNs: o.ns};
    }

    if (!o.lng) o.lng = f.detectLanguage(); 
    if (o.lng) {
        // set cookie with lng set (as detectLanguage will set cookie on need)
        f.cookie.create('i18next', o.lng, o.cookieExpirationTime);
    } else {
        o.lng =  o.fallbackLng;
        f.cookie.remove('i18next');
    }

    languages = f.toLanguages(o.lng);
    currentLng = languages[0];
    f.log('currentLng set to: ' + currentLng);

    pluralExtensions.setCurrentLng(currentLng);

    // languages to load
    var lngsToLoad = f.toLanguages(o.lng);
    if (typeof o.preload === 'string') o.preload = [o.preload];
    for (var i = 0, l = o.preload.length; i < l; i++) {
        var pres = f.toLanguages(o.preload[i]);
        for (var y = 0, len = pres.length; y < len; y++) {
            if (lngsToLoad.indexOf(pres[y]) < 0) {
                lngsToLoad.push(pres[y]);
            }
        }
    }

    // else load them
    i18n.sync.load(lngsToLoad, o, function(err, store) {
        resStore = store;

        if (cb) cb(translate);
        if (deferred) deferred.resolve();
    });

    return deferred;
};

// from client
i18n.init = function(options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    options = options || {};
    
    // override defaults with passed in options
    f.extend(o, options);

    // create namespace object if namespace is passed in as string
    if (typeof o.ns == 'string') {
        o.ns = { namespaces: [o.ns], defaultNs: o.ns};
    }

    if (!o.lng) o.lng = f.detectLanguage(); 
    if (o.lng) {
        // set cookie with lng set (as detectLanguage will set cookie on need)
        f.cookie.create('i18next', o.lng, o.cookieExpirationTime);
    } else {
        o.lng =  o.fallbackLng;
        f.cookie.remove('i18next');
    }

    languages = f.toLanguages(o.lng);
    currentLng = languages[0];
    f.log('currentLng set to: ' + currentLng);

    pluralExtensions.setCurrentLng(currentLng);

    // add JQuery extensions
    if ($ && o.setJqueryExt) addJqueryFunct();

    // jQuery deferred
    var deferred;
    if ($ && $.Deferred) {
        deferred = $.Deferred();
    }

    // return immidiatly if res are passed in
    if (o.resStore) {
        resStore = o.resStore;
        if (cb) cb(translate);
        if (deferred) deferred.resolve();
        return deferred;
    }

    // languages to load
    var lngsToLoad = f.toLanguages(o.lng);
    if (typeof o.preload === 'string') o.preload = [o.preload];
    for (var i = 0, l = o.preload.length; i < l; i++) {
        var pres = f.toLanguages(o.preload[i]);
        for (var y = 0, len = pres.length; y < len; y++) {
            if (lngsToLoad.indexOf(pres[y]) < 0) {
                lngsToLoad.push(pres[y]);
            }
        }
    }

    // else load them
    i18n.sync.load(lngsToLoad, o, function(err, store) {
        resStore = store;

        if (cb) cb(translate);
        if (deferred) deferred.resolve();
    });

    return deferred;
}
}
*/