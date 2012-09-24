var EventEmitter = require('events').EventEmitter,
    plurals = require('./plurals'),
    middleware = require('./middleware'),
    filesync = require('./filesync');

var i18n = module.exports = new EventEmitter();

// defaults
var o = {
    lng: undefined,
    load: 'all',
    preload: [],
    lowerCaseLng: false,
    returnObjectTrees: false,
    fallbackLng: 'dev',
    ns: 'translation',
    nsseparator: ':',
    keyseparator: '.',
    debug: false,
    
    resGetPath: 'locales/__lng__/__ns__.json',
    resPostPath: 'locales/add/__lng__/__ns__',

    getAsync: true,
    postAsync: true,

    resStore: undefined,
    useLocalStorage: false,
    localStorageExpirationTime: 7*24*60*60*1000,

    dynamicLoad: false,
    sendMissing: false,
    sendMissingTo: 'fallback', // current | all
    sendType: 'POST',

    interpolationPrefix: '__',
    interpolationSuffix: '__',
    reusePrefix: '$t(',
    reuseSuffix: ')',
    pluralSuffix: '_plural',
    pluralNotFound: ['plural_not_found', Math.random()].join(''),
    contextNotFound: ['context_not_found', Math.random()].join(''),

    setJqueryExt: true,
    useDataAttrOptions: false,
    cookieExpirationTime: undefined,

    postProcess: undefined
};

i18n.init = function(app, options) {
    options = options || {};
    options.resSetPath = options.resSetPath || 'locales/__lng__/__ns__.json';
    options.sendMissing = options.saveMissing || false;
    options.detectLngFromPath = options.detectLngFromPath === undefined ? false : options.detectLngFromPath;
    options.forceDetectLngFromPath = false;
    resStore = options.resStore ? options.resStore : {};

    var o = i18n.options = options;

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

