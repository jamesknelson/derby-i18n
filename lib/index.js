var EventEmitter = require('events').EventEmitter,
    i18n = module.exports = new EventEmitter();

i18n.plurals = require('./plurals');
i18n.middleware = require('./middleware');
i18n.localize = require('./app');

// JUST STUBS
i18n.translate = function(key) {return key};
i18n.locale = function() {return "en"};
i18n.language = function() {return "en"};

/*
// defaults
var o = {
    ns: 'app',

    interpolationPrefix: '__',
    interpolationSuffix: '__',
    reusePrefix: '$t(',
    reuseSuffix: ')',
    pluralSuffix: '_plural',
    pluralNotFound: ['plural_not_found', Math.random()].join(''),
    contextNotFound: ['context_not_found', Math.random()].join('')
};

i18n.init = function(app, options) {

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