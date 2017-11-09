import babel from "rollup-plugin-babel";

const plugins = () => [
  babel({
    babelrc: false,
    exclude: "node_modules/**",
    plugins: [
      "babel-plugin-transform-object-rest-spread",
      "babel-plugin-transform-class-properties"
    ],
    presets: [
      [
        "env",
        {
          loose: true,
          modules: false,
          targets: {
            browsers: ["last 2 versions", "IE >= 9"]
          }
        }
      ]
    ]
  })
];

export default [
  {
    input: "index.js",
    output: {
      format: "es",
      file: "dist/index.esm.mjs"
    },
    external: ["react", "react-dom/server", "prop-types"],
    plugins: plugins()
  },
  {
    input: "index.js",
    output: {
      format: "cjs",
      file: "dist/index.cjs.js",
      exports: "named"
    },
    external: ["react", "react-dom/server", "prop-types"],
    plugins: plugins()
  }
];
