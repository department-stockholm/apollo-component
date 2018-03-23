import fetch from "isomorphic-unfetch";
import React from "react";
import PropTypes from "prop-types";
import { Provider, renderState } from "@department/apollo-component";
import ApolloClient, { ApolloLink, HttpLink } from "apollo-client-preset";

type P = {
  state: any;
  url: { query: object };
};

export default (
  Component: React.ComponentType<{ query: object }> & {
    getInitialProps?: (ctx: any) => any;
  }
) =>
  class extends React.Component<P> {
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

      console.time("renderState");
      try {
        await renderState(
          client,
          <RouterContext router={router}>
            <Component query={ctx.query} />
          </RouterContext>,
          {
            maxDepth:
              ctx.query.maxDepth !== undefined ? +ctx.query.maxDepth : Infinity
          }
        );
      } catch (err) {
        // you can let the error throw here
        // or ignore it and let the client side
        // handle it inline
        console.error("failed to render state:", err);
      }
      console.timeEnd("renderState");

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
class RouterContext extends React.Component<{ router: object }> {
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

const createClient = (opts: { ssrMode?: boolean; token?: string }, state?) => {
  const client = new ApolloClient({
    link: ApolloLink.from([logs(opts), auth(opts), http(opts)]),
    ...opts
  });

  if (state) {
    client.cache.restore(state);
  }
  return client;
};

const http = ({}) =>
  new HttpLink({
    fetch,
    uri: "https://api.graph.cool/simple/v1/ciy1yx99701ou0147zvkyb6w5"
  });

const auth = ({ token = null }: { token?: string }) =>
  new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        authorization: token
      }
    });
    return forward(operation);
  });

const logs = ({}) =>
  new ApolloLink((operation, forward) => {
    const t = Date.now();
    return forward(operation).map(response => {
      console.log(
        "request for %s took %sms",
        operation.operationName,
        Date.now() - t
      );
      return response;
    });
  });