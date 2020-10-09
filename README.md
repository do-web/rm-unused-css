<p align="center">
  <img src="https://img.shields.io/github/issues/do-web/rm-unused-css.svg" alt="Build Status">
    <img src="https://img.shields.io/github/license/do-web/rm-unused-css.svg" alt="Build Status">
    <img src="https://img.shields.io/npm/dw/rm-unused-css.svg" alt="Downloads in week">
    <img src="https://img.shields.io/npm/v/rm-unused-css.svg" alt="">
</p>


# Remove unused CSS | rm-unused-css

Remove unused css and duplicated css rules from your website. This tool removes duplicated rules and searches in html and js for unused css. Please keep in mind that not all unused css can be found, because of js injections! In my test 80-90% of unused css can be removed.
This supports all kind off css frameworks, bootstrap, tailwindcss, foundation and more....

Check out the [webpack plugin](https://github.com/do-web/css-cleanup-webpack-plugin) for usage with webpack.

## Installing

To utilize for node.js install the the `npm` module:

```bash
$ npm install rm-unused-css --save
```

Check out the example folder!

```js
const rmUnusedCss = require('rm-unused-css');
const cssSource = 'css/style.css';
rmUnusedCss(cssSource, { path: './**/+(*.html|*.htm|*.js)', override: true }).then((result) => {
    console.log(result.file, result.newContent)
});
```

> Source: [cssSource]

Could be a single file path, array or a string with CSS content.

### Options

```js
{
    // Glob path to the js and html files. Set to null or false if you don't want to remove unused selectors
    path: '**/+(*.html|*.htm|*.js)',
    // Override the input file
    override: false,
    // exclude files
    exclude: [],
    // RegExp css class patterns. Example: /myclass_.*/
    whitelistPatterns: [],
    blacklistPatterns: [],
    // glob package options
    globOptions: {
        ignore: 'node_modules/**/*'
    }
}
```

### Build Plugin

<div align="center">
	  <a href="https://github.com/do-web/css-cleanup-webpack-plugin">
    	<img width="200" heigth="200" src="https://raw.githubusercontent.com/webpack/media/master/logo/icon-square-big.png">
    </a>
</div>

* [Webpack](https://github.com/do-web/css-cleanup-webpack-plugin)


##
## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Donate

[![Donate with Bitcoin](https://en.cryptobadges.io/badge/big/1AvuyxxtGufTwpyRCKw74FQXVtPirEnwP6)](https://en.cryptobadges.io/donate/1AvuyxxtGufTwpyRCKw74FQXVtPirEnwP6)
----

[license-url]: https://github.com/do-web/curl-request/blob/master/LICENSE

[npm-url]: https://www.npmjs.com/package/curl-request
[npm-license]: https://img.shields.io/npm/l/curl-request.svg?style=flat
[npm-version]: https://badge.fury.io/js/curl-request.svg
[npm-downloads]: https://img.shields.io/npm/dm/curl-request.svg?style=flat
