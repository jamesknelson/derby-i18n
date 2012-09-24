toLanguages: function(lng) {
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