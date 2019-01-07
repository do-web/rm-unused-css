/**
 *  Simple remove unused and duplicated css
 *  Works with @ queries and normal styles
 */

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
    let allfilesContent = '';

    if (options.path) {
        let files = glob.sync(options.path, options.globOptions);
        for (let i in files) {
            let file = files[i];
            if (options.exclude.indexOf(file) >= 0) {
                continue;
            }
            allfilesContent += fs.readFileSync(file).toString();
        }
    }

    if (typeof cssFiles === 'string') {
        let cssData = '';

        if (fs.existsSync(cssFiles)) {
            cssData = fs.readFileSync(cssFiles).toString();
        } else {
            cssData = cssFiles;
            isString = true;
        }

        let newContent = cleanCssFile(cssData).replace(/\n|\r\n/ig, '');
        if (isString === false && options.override) {
            fs.writeFileSync(cssFiles, newContent);
        }

        if (typeof callback === 'function') {
            callback(isString ? null : cssFiles, newContent);
        }
    } else {
        cssFiles.forEach((file) => {
            let cssData = fs.readFileSync(file).toString();
            let newContent = cleanCssFile(cssData).replace(/\n|\r\n/ig, '');
            if (options.override) {
                fs.writeFileSync(file, newContent);
            }
            callback(file, newContent);
        });
    }

    function removeComments(css) {
        let slashFound = false;
        let endStarFound = false;
        let commentFound = false;
        let chars = css.split('');
        let cleaned = '';

        for (let i in chars) {

            if (slashFound === false && chars[i] === '/') {
                slashFound = true;
                continue;
            }
            if (slashFound === true && chars[i] === '*') {
                commentFound = true;
                continue;
            }

            if (endStarFound === false && chars[i] === '*') {
                endStarFound = true;
                continue;
            } else {
                endStarFound = false;
            }

            if (endStarFound && chars[i] === '/') {
                commentFound = false;
                continue;
            }

            cleaned += chars[i];
        }
        return cleaned;
    }

    function tokenizer(css) {
        css = removeComments(css);

        let chars = css.split('');
        let styles = {};
        let count = 0;
        let selector = '';
        let readSelector = true;
        let selectorContent = '';

        for (let i in chars) {

            if (chars[i] === '{') {
                readSelector = false;
                count++;
            }

            if (chars[i] === '}') {
                count--;
            }


            if (readSelector) {
                selector += chars[i];
            } else {
                selectorContent += chars[i];
            }


            if (readSelector === false && count === 0) {

                readSelector = true;
                selector = selector.trim();
                selectorContent = selectorContent.trim().substr(1).slice(0, -1).replace(/\n|\r\n|\s{2,}/ig, '');

                if (selector.indexOf('@') >= 0 && selector.indexOf('@font-face') < 0) {

                    let atContent = tokenizer(selectorContent);

                    if (typeof styles[selector] === 'undefined') {
                        styles[selector] = atContent;

                    } else {
                        for (let i in atContent) {

                            if (typeof styles[selector][i] !== 'undefined') {
                                styles[selector][i] += atContent[i] + (atContent[i].slice(-1) === ';' ? '' : ';');

                            } else {
                                styles[selector][i] = atContent[i] + (atContent[i].slice(-1) === ';' ? '' : ';');

                            }
                        }
                    }

                } else {
                    if (typeof styles[selector] === 'undefined') {
                        styles[selector] = '';
                    }

                    styles[selector] += selectorContent + (selectorContent.slice(-1) === ';' ? '' : ';');
                }

                selectorContent = '';
                selector = '';
            }
        }

        return styles;
    }

    function processStyles(styles) {
        let rules = {};
        for (let i in styles) {

            let selector = i;
            let selectorContent = styles[i];

            if (typeof styles[i] === 'object') {
                continue;
            }

            let properties = selectorContent.split(/;|\n/).map((o) => {
                return o.trim();
            }).filter((o) => {
                return o.toString().trim() !== ''
            });

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
                newSel.sort();
                selector = newSel.join(',');
            }

            if (!rules[selector]) {
                rules[selector] = [];
            }

            rules[selector] = rules[selector].concat(properties);
            rules[selector] = uniqueProps(rules[selector]);
        }
        return rules;
    }

    function cleanCssFile(css) {
        let output;
        css = css.replace(/@charset[^;]+;?/ig, '');
        output = cleanCss(css);

        function cleanCss(cssToClean) {

            let styles = tokenizer(cssToClean);
            let rules = processStyles(styles);

            let newCss = '';
            Object.keys(rules).forEach(k => {
                newCss += k + '{' + rules[k].join(';') + '}';
            });

            let objSelectors = {};
            for (let i in styles) {
                if (typeof styles[i] === 'object') {
                    objSelectors[i] = styles[i];
                }
            }

            for (let i in objSelectors) {
                let rules = processStyles(objSelectors[i]);
                let newCssInner = '';
                Object.keys(rules).forEach(k => {
                    newCssInner += k + '{' + rules[k].join(';') + '}';
                });
                if (newCssInner.length) {
                    newCss += i + '{' + newCssInner + '}';
                }
            }

            return newCss;
        }

        return output;
    }

    function uniqueProps(data) {
        let uniqueProps = {};
        for (let i in data) {
            let s = data[i].split(':');
            uniqueProps[s[0]] = s[1];
        }
        data = [];
        for (let i in uniqueProps) {
            data.push(i + ':' + uniqueProps[i]);
        }
        return data;
    }

    function selectorExists(selector) {
        if (options.path) {
            selector = selector.replace(/(:before|:after)/ig, '');

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
                if (wordExp.test(allfilesContent)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
};
