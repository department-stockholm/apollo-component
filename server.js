import React from "react";
import { render } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "./Provider";

function renderToDOM(component) {
  render(component, document.createDocumentFragment());
}

export const renderState = (
  client,
  component,
  { maxDepth = Infinity } = {}
) => {
  const renderer = client.ssrMode ? renderToStaticMarkup : renderToDOM;

  const render = (depth = 0) => {
    const queries = [];

    renderer(
      <Provider client={client} queries={queries}>
        {component}
      </Provider>
    );

    const queue = queries
      .filter(q => q.currentResult().loading)
      .map(q => q.result());

    if (queue.length) {
      return (
        Promise.all(queue)
          // try to go deeper if we succeed
          .then(() => depth < maxDepth && render(depth + 1))
      );
    }

    return Promise.resolve();
  };

  return render();
};
