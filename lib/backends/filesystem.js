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

var fs = require('fs');

var sync = module.exports = {

    saveResourceSet: function(lng, ns, resourceSet, cb) {
        var filename = this.functions.applyReplacement(this.options.resSetPath, {lng: lng, ns: ns});
        fs.writeFile(filename, JSON.stringify(resourceSet, null, 4), cb);
    },

    fetchOne: function(lng, ns, cb) {

        var filename = this.functions.applyReplacement(this.options.resGetPath, {lng: lng, ns: ns});

        var self = this;
        fs.readFile(filename, 'utf8', function(err, data) {
            if (err) {
                cb(err);
            } else {
                self.functions.log('loaded file: ' + filename);
                cb(null, JSON.parse(data));
            }
        });
    },

    postMissing: function(lng, ns, key, defaultValue, callback) {

        // add key to resStore
        var keys = key.split('.');
        var x = 0;
        var value = this.resStore[lng][ns];
        while (keys[x]) {
            if (x === keys.length - 1) {
                value = value[keys[x]] = defaultValue;
            } else {
                value = value[keys[x]] = value[keys[x]] || {};
            }
            x++;
        }

        var filename = this.functions.applyReplacement(this.options.resSetPath, {lng: lng, ns: ns});

        var self = this;
        this.saveResourceSet(lng, ns, this.resStore[lng][ns], function(err) {
            if (err) {
                self.functions.log('error saving missingKey `' + key + '` to: ' + filename);
            } else {
                self.functions.log('saved missingKey `' + key + '` with value `' + defaultValue + '` to: ' + filename);
            }
            if (typeof callback === 'function') callback(err);
        });
    },

    postChange: function(lng, ns, key, newValue, callback) {
        var self = this;
        this.load([lng], {ns: {namespaces: [ns]}}, function(err, fetched) {
            // change key in resStore
            var keys = key.split('.');
            var x = 0;
            var value = fetched[lng][ns];
            while (keys[x]) {
                if (x === keys.length - 1) {
                    value = value[keys[x]] = newValue;
                } else {
                    value = value[keys[x]] = value[keys[x]] || {};
                }
                x++;
            }

            var filename = self.functions.applyReplacement(self.options.resGetPath, {lng: lng, ns: ns});

            self.saveResourceSet(lng, ns, fetched[lng][ns], function(err) {
                if (err) {
                    self.functions.log('error updating key `' + key + '` with value `' + newValue + '` to: ' + filename);
                } else {
                    self.functions.log('updated key `' + key + '` with value `' + newValue + '` to: ' + filename);
                }
                if (typeof callback === 'function') callback(err);
            });
        });
    },

    postRemove: function(lng, ns, key, callback) {
        var self = this;
        this.load([lng], {ns: {namespaces: [ns]}}, function(err, fetched) {
            // change key in resStore
            var keys = key.split('.');
            var x = 0;
            var value = fetched[lng][ns];
            while (keys[x]) {
                if (x === keys.length - 1) {
                    delete value[keys[x]];
                } else {
                    value = value[keys[x]] = value[keys[x]] || {};
                }
                x++;
            }

            var filename = self.functions.applyReplacement(self.options.resGetPath, {lng: lng, ns: ns});

            self.saveResourceSet(lng, ns, fetched[lng][ns], function(err) {
                if (err) {
                    self.functions.log('error removing key from: ' + filename);
                } else {
                    self.functions.log('removed key from: ' + filename);
                }
                if (typeof callback === 'function') callback(err);
            });
        });
    }
};