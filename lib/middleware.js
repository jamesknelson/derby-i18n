var plurals = require('plurals');

module.exports = function(options) {
    var o = options || {};

    o.resourcesPath = o.resourcesPath || 'locales/__lng__/__ns__.json';
    o.urlScheme = o.urlScheme || false;
    o.forceScheme = /^\/(.)+/;
    o.defaultLocale = o.defaultLocale || ['en'];

    if (!Array.isArray(o.defaultLocale) || o.defaultLocale.length == 0) {
        throw new Error('defaultLocale must be an array with at least one value');
    }

    var handler = function(req, res, next) {
        var locales;

        // If a url scheme is given, first look for the locale there
        if (o.urlScheme) {
            if (o.urlScheme == "path") {
                var parts = req.originalUrl.split('/');
                if (parts.length >= 1) {
                    // TODO: specify valid locales somewhere other than plurals file
                    var part = parts[1];
                    var lookUp = plurals.rules[part.split('-')[0]];
                    if (lookUp) locales = [part];
                }
            }
            else {
                throw new Error('urlScheme '+urlScheme+' is unsupported');
            }

            // If we are enforcing the URL scheme for this URL but can't find a
            // valid locale, then 404
            if (o.forceScheme && !locales && o.forceScheme.test(req.originalUrl)) {
                throw new Error('404');
            }
        }

        // If locale can't be detected from the url, try the default options
        if (!locales) {
            o.defaultLocale.forEach(function(m) {
                if (m == "header" && req.headers && req.headers['accept-language']) { 
                    locales = _extractLocales(req.headers)
                } else {
                    locales = [m];
                }
            });
        }

        if (!locales) {
            throw new Error("404");
        }

        // Now that we have a locale, if the url does not match the url scheme,
        // redirect to the correct URL


        // TODO: pick the locale we are going to use from the available locales


        // set locale & i18n in req
        req.locale = locale;

        // assert t function returns always translation 
        // in given lng inside this request
        var t = function(key, options) {
            options = options || {};
            options.lng = options.lng || req.lng || i18n.lng();
            return i18n.t(key, options);
        };

        var i18nDummy = {
            t: t,
            translate: t,
            lng: function() { return locale; },
            locale: function() { return locale; },
            language: function() { return locale; }
        };

        // assert for req
        req.i18n = i18nDummy;
        req.t = req.t || t;

        // assert for res -> template
        if (registeredAppHelpers) {
            if (res.locals) {
                res.locals.t = t;
                res.locals.i18n = i18n;
            }
        }

        i18n.setLng(locale, function() {
            i18n.persistCookie(req, res, i18n.lng());
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