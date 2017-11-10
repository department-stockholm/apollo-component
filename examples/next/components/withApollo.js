import { Router } from "next/router";
import fetch from "isomorphic-unfetch";
import React from "react";
import PropTypes from "prop-types";
import { Provider, renderState } from "@department/apollo-component";
import ApolloClient, { ApolloLink, HttpLink } from "apollo-client-preset";

export default Component =>
  class extends React.Component {
    static displayName = `withApollo(${Component.displayName ||
      Component.name ||
      "<unnamed>"})`;

    static async getInitialProps(ctx) {
      // create a client in ssr mode
      // and render the state of the root component
      // to populate the cache
      const client = createClient({ ssrMode: !!ctx.req });

      // wrapping the component with a RouterContext to
      // make the next/router.withRouter HoC work
      const router = {
        pathname: ctx.pathname,
        query: ctx.query,
        asPath: ctx.asPath
      };
      await renderState(
        client,
        <RouterContext router={router}>
          <Component query={ctx.query} />
        </RouterContext>
      );

      let props = {};
      if (Component.getInitialProps) {
        props = await Component.getInitialProps(ctx);
      }
      return { ...props, state: client.cache.extract() };
    }

    // an apollo client for client side rendering
    // rehydrated with the state from ssr
    client = createClient({}, this.props.state);

    render() {
      const { url: { query } } = this.props;
      return (
        <Provider client={this.client}>
          <Component query={query} />
        </Provider>
      );
    }
  };

// RouterContext emulates the App component used in next in that it
// adds a router object to the context
class RouterContext extends React.Component {
  static childContextTypes = {
    router: PropTypes.object
  };

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    return this.props.children;
  }
}

const createClient = (opts = {}, state) => {
  const client = new ApolloClient({
    link: ApolloLink.from([auth(opts), http(opts)]),
    ...opts
  });

  if (state) {
    client.cache.restore(state);
  }
  return client;
};

const http = () =>
  new HttpLink({
    fetch,
    uri: "https://api.graph.cool/simple/v1/ciy1yx99701ou0147zvkyb6w5"
  });

const auth = ({ token }) =>
  new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        authorization: token || null
      }
    });
    return forward(operation);
  });
