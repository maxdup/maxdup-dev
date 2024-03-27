const fs = require('fs');

const HtmlWebpackPlugin = require("html-webpack-plugin");

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

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

class ExtractLocStrings {
  apply(compiler) {
    compiler.hooks.compilation.tap("ExtractLocStrings", (compilation) => {

      HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
        "ExtractLocString",
        (data, cb) => {
          const registry = {};
          const jsdom = require("jsdom");
          const dom = new jsdom.JSDOM(data.html);
          dom.window.document.querySelectorAll("[data-localize-text]").forEach((node) => {
            const locStr = node.innerHTML.trim();
            const hash = cyrb53(locStr);
            node.setAttribute('data-localize-text', hash);
            registry[hash] = locStr;
          });

          const locStrings = JSON.stringify(registry, undefined, 4);
          fs.writeFileSync("./localization/en.json", locStrings);
          data.html = dom.serialize();
          cb(null, data);
        },
      );
    });
  }
}

module.exports = ExtractLocStrings;
