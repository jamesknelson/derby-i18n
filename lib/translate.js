/*

Copyright (c) 2011 Jan Mühlemann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// This file is from i18next - it still needs to be integrated.

function applyReuse(translated, options){
    var opts = f.extend({}, options);
    delete opts.postProcess;

    while (translated.indexOf(o.reusePrefix) != -1) {
        replacementCounter++;
        if (replacementCounter > o.maxRecursion) { break; } // safety net for too much recursion
        var index_of_opening = translated.indexOf(o.reusePrefix);
        var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
        var token = translated.substring(index_of_opening, index_of_end_of_closing);
        var token_sans_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');
        var translated_token = _translate(token_sans_symbols, opts);
        translated = translated.replace(token, translated_token);
    }
    return translated;
}

function hasContext(options) {
    return (options.context && typeof options.context == 'string');
}

function needsPlural(options) {
    return (options.count !== undefined && typeof options.count != 'string' && options.count !== 1);
}

function translate(key, options){
    replacementCounter = 0;
    return _translate(key, options);
}

function _translate(key, options){
    options = options || {};

    var optionsSansCount, translated
      , notfound = options.defaultValue || key
      , lngs = languages;

    if (options.lng) {
        lngs = f.toLanguages(options.lng);

        if (!resStore[lngs[0]]) {
            var oldAsync = o.getAsync;
            o.getAsync = false;

            i18n.sync.load(lngs, o, function(err, store) {
                f.extend(resStore, store);
                o.getAsync = oldAsync;
            });
        }
    }

    if (!resStore) { return notfound; } // no resStore to translate from

    var ns = options.ns || o.ns.defaultNs;
    if (key.indexOf(o.nsseparator) > -1) {
        var parts = key.split(o.nsseparator);
        ns = parts[0];
        key = parts[1];
    }

    if (hasContext(options)) {
        optionsSansCount = f.extend({}, options);
        delete optionsSansCount.context;
        optionsSansCount.defaultValue = o.contextNotFound;

        var contextKey = ns + ':' + key + '_' + options.context;
        
        translated = translate(contextKey, optionsSansCount);
        if (translated != o.contextNotFound) {
            return applyReplacement(translated, { context: options.context }); // apply replacement for context only
        } // else continue translation with original/nonContext key
    }

    if (needsPlural(options)) {
        optionsSansCount = f.extend({}, options);
        delete optionsSansCount.count;
        optionsSansCount.defaultValue = o.pluralNotFound;

        var pluralKey = ns + ':' + key + o.pluralSuffix;
        var pluralExtension = pluralExtensions.get(currentLng, options.count);
        if (pluralExtension >= 0) { 
            pluralKey = pluralKey + '_' + pluralExtension; 
        } else if (pluralExtension === 1) {
            pluralKey = ns + ':' + key; // singular
        }
        
        translated = translate(pluralKey, optionsSansCount);
        if (translated != o.pluralNotFound) {
            return applyReplacement(translated, { count: options.count }); // apply replacement for count only
        } // else continue translation with original/singular key
    }

    var found;
    var keys = key.split(o.keyseparator);
    for (var i = 0, len = lngs.length; i < len; i++ ) {
        if (found) break;

        var l = lngs[i];

        var x = 0;
        var value = resStore[l] && resStore[l][ns];
        while (keys[x]) {
            value = value && value[keys[x]];
            x++;
        }
        if (value) {
            if (typeof value === 'string') {
                value = applyReplacement(value, options);
                value = applyReuse(value, options);
            } else if (Object.prototype.toString.apply(value) === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {
                value = value.join('\n');
                value = applyReplacement(value, options);
                value = applyReuse(value, options);
            } else {
                if (!o.returnObjectTrees && !options.returnObjectTrees) {
                    value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' + 
                            'returned a object instead of string.';
                    f.log(value);
                } else {
                    for (var m in value) {
                        // apply translation on childs
                        value[m] = _translate(key + '.' + m, options);
                    }
                }
            }
            found = value;
        }
    }

    if (!found && o.sendMissing) {
        if (options.lng) {
            sync.postMissing(options.lng, ns, key, notfound, lngs);
        } else {
            sync.postMissing(o.lng, ns, key, notfound, lngs);
        }
    }

    var postProcessor = options.postProcess || o.postProcess;
    if (found && postProcessor) {
        if (postProcessors[postProcessor]) {
            found = postProcessors[postProcessor](found, key, options);
        }
    }

    if (!found) {
        notfound = applyReplacement(notfound, options);
        notfound = applyReuse(notfound, options);
    }

    return (found) ? found : notfound;
}
