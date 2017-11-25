import { createElement, Children } from "react";
import { Provider } from "./Provider";

export const renderState = (
  client,
  component,
  { maxDepth = Infinity } = {}
) => {
  const render = (depth = 0) => {
    if (depth < maxDepth) {
      const queries = [];
      renderElement(createElement(Provider, { client, queries }, component));
      const queue = queries
        .filter(q => q.currentResult().loading)
        .map(q => q.result());
      if (queue.length) {
        return (
          // wait for results then try to go
          // deeper if we succeed
          Promise.all(queue).then(() => render(depth + 1))
        );
      }
    }
    return Promise.resolve();
  };
  return render();
};

const renderElement = (element, context = {}) => {
  if (Array.isArray(element)) {
    // react 16 array of children
    element.forEach(c => c && renderElement(c, context));
  } else if (typeof element.type == "function") {
    // stateless component or class
    let child;
    let childContext = context;
    const Component = element.type;
    const props = Object.assign({}, Component.defaultProps, element.props);

    if (Component.prototype && Component.prototype.isReactComponent) {
      // react class
      const instance = new Component(props, context);
      instance.props = instance.props || props;
      instance.context = instance.context || context;
      instance.state = instance.state || null;
      instance.setState = newState => {
        if (typeof newState === "function") {
          newState = newState(instance.state, instance.props, instance.context);
        }
        instance.state = Object.assign({}, instance.state, newState);
      };
      if (instance.componentWillMount) {
        instance.componentWillMount();
      }
      if (instance.getChildContext) {
        childContext = Object.assign({}, context, instance.getChildContext());
      }
      child = instance.render();
    } else {
      // stateless function
      child = Component(props, context);
    }

    Array.of(child).forEach(c => c && renderElement(c, childContext));
  } else if (element.props && element.props.children) {
    // an element with children
    Children.forEach(
      element.props.children,
      c => c && renderElement(c, context)
    );
  }
};
