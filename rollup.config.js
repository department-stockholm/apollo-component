import babel from "rollup-plugin-babel";
import { list as babelHelpersList } from "babel-helpers";

const plugins = () => [
  babel({
    babelrc: false,
    exclude: "node_modules/**",

    // fixing temporary rollup's regression, remove when rollup/rollup#1595 gets solved
    externalHelpersWhitelist: babelHelpersList.filter(
      helperName => helperName !== "asyncGenerator"
    ),

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
