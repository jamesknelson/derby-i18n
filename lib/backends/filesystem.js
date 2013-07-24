var fs = require('fs'),
    util = require('../util');

var Backend = module.exports = function(options) {
    this.options = options || {};
    this.options.resourcesPath = this.options.resourcesPath || 'locales/__locale__/__ns__.json';
};

Backend.prototype.init = function(model, locale, ns, cb) {
    var filename = util.applyReplacement(this.options.resourcesPath, {locale: locale, ns: ns});

    var self = this;
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            cb(err);
        } else {
            model.set('_i18n.'+locale+'.'+ns, JSON.parse(data));
            cb(null);
        }
    });
}

Backend.prototype.get = function(model, locale, ns, key) {
    return model.get('_i18n.'+locale+'.'+ns+'.'+key) || locale+'.'+ns+'.'+key;
}