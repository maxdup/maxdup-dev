module.exports = {
  'files': [
    './icons/*.svg',
    '../../node_modules/simple-icons/icons/github.svg*',
    '../../node_modules/simple-icons/icons/linkedin.svg*',
    '../../node_modules/boxicons/svg/regular/bx-menu.svg*',
    '../../node_modules/boxicons/svg/solid/bxs-phone.svg*',
    '../../node_modules/boxicons/svg/solid/bxs-envelope.svg*',
    '../../node_modules/boxicons/svg/solid/bxs-file.svg*',
    '../../node_modules/boxicons/svg/solid/bxs-map.svg*',
    '../../node_modules/boxicons/svg/solid/bxs-flag-alt.svg*',
    '../../node_modules/boxicons/svg/regular/bx-sun.svg*',
    '../../node_modules/boxicons/svg/regular/bx-moon.svg*',
  ],
  'fontName': 'maxdup_icons',
  'cssTemplate': './maxdup-icons.css.hbs',
  'baseSelector': '.mdi',
  'types': ['eot', 'woff', 'woff2', 'ttf', 'svg'],
  'fixedWidth': false,
  'fileName': 'app.[fontname].[chunkhash].[ext]',

  // html doc
  'html': true,
  'htmlTemplate': './maxdup-icons.html.hbs',

  // file output
  'dest': './static',
  'writeFiles': true
};
