import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "./Provider";

export const renderState = (client, component, { depth = Infinity } = {}) => {
  if (!client.ssrMode) {
    return Promise.resolve();
  }

  const render = () => {
    const queries = [];
    renderToStaticMarkup(
      createElement(Provider, { client, queries }, component)
    );

    const queue = queries
      .filter(q => q.currentResult().loading)
      .map(q => q.result());

    if (queue.length) {
      return Promise.all(queue).then(() => {
        if (--depth > 0) {
          return render();
        }
      });
    }
  };

  return render();
};
