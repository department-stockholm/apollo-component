import buble from "rollup-plugin-buble";

export default [
  {
    input: "index.js",
    output: {
      format: "es",
      file: "dist/index.esm.mjs"
    },
    external: ["react", "react-dom", "react-dom/server", "prop-types"],
    plugins: [buble()]
  },
  {
    input: "index.js",
    output: {
      format: "cjs",
      file: "dist/index.cjs.js",
      exports: "named"
    },
    external: ["react", "react-dom", "react-dom/server", "prop-types"],
    plugins: [buble()]
  },
  {
    input: "index.js",
    output: {
      format: "umd",
      name: "ApolloComponent",
      file: "dist/browser.js",
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "prop-types": "PropTypes"
      }
    },
    external: ["react", "react-dom", "react-dom/server", "prop-types"],
    plugins: [buble()]
  }
];
