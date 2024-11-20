module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  importOrder: ["^@corrector(.*)/(.*)$", "^~/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrderParserPlugins: ['importAssertions', 'typescript', 'jsx'],
};
