module.exports = {
    add: add,
    get: get,
    isSupported: isSupported
};

var rules = {};

// Functions should return the string to be appended to a key to find the pluralized
// form for the count given.
function add(lng, fn) {
    fn.memo = [];
    rules[lng] = function(count) {
        return fn.memo[count] || (fn.memo[count] = fn(count));
    }
}

function get(lng, count) {
    return rules[lng](count);
}

function isSupported(lng) {
    return !!rules[lng];
}

// English and Japanese are added as demonstrations, but you can add your own rules.
// Find more rules at http://translate.sourceforge.net/wiki/l10n/pluralforms
add("en", function(n) { return n != 1 ? "_plural" : ""; });
add("ja", function(n) { return ""; });
