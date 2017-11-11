import { createElement } from "react";
import { render } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "./Provider";

function renderToDOM(component) {
  const element = document.createElement("div");
  render(component, element);
}

export const renderState = (client, component, { depth = Infinity } = {}) => {
  const renderer = client.ssrMode ? renderToStaticMarkup : renderToDOM;

  const render = () => {
    const queries = [];
    renderer(createElement(Provider, { client, queries }, component));

    const queue = queries
      .filter(q => q.currentResult().loading)
      .map(q => q.result());

    if (queue.length) {
      return (
        Promise.all(queue)
          // try to go deeper if we succeed
          .then(() => --depth && render())
      );
    }

    return Promise.resolve();
  };

  return render();
};
