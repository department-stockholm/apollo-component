import babel from "rollup-plugin-babel";

const plugins = () => [
  babel({
    babelrc: false,
    exclude: "node_modules/**",
    plugins: [
      "babel-plugin-transform-object-rest-spread",
      "babel-plugin-transform-class-properties",
      "babel-plugin-external-helpers"
    ],
    presets: [
      [
        "env",
        {
          modules: false
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
    external: ["react", "prop-types"],
    plugins: plugins()
  },
  {
    input: "index.js",
    output: {
      format: "cjs",
      file: "dist/index.cjs.js",
      exports: "named"
    },
    external: ["react", "prop-types"],
    plugins: plugins()
  }
];
