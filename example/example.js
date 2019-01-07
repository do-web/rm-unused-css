const rmUnusedCss = require('../index');

rmUnusedCss('css/style.css', { path: './**/+(*.html|*.htm|*.js)', override: true }, function(file, content) {
    console.log(file, content)
});
