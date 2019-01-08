const rmUnusedCss = require('../index');

rmUnusedCss('css/style.css', { path: './**/+(*.html|*.htm|*.js)', override: false }).then(function(ret) {
    console.log(ret.newContent)
});
