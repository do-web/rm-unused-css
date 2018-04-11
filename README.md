# Remove unused CSS | rm-unused-css

[![License][npm-license]][license-url]

Remove unused css and duplicate css rules.

## Installing

To utilize for node.js install the the `npm` module:

```bash
$ npm install rm-unused-css --save
```

Check out the example folder!

```js
const rmUnusedCss = require('rm-unused-css');

rmUnusedCss('css/style.css', { path: './**/+(*.html|*.htm|*.js)', override: true }, function(file, content) {
    console.log(file, content)
});
```

###Options

```js
{
    // Glob path to the js and html files
    path: '**/+(*.html|*.htm|*.js)',
    // Override the input file
    override: false,
    // exclude files
    exclude: [],
    // glob package options
    globOptions: {
        ignore: 'node_modules/**/*'
    }
}
```

##
## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


----

[license-url]: https://github.com/do-web/curl-request/blob/master/LICENSE

[npm-url]: https://www.npmjs.com/package/curl-request
[npm-license]: https://img.shields.io/npm/l/curl-request.svg?style=flat
[npm-version]: https://badge.fury.io/js/curl-request.svg
[npm-downloads]: https://img.shields.io/npm/dm/curl-request.svg?style=flat