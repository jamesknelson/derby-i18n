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

module.exports = {
    addRule: addRule,
    setCurrentLanguage: setCurrentLanguage,
    get: get
};

// find more rules at http://translate.sourceforge.net/wiki/l10n/pluralforms
var currentRule,
    rules = {
    "de": {
        "name": "German", 
        "numbers": [
            2, 
            1
        ], 
        "plurals": function(n) { return Number(n != 1); }
    }, 
    "en": {
        "name": "English", 
        "numbers": [
            2, 
            1
        ], 
        "plurals": function(n) { return Number(n != 1); }
    }, 
    "it": {
        "name": "Italian", 
        "numbers": [
            2, 
            1
        ], 
        "plurals": function(n) { return Number(n != 1); }
    }, 
    "ja": {
        "name": "Japanese", 
        "numbers": [
            1
        ], 
        "plurals": function(n) { return 0; }
    }, 
    "ko": {
        "name": "Korean", 
        "numbers": [
            1
        ], 
        "plurals": function(n) { return 0; }
    }, 
    "zh": {
        "name": "Chinese", 
        "numbers": [
            1
        ], 
        "plurals": function(n) { return 0; }
    }
};

// for demonstration only sl and ar is added but you can add your own pluralExtensions
function addRule(lng, obj) {
    rules[lng] = obj;    
}

function setCurrentLanguage(lng) {
    if (!currentRule || currentRule.lng !== lng) {
        var parts = lng.split('-');

        currentRule = {
            lng: lng,
            rule: rules[parts[0]]
        };
    }
}

function get(lng, count) {
    var parts = lng.split('-');

    function getResult(l, c) {
        var ext;
        if (currentRule && currentRule.lng === lng) {
            ext = currentRule.rule; 
        } else {
            ext = rules[l];
        }
        if (ext) {
            var i = ext.plurals(c);
            var number = ext.numbers[i];
            if (ext.numbers.length === 2) {
                if (number === 2) { 
                    number = 1;
                } else if (number === 1) {
                    number = -1;
                }
            } //console.log(count + '-' + number);
            return number;
        } else {
            return c === 1 ? '1' : '-1';
        }
    }
                
    return getResult(parts[0], count);
}