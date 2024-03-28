const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString().substr(0, 8);
};

function readLocs(locale){
  try {
    return JSON.parse(fs.readFileSync(`./localization/locStrings.json`));
  } catch {
    return {}
  }
}

function writeLocs(registry, locale){
  const locStrings = JSON.stringify(registry, Object.keys(registry).sort(), 4);
  fs.writeFileSync(`./localization/locStrings.json`, locStrings);
}

function applyUpdate(locStrings, sourceStrings, locale, isBase){
  const strings = Object.assign({}, locStrings);
  if (isBase){

    let basedStrings = Object.fromEntries(Object.entries(sourceStrings).map(
      ([k, v]) => [k+":"+locale, v]));
    return Object.assign({}, strings, basedStrings);
  } else {
    return Object.assign({}, Object.keys(sourceStrings).reduce(
      (acc,curr)=> (acc[curr + ":" + locale]='---TODO---',acc),{}), strings);
  }
}

function extractStrings(domString, baseLocale){
  const jsdom = require('jsdom');
  const dom = new jsdom.JSDOM(domString);
  const sourceStrings = {};
  dom.window.document.querySelectorAll('[data-localize-text]').forEach((node) => {
    const locStr = node.innerHTML.trim();
    const hash = cyrb53(locStr);
    node.setAttribute('data-localize-text', hash);
    sourceStrings[hash] = locStr;
  });
  const html = dom.serialize();
  return {sourceStrings, html};
}

class ExtractLocStrings {

  constructor(options){
    this.baseLocale = 'en-US';
    this.locales = options.locales;
    if (options.locales.length == 0){
      this.baseLocale = options.locales[0];
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ExtractLocStrings', (compilation) => {

      HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
        'ExtractLocString',
        (data, cb) => {
          const {sourceStrings, html} = extractStrings(data.html, this.baseLocale);

          const oldStrings = readLocs();
          let locStrings = {};
          this.locales.forEach((locale) => {
            const strings = applyUpdate(oldStrings, sourceStrings, locale, locale == this.baseLocale);
            locStrings = Object.assign(locStrings, strings);
          });

          writeLocs(locStrings);

          data.html = html;
          cb(null, data);
        },
      );
    });
  }
}

module.exports = ExtractLocStrings;
