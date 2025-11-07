// Enable Babel customization on top of CRA without ejecting
module.exports = {
  babel: {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry", // avoid double polyfills
          corejs: 3
        }
      ],
      "@babel/preset-react"
    ],
    plugins: [
      [
        "@babel/plugin-transform-runtime",
        {
          corejs: false,
          helpers: true,
          regenerator: true
        }
      ],
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }]
    ]
  }
};