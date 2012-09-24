derby-i18n
==========

Simple filesystem-based i18n support for [derby](http://derbyjs.com), a node.js MVC framework. Supports plurals, interpolation, and namespaces.

Getting Started
---------------

1. Add derby-i18n to your package.json, and run `npm install` in your project directory.
2. Add the derby-i18n middlewhere to your server.js:
```javascript
var derby = require('derby'),
	i18n = require('derby-i18n');

...

// Adds req.getModel method
.use(store.modelMiddleware())

// Chooses the locale, load translations and adds them to the model
.use(i18n.middleware({
	defaultLocale: ['header', 'en'],
	urlScheme: 'path'
}))
```
3. Setup your app.js for use with derby-i18n
```javascript
derby = require('derby');
app = derby.createApp(module);

// Add i18n helpers to your views
i18n = require('derby-i18n');
i18n.setup(app);
``` 
4. derby-i18n uses json-based locale files following the same format as [i18next](http://i18next.com). By default, they are placed in the locales directory under the root of your project.

Options
-------

Both `middleware(options)` and `setup(app, options)` accept an options object as their final parameter.

`middleware(options)` accepts the following:
- `urlScheme` if given indicates how the locale should be represented in the URL. 'path' indicates that the locale should be inserted as the first part of the path after the domain name. If false or absent, the locale is guessed from defaultLocale.
- `defaultLocale` is an array which gives the order in which to search for a locale to use if one is not given in the URL. `'header'` will look for an 'accept-language' header, while any other string is interpreted as an actual default locale.

`setup(app, options)` accepts the following:
- no options as of yet

Usage
-----

...



Credits
-------

- [Jan Mühlemann](https://github.com/jamuhl), creator of [i18next](http://i18next.com), from which derby-i18n draws much inspiration
- Nate Smith and Brian Noguchi, for creating [derby](http://derbyjs.com),