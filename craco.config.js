// Enable Babel customization on top of CRA without ejecting
module.exports = {
  babel: {
    // Use preset-env with usage-based polyfills for your browserslist (incl. Safari)
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: 3
        }
      ],
      "@babel/preset-react"
    ],
    plugins: [
      // Reuse helpers and avoid duplication; pairs with runtime prod dep
      [
        "@babel/plugin-transform-runtime",
        {
          // do not inject core-js here; preset-env handles polyfills via `useBuiltIns: 'usage'`
          corejs: false,
          helpers: true,
          regenerator: true,
          version: "^7.23.6"
        }
      ],
      // Babel transform plugins for class properties and private fields/methods
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }]
      // You can add more plugins here as needed
    ]
  }
};