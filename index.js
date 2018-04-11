const glob = require("glob");
const fs = require("fs");

module.exports = (cssFiles, options, callback) => {
    let defaults = {
        path: '**/+(*.html|*.htm|*.js)',
        override: false,
        exclude: [],
        globOptions: {
            ignore: 'node_modules/**/*'
        }
    };

    options = Object.assign({}, defaults, options);

    let isString = false;

    if (typeof cssFiles === 'string') {
        let cssData = '';

        if (fs.existsSync(cssFiles)) {
            cssData = fs.readFileSync(cssFiles).toString();
        } else {
            cssData = cssFiles;
            isString = true;
        }

        let newContent = cleanCssFile(cssData);
        if (isString === false && options.override) {
            fs.writeFileSync(cssFiles, newContent);
        }

        if (typeof callback === 'function') {
            callback(isString ? null : cssFiles, newContent);
        }
    } else {
        cssFiles.forEach((file) => {
            let cssData = fs.readFileSync(file).toString();
            let newContent = cleanCssFile(cssData);
            if (options.override) {
                fs.writeFileSync(file, newContent);
            }
            callback(file, newContent);
        });
    }

    function cleanCssFile(css) {
        let r, mq;
        let output = '';
        const regexAtQuery = /((@font-face|@media|@keyframes|@-webkit-keyframes|@-moz-keyframes|@-o-keyframes)[^\{]+)\{(([^\{\}]*\{[^\}\{]*\})+)[^\}]+\}/gi;
        let atQueries = {};

        css = css.replace(/\/\*[\s\S]+?\*\//ig, '');
        css = css.replace(/\}/ig, "}\n\n");
        css = css.replace(/\{/ig, " {\n\n");

        while ((mq = regexAtQuery.exec(css)) !== null) {
            let atQuery = mq[1].trim();
            if (!atQueries[atQuery]) {
                atQueries[atQuery] = [];
            }

            atQueries[atQuery].push({
                original: mq[0],
                innerCss: mq[3].trim()
            });
        }

        let atKeysExp = new RegExp('(@keyframes|@-webkit-keyframes|@-moz-keyframes|@-o-keyframes)', 'ig');

        // remove media queries from css
        Object.keys(atQueries).forEach(mediaquery => {
            let rules = atQueries[mediaquery];
            rules.forEach((element) => {
                css = css.replace(element.original, '');
                element.innerCss = cleanCss(element.innerCss, atKeysExp.test(mediaquery));
                if (element.innerCss.trim() !== '') {
                    output += mediaquery + '{' + element.innerCss + '}';
                }
            });
        });

        output = cleanCss(css, false) + output;

        function cleanCss(cssToClean, isAtRule) {
            const regexRules = /(([^\s]+[^}]+){([^}]+)})/gi;
            let rules = {};

            while ((r = regexRules.exec(cssToClean)) !== null) {

                let selector = r[2].toString().trim();

                let properties = r[3].split(/;|\n/).map((o) => {
                    return o.trim();
                });

                properties = properties.filter((o) => {
                    return o.toString().trim() !== ''
                });

                if (isAtRule === false) {
                    let selectors = selector.split(',');

                    selectors = selectors.map((o) => {
                        return o.toString().trim();
                    });

                    let newSel = [];

                    for (let i in selectors) {
                        let sel = selectors[i];

                        if (selectorExists(sel) !== false) {
                            newSel.push(sel);
                        }
                    }

                    if (newSel.length === 0) {
                        continue;
                    } else {
                        selector = newSel.join(',');
                    }
                }

                if (!rules[selector]) {
                    rules[selector] = [];
                }

                rules[selector] = properties.concat(rules[selector]);
                rules[selector] = arrUnique(rules[selector]);
            }

            let newCss = '';
            Object.keys(rules).forEach(k => {
                newCss += k + '{' + rules[k].join(';') + ';}';
            });
            return newCss;
        }

        return output;
    }

    function arrUnique(data) {
        let uniqueArray = [];
        do {
            let item = data.splice(0, 1).toString();
            if (data.indexOf(item) === -1) {
                uniqueArray.push(item.toString());
            }
        } while (data.length > 0);
        return uniqueArray;
    }

    function selectorExists(selector) {
        if (options.path) {
            let files = glob.sync(options.path, options.globOptions);
            for (let i in files) {
                let file = files[i];
                if (options.exclude.indexOf(file) >= 0) {
                    continue;
                }
                let content = fs.readFileSync(file).toString();

                let regex = /(?=\S*[-*]?)([a-zA-Z-*]+)/ig;
                let m = null;

                while ((m = regex.exec(selector)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    if (m[0] === '*') {
                        return true;
                    }

                    let wordExp = new RegExp(m[0], 'ig');
                    if (wordExp.test(content)) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }
};
