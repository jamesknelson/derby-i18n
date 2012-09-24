var sync = {

    load: function(lngs, options, cb) {
        var self = this
          , missingLngs = [];

        for (var i = 0, len = lngs.length; i < len; i++) {
            if (!this.resStore[lngs[i]]) missingLngs.push(lngs[i]);
        }

        if (missingLngs.length > 0) {
            this.fetch(missingLngs, options, function(err, fetched) {
                if (err) i18n.functions.log(err);

                self.functions.extend(self.resStore, fetched);
                cb(err, self.resStore);
            });
        } else {
            cb(null, self.resStore);
        }
    },

    _fetch: function(lngs, options, cb) {
        var ns = options.ns
          , store = {};
        
        if (!options.dynamicLoad) {
            var todo = ns.namespaces.length * lngs.length
              , errors;

            // load each file individual
            f.each(ns.namespaces, function(nsIndex, nsValue) {
                f.each(lngs, function(lngIndex, lngValue) {
                    sync._fetchOne(lngValue, nsValue, options, function(err, data) {
                        if (err) {
                            errors = errors || [];
                            errors.push(err);
                        }
                        store[lngValue] = store[lngValue] || {};
                        store[lngValue][nsValue] = data;

                        todo--; // wait for all done befor callback
                        if (todo === 0) cb(errors, store);
                    });
                });
            });
        } else {
            var url = applyReplacement(options.resGetPath, { lng: lngs.join('+'), ns: ns.namespaces.join('+') });
            // load all needed stuff once
            f.ajax({
                url: url,
                success: function(data, status, xhr) {
                    f.log('loaded: ' + url);
                    cb(null, data);
                },
                error : function(xhr, status, error) {
                    f.log('failed loading: ' + url);
                    cb('failed loading resource.json error: ' + error);
                },
                dataType: "json",
                async : options.getAsync
            });         
        }
    },

    _fetchOne: function(lng, ns, options, done) {
        var url = applyReplacement(options.resGetPath, { lng: lng, ns: ns });
        f.ajax({
            url: url,
            success: function(data, status, xhr) {
                f.log('loaded: ' + url);
                done(null, data);
            },
            error : function(xhr, status, error) {
                f.log('failed loading: ' + url);
                done(error, {});
            },
            dataType: "json",
            async : options.getAsync
        });
    },

    postMissing: function(lng, ns, key, defaultValue, lngs) {
        var payload = {};
        payload[key] = defaultValue;

        var urls = [];

        if (o.sendMissingTo === 'fallback') {
            urls.push({lng: o.fallbackLng, url: applyReplacement(o.resPostPath, { lng: o.fallbackLng, ns: ns })});
        } else if (o.sendMissingTo === 'current') {
            urls.push({lng: lng, url: applyReplacement(o.resPostPath, { lng: lng, ns: ns })});
        } else if (o.sendMissingTo === 'all') {
            for (var i = 0, l = lngs.length; i < l; i++) {
                urls.push({lng: lngs[i], url: applyReplacement(o.resPostPath, { lng: lngs[i], ns: ns })});
            }
        }

        for (var y = 0, len = urls.length; y < len; y++) {
            var item = urls[y];
            f.ajax({
                url: item.url,
                type: o.sendType,
                data: payload,
                success: function(data, status, xhr) {
                    f.log('posted missing key \'' + key + '\' to: ' + item.url);
                    resStore[item.lng][ns][key] = defaultValue;
                },
                error : function(xhr, status, error) {
                    f.log('failed posting missing key \'' + key + '\' to: ' + item.url);
                },
                dataType: "json",
                async : o.postAsync
            });
        }
    }
};


//
// From i18next-node wrapper...
//


        configure: function(rstore, options, functions) {
            this.resStore = rstore || {};
            this.functions = functions;
            this.options = options;
        },

        ,

        fetch: function(lngs, options, cb) {
            var self = this
              , ns = options.ns
              , store = {};

            var todo = ns.namespaces.length * lngs.length
              , errors;

            // load each file individual
            f.each(ns.namespaces, function(nsIndex, nsValue) {
                f.each(lngs, function(lngIndex, lngValue) {
                    self.fetchOne(lngValue, nsValue, function(err, data) { 
                        if (err) {
                            errors = errors || [];
                            errors.push(err);
                        }

                        store[lngValue] = store[lngValue] || {};
                        
                        if (err) {
                            store[lngValue][nsValue] = {};
                        } else {
                            store[lngValue][nsValue] = data;
                        }

                        todo--; // wait for all done befor callback
                        if (todo === 0) {
                            cb(errors, store);
                        }
                    });
                });
            });
        },

        _loadLocal: function(lngs, cb) {
            cb('not supported');
        },

        _storeLocal: function(store) {
            return;
        }