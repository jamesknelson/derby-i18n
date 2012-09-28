var path = require('path'),
    o = require('./index').config;

module.exports = {
    applyReplacement: applyReplacement,
    merge: merge,
    parseName: parseName
};

// Based on i18next-node
function applyReplacement(str, replacementHash, nestedKey) {
    if (str.indexOf(o.interpolationPrefix) < 0) return str;

    for (var key in replacementHash) {
        var value = replacementHash[key];
        if (typeof value === 'object') {
            str = applyReplacement(str, value, nestedKey ? nestedKey + '.' + key : key);
        } else {
            str = str.replace(new RegExp([o.interpolationPrefix, nestedKey ? nestedKey + '.' + key : key, o.interpolationSuffix].join(''), 'g'), value);
        }
    }
    return str;
}

// Based on racer/lib/util.js
function merge (to, from) {
  for (var key in from) to[key] = from[key];
  return to;
}

// Based on derby/lib/files.js
function parseName(parentFilename) {
    var parentDir = path.dirname(parentFilename),
        base = path.basename(parentFilename).replace(/\.(?:js|coffee)$/, '');
    if (base === 'index') {
        base = path.basename(parentDir);
    }
    return base;
}

// Based on i18next-node
function toLanguages(lng) {
    var languages = [];
    if (lng.indexOf('-') === 2 && lng.length === 5) {
        var parts = lng.split('-');

        lng = o.lowerCaseLng ? 
            parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
            parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();

        if (o.load !== 'unspecific') languages.push(lng);
        if (o.load !== 'current') languages.push(lng.substr(0, 2));
    } else {
        languages.push(lng);
    }

    if (languages.indexOf(o.fallbackLng) === -1 && o.fallbackLng) languages.push(o.fallbackLng);

    return languages;
}