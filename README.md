# derby-i18n

Simple filesystem-based i18n support for [derby](http://derbyjs.com), a node.js MVC framework. It is planned to support interpolation and plurals in the near future.

## Getting Started

#### Install in your app directory

`npm install derby-i18n`

#### Add locale files

By default, derby-i18n looks for locales in `locales/[language-code]/[app-name].json`.
For example, if you have an app called "blog", and your app supports english, you'll
have locale files at `locales/en/blog.json`. Heres a sample blog.json file to get you started:

```javascript
{
	"title": "JKN"
    "article": {
    	"published_on": "Published on the",
    	"meta": "Read more and comment"
    }
}
```

#### Localize your app object

In your app.js, you'll need to call derby-i18n's `localize` method on your app:
	
```javascript
var derby = require('derby'),
	i18n = require('derby-i18n'),
	app = i18n.localize(derby.createApp(module), {
		availableLocales: ['en', 'ja'],
  		urlScheme: 'path'
	});
```

There are a number of options available for localize, but if you don't pass it any
options it will assume you just want English. This is really simple way to build
in support for other languages from the beginning!

#### Localize your views

derby-i18n adds a few view helpers for you to use, including:

- 	`t(key)`

	Returns the translation for the given key. For example, to display the published_on
	key in the above locale file, you would do `{{t("article.published_on")}}`.

	Support is planned for pluralization and interpolation in the near future.

-   `localizedPath(path)`

	If using the `path` urlScheme, this will return the given path with `/[locale]/` prepended to it - for example `/en/` for the English locale. If not using the `path` urlScheme, nothing happens. This is useful for making sure your URLs are always pointing at the correct language.

derby-i18n also sets an `_i18n` field on your model:

```
model.set('_i18n', {
    locale: locale,
    language: language,
    region: region,
    namespace: o.ns
});
```

The locale attribute includes the region if it is supported, otherwise just the language. The namespace is just the name of your app (`blog` in the above example).


## Options

Configuration is accomplished by passing options to the localize call which wraps your app. The available options include:

-   `urlScheme`

	Currently, the only supported options are `"path"` and `false`. Support for `"domain"` is also planned.

	When set to `"path"`, the first place to look for a locale is the first part of the current URL. For example, if the URL is `/ja/ongaku/capsule`, then your locale will be `ja`. Regions are also supported, for example `/en-US`.

	When set to `false`, URLs will be ignored as a source of locale information.

-   `availableLocales`

	An array containing the available locales for your app. Defaults to `["en"]`.

	This should mirror the locales available in your `/locales` directory. If a locale is requested in a URL and isn't in this list, a 404 exception will be thrown.

-   `checkHeader`

	If `true`, the http accept-language header will be checked for a locale in the case that one isn't available in the URL. If the language-region combination is available, that will be used. Failing that, if a locale is defined for the same language without a region attached, that will be used. Otherwise the default locale is used.

-   `defaultLocale`
	
	The locale which will be chosen if one can't be found in the URL or headers. Defaults to the first locale in the `availableLocales` option.

-   `forceScheme`
	
	When `urlScheme` is `"path"`, URLs which don't match this regex will have the locale
	prepended to the URL in a redirect. URLs which do match it and don't contain a locale will 404. By default, matches everything over than `/`.

-   `backend`
	
	Defaults to a filesystem backend, but it should be possible to create others, like one based on the MongoDB store.


Credits
-------

- Nate Smith and Brian Noguchi6 - creators of [derby](http://derbyjs.com)
- [Jan Mühlemann](https://github.com/jamuhl), creator of [i18next](http://i18next.com) (which derby-i18n has borrowed from in places)