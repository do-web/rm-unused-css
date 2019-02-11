# Remove unused CSS | rm-unused-css

Remove unused css and duplicated css rules.

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
    // glob package options
    globOptions: {
        ignore: 'node_modules/**/*'
    }
}
```

### Build Plugin

<div align="center">
	  <a href="https://github.com/FullHuman/purgecss-webpack-plugin">
    	<img width="200" heigth="200" src="https://webpack.js.org/assets/icon-square-big.svg">
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
