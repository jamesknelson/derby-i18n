var o = require('./index').config;

module.exports = {
    applyReplacement: applyReplacement
};

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