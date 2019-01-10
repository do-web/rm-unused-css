/**
 *  Simple remove unused and duplicated css
 *  Works with @ queries and normal styles
 */

const glob = require('glob');
const fs = require('fs');

module.exports = (cssFilesOrContent, options) => {

    return new Promise((resolve) => {
        let defaults = {
            path: '**/+(*.html|*.htm|*.js)',
            content: null,
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
        } else if (options.content) {
            allfilesContent = options.content;
        }

        if (typeof cssFilesOrContent === 'string') {
            let cssData = '';

            if (fs.existsSync(cssFilesOrContent)) {
                cssData = fs.readFileSync(cssFilesOrContent).toString();
            } else {
                cssData = cssFilesOrContent;
                isString = true;
            }

            if (cssData.length) {
                let newContent = cleanCssFile(cssData).replace(/\n|\r\n/ig, '');
                if (isString === false && options.override) {
                    fs.writeFileSync(cssFilesOrContent, newContent);
                }
                resolve({file: isString ? null : cssFilesOrContent, newContent: newContent});
            } else {
                resolve({file: isString ? null : cssFilesOrContent, newContent: cssData});
            }
        } else {
            cssFilesOrContent.forEach((file) => {
                let cssData = fs.readFileSync(file).toString();
                if (cssData.length) {
                    let newContent = cleanCssFile(cssData).replace(/\n|\r\n/ig, '');
                    if (options.override) {
                        fs.writeFileSync(file, newContent);
                    }
                }
            });
            resolve({file: cssFilesOrContent});
        }

        /**
         * Remove CSS comments
         * @param css
         * @returns {string}
         */
        function removeComments(css) {
            let commentFound = false;
            let chars = css.split('');
            let cleaned = '';

            for (let i = 0; i < chars.length; i++) {

                if (commentFound === false) {
                    if (chars[i] === '/' && chars[i + 1] === '*') {
                        commentFound = true;
                        i++;
                    } else {
                        cleaned += chars[i];
                    }

                } else {
                    if (chars[i] === '*' && chars[i + 1] === '/') {
                        commentFound = false;
                        i++;
                    }
                }
            }
            return cleaned;
        }

        /**
         * Parse CSS and return all styles uncleaned
         * @param css
         */
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

                    if (selector.indexOf('@') >= 0 && selector.indexOf('@-moz-document') >= 0) {
                        // skip moz because it is not supported anymore
                    } else if (selector.indexOf('@') >= 0 && selector.indexOf('@font-face') < 0 && selector.indexOf('@page') < 0) {

                        let atContent = tokenizer(selectorContent);

                        if (typeof styles[selector] === 'undefined') {
                            styles[selector] = atContent;
                        } else {
                            for (let i in atContent) {
                                if(typeof atContent[i] === 'string') {
                                    if (typeof styles[selector][i] !== 'undefined') {
                                        styles[selector][i] += atContent[i] + (atContent[i].slice(-1) === ';' ? '' : ';');
                                    } else {
                                        styles[selector][i] = atContent[i] + (atContent[i].slice(-1) === ';' ? '' : ';');
                                    }
                                } else {
                                    console.error('Selector not supported: ' + i);
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

        /**
         * Returns all selectors with cleaned content
         * @param styles
         */
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

        /**
         * Cleanup CSS
         * @param css
         * @returns {string}
         */
        function cleanCssFile(css) {
            let cssToClean = css.replace(/@charset[^;]+;?/ig, '');
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

        /**
         * Make the css props unique
         * @param data
         * @returns {*}
         */
        function uniqueProps(data) {
            let uniqueProps = {}, selctorData, prop, val;
            for (let i in data) {
                selctorData = data[i];
                prop = selctorData.substr(0, selctorData.indexOf(':')).trim();
                val = selctorData.substr(selctorData.indexOf(':') + 1).trim();
                uniqueProps[prop] = val;
            }
            data = [];
            for (let i in uniqueProps) {
                data.push(i + ':' + uniqueProps[i]);
            }
            return data;
        }

        /**
         * Check if the selector is used in html or js
         * @param selector
         * @returns {boolean}
         */
        function selectorExists(selector) {
            // remove css escapes
            selector = selector.replace(/\\/g, '');
            // remove pseudo
            selector = selector.replace(/((:{1,2}(root|after|before|active|visited|focus|first-letter|first-line|selection|checked|disabled|empty|enabled|first-of-type|hover|in-range|invalid|last-child|last-of-type|link|only-of-type|only-child|optional|out-of-range|read-only|read-write|required|root|target|valid))|\*)$/g, '');
            selector = selector.replace(/:{1,2}((not|lang|nth-child|nth-last-child|nth-last-of-type|nth-of-type|)\([^\)]+\))$/g, '');

            if ((options.path || options.content) && selector.length) {
                // detect class names
                let regex = /(?=\S*[-*]?)([a-zA-Z-*_/\\0-9:]+)/g;
                let m = null;

                while ((m = regex.exec(selector)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    let val = m[0];

                    if (val === '*') {
                        return true;
                    }

                    let wordExp = new RegExp(val, 'g');

                    if (wordExp.test(allfilesContent)) {
                        return true;
                    }
                }
                return false;
            }
            return true;
        }
    })
};
