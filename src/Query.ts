import React from "react";
import PropTypes from "prop-types";
import { DocumentNode } from "graphql";

import { isPlainObject, debounce, shallowEquals } from "./util";

export interface SkipFunc {
  (vars: object): boolean;
}

export interface RenderArgs<T> {
  data: T;
  error?: Error;
  skipped: boolean;
  loading: boolean;
  refetch: Function;
  fetchMore: Function;
}

export interface RenderFunc<T> {
  (args: RenderArgs<T>): React.ReactNode;
}

export type QueryProps<T> = {
  // A graphql-tag compiled gql query
  gql: DocumentNode;

  // Variables passed into the query
  variables: object;

  // Wait for loading to complete before rendering anything instead of
  // passing loading boolean into the render callback
  wait?: boolean;

  // Lazy load server side
  lazy?: boolean;

  // Control if query should be skipped.
  // Set to `true` and control the query using `refetch()`
  // or to a function which accepts the current variables
  // and returns a boolean controling if a request should
  // be made. Rendering will still happen, with a skipped flag
  skip?: boolean | SkipFunc;

  // Fail by throwing an exception and letting the React error boundary
  // take care of it instead of passing the error into the render callback
  fail?: boolean;

  // The time interval (in milliseconds) on which this query should be
  // refetched from the server.
  pollInterval?: number;

  // Specifies the fetch policy to be used for this query
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy
  fetchPolicy?:
    | "cache-first"
    | "cache-and-network"
    | "network-only"
    | "cache-only";

  // Specifies the error policy to be used for this query
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-errorPolicy
  errorPolicy?: "none" | "ignore" | "all";

  // Whether or not updates to the network status should trigger next on the observer of this query
  notifyOnNetworkStatusChange?: boolean;

  // Context to pass to ApolloLink
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context
  context?: object;

  // Render using either the `children`- or a `render`-prop callback
  children?: RenderFunc<T> | React.ReactNode;
  render?: RenderFunc<T>;
};

export type QueryContext = {
  apollo?: any;
};

/**
 * Example:
 *
 * <Query gql={ListUsersQuery} variables={{count: 10, start: 1}}>{({data: {users}, loading, error}) =>
 *  loading
 *    ? <Spinner />
 *    : error
 *      ? <Message error={error} />
 *      : <UserList users={users} />
 * }</Query>
 */
export class Query<T = any> extends React.Component<QueryProps<T>> {
  static contextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired,
      queued: PropTypes.array
    }).isRequired
  };

  state = {
    skipped: this.shouldSkip(this.props)
  };

  mounted = false;

  subscription = null;
  _o = null;
  previousData = {};

  constructor(props: QueryProps<T>, context: QueryContext) {
    super(props, context);
    this.refetch = this.refetch.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
  }

  componentWillMount() {
    const { queued = null } = this.context.apollo || {};

    // skip rendering if no
    if (!this.props.lazy && !this.state.skipped && queued) {
      queued.push(this.observable);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.request(this.props);
  }

  componentWillUnmount() {
    this.mounted = false;

    if (this.subscription) {
      this.subscription.unsubscribe();
      delete this.subscription;
    }

    if (this._o) {
      delete this._o;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gql !== this.props.gql) {
      return this.request(nextProps);
    }
    if (
      typeof nextProps.skip === "boolean" &&
      nextProps.skip !== this.props.skip
    ) {
      return this.request(nextProps);
    }
    if (!shallowEquals(this.props.variables, nextProps.variables)) {
      return this.request(nextProps);
    }
  }

  get observable() {
    if (this._o) {
      return this._o;
    }
    const { client = null } = this.context.apollo || {};
    if (!client) {
      throw new Error(
        "missing apollo client in context. is there a <Provider /> ancestor component?"
      );
    }
    return (this._o = client.watchQuery(propsToOptions(this.props)));
  }

  request(props) {
    const skipped = this.shouldSkip(props);
    // set state to make sure we render even
    // if the request is skipped
    this.setState({ skipped });
    if (skipped) {
      // skip the actual query
      return;
    }

    this.observable.setOptions(propsToOptions(props));

    if (!this.subscription) {
      const update = debounce(() => {
        if (this.mounted) {
          this.forceUpdate();
        }
      });
      this.subscription = this.observable.subscribe({
        next: update,
        error: update
      });
    }
  }

  // check if we want to skip the query
  // ex. show suggestions if there's not enough of characters
  // or if we don't have any previous results
  // otherwise show the loading bar while loading (the first time)
  // or the results:
  //  <Query
  //    gql={SearchQuery}
  //    skip={({q}) => q.length < 2}
  //    variables={{q: "skipped"}}
  //    render={({data: {results}, skipped, loading}) =>
  //       skipped || !results
  //         ? <Suggestions />
  //         : loading
  //           ? <Loader />
  //           : <Results {...results} />
  //    }
  //  />
  shouldSkip(props: QueryProps<T>): boolean {
    if (typeof props.skip === "function") {
      return !!props.skip(props.variables);
    } else if (typeof props.skip === "boolean") {
      return props.skip;
    }
    return false;
  }

  getState() {
    const currentResult = this.observable.currentResult();
    const { loading, error } = currentResult;
    const { skipped } = this.state;
    const data: any = {};

    // Let's do what we can to give the user data
    if (error) {
      Object.assign(data, (this.observable.getLastResult() || {}).data);
    } else {
      Object.assign(data, this.previousData, currentResult.data);
    }
    this.previousData = data;
    return {
      skipped,
      loading,
      error,
      data
    };
  }

  refetch(vars = this.props.variables) {
    if (this.observable) {
      // special case for when vars are event
      // ex. <button onClick={refetch} />
      const req = this.observable.refetch(
        isPlainObject(vars) ? vars : undefined
      );
      // when not wait we trigger a render
      // so that a loader can be shown
      if (!this.props.wait) {
        this.forceUpdate();
      }
      return req;
    }
  }

  fetchMore(opts) {
    if (this.observable) {
      const req = this.observable.fetchMore(opts);
      // when not wait we trigger a render
      // so that a loader can be shown
      if (!this.props.wait) {
        this.forceUpdate();
      }
      return req;
    }
  }

  render() {
    const state = this.getState();

    // <Query wait> will not render while loading the first time
    if (this.props.wait && state.loading) {
      return null;
    }

    // <Query fail> will throw the error instead of using the callback
    if (this.props.fail && state.error) {
      throw state.error;
    }

    let fn: RenderFunc<T> = this.props.render;
    if (!fn && typeof this.props.children === "function") {
      fn = this.props.children;
    }

    const args: RenderArgs<T> = Object.assign({}, state, {
      refetch: this.refetch,
      fetchMore: this.fetchMore
    });

    // <Query render={() => {}}/> or <Query>{() => {}}</Query>
    return fn(args);
  }
}

function propsToOptions<T>({
  gql,
  variables,
  pollInterval,
  fetchPolicy,
  errorPolicy,
  notifyOnNetworkStatusChange,
  context
}: QueryProps<T>) {
  return {
    query: gql,
    variables,
    pollInterval,
    fetchPolicy,
    errorPolicy,
    notifyOnNetworkStatusChange,
    context
  };
}
