var plurals = require('plurals'),
    i18n = require('./i18n');

module.exports = function(options) {
    var o = options || {};
    var pathRegex = /^\/([a-z]{1,2})(-([A-Z]{1,2}))?(\/.*)?$/;

    o.resourcesPath = o.resourcesPath || 'locales/__lng__/__ns__.json';
    o.urlScheme = o.urlScheme || false;
    o.forceScheme = /^\/(.)+/;
    o.availableLanguages = o.availableLanguages || ['en'];
    o.checkHeaderForDefault = o.checkHeaderForDefault === undefined ? true : o.checkHeaderForDefault;
    o.defaultLocale = o.defaultLocale === undefined ? o.availableLanguages[0] || o.defaultLocale;

    o.availableLanguages.forEach(function (lang) {
        if (!plurals.rules[lang]) {
            throw new Error('language with no known pluralization rules is set as available');
        }
    });

    var handler = function(req, res, next) {
        var locale, locales, 
            pathIncludesLocale = false;

        // If a url scheme is given, first look for the locale there
        if (o.urlScheme) {
            if (o.urlScheme == "path") {
                var parts = req.path.match(pathRegex);
                if (parts
                 && parts[1]
                 && o.availableLanguages.indexOf(parts[1]) != -1) {
                    locales = [parts[1] + (parts[2] || "")];
                    pathIncludesLocale = true;
                }
            }
            else {
                throw new Error('urlScheme '+urlScheme+' is unsupported');
            }

            // If we are enforcing the URL scheme for this URL but can't find a
            // valid locale, then 404
            if (o.forceScheme && !locales && o.forceScheme.test(req.path)) {
                throw new Error('404');
            }
        }

        // If locale can't be detected from the url, try the default options
        if (!languages
         && o.checkHeaderForDefault
         && req.headers
         && req.headers['accept-language']) { 
            locales = _extractLocales(req.headers)
        } else if (o.defaultLocale) {
            locales = [o.defaultLocale];
        }


        if (!Array.isArray(locales) || locales.length == 0) {
            throw new Error("404");
        } else {
            req.locale = locale = locales[0];
            req.language = language = locale.split('-')[0];
        }

        // If the url does not match the url scheme, redirect to one that does
        if (o.urlScheme == path && !pathIncludesLocale) {
            response.redirect('/'+locale+req.path);
            return;
        }

        // Load the required locale and then continue down the middleware chain
        i18n.init(locale, req.getModel(), function() {
            next();
        });
    }

    return handler;
};

// From i18next-node
// https://github.com/jamuhl/i18next-node
var _extractLocales = function(headers) {
    var locales = [],
        lngs = [];

    // associate language tags by their 'q' value (between 1 and 0)
    acceptLanguage.split(',').forEach(function(l) {
        var parts = l.split(';'); // 'en-GB;q=0.8' -> ['en-GB', 'q=0.8']

        // get the language tag qvalue: 'q=0.8' -> 0.8
        var qvalue = 1; // default qvalue
        var i;
        for (i = 0; i < parts.length; i++) {
            var part = parts[i].split('=');
            if (part[0] === 'q' && !isNaN(part[1])) {
                qvalue = Number(part[1]);
                break;
            }
        }

        // add the tag and primary subtag to the qvalue associations
        lngs.push({lng: parts[0], q: qvalue});
    });

    lngs.sort(function(a,b) {
        return b.q - a.q;
    });

    for (i = 0; i < lngs.length; i++) {
        locales.push(lngs[i].lng);
    }

    return locales;
};