import React from "react";
import PropTypes from "prop-types";

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
export class Query extends React.Component {
  constructor() {
    super();
    this.refetch = this.refetch.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
  }

  componentWillMount() {
    const { client, queries } = this.context.apollo;

    this.observable = client.watchQuery(propsToOptions(this.props));

    if (!this.props.lazy && queries) {
      queries.push(this.observable);
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

    if (this.observable) {
      delete this.observable;
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.gql !== this.props.gql) {
      return this.request(nextProps);
    }
    if (!shallowEquals(this.props.variables, nextProps.variables)) {
      return this.request(nextProps);
    }
  }

  request(props) {
    this.observable.setOptions(propsToOptions(props));

    if (!this.subscription) {
      const update = () => {
        if (this.mounted) {
          this.forceUpdate();
        }
      };
      this.subscription = this.observable.subscribe({
        next: update,
        error: update
      });
    }
  }

  getState() {
    const currentResult = this.observable.currentResult();
    const { loading, error } = currentResult;
    const data = {};
    // Let's do what we can to give the user data
    if (loading) {
      Object.assign(data, this.previousData, currentResult.data);
    } else if (error) {
      Object.assign(data, (this.observable.getLastResult() || {}).data);
    } else {
      this.previousData = currentResult.data;
      Object.assign(data, currentResult.data);
    }
    return {
      loading,
      error,
      data
    };
  }

  refetch(vars) {
    if (this.observable) {
      return this.observable.refetch(vars);
    }
  }

  fetchMore(opts) {
    if (this.observable) {
      return this.observable.fetchMore(opts);
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

    // <Query render={() => {}}/> or <Query>{() => {}}</Query>
    return (this.props.render || this.props.children)(
      Object.assign({}, state, {
        refetch: this.refetch,
        fetchMore: this.fetchMore
      })
    );
  }
}

Query.contextTypes = {
  apollo: PropTypes.shape({
    client: PropTypes.object.isRequired,
    queries: PropTypes.array
  }).isRequired
};

Query.propTypes = {
  // A graphql-tag compiled gql query
  gql: PropTypes.object.isRequired,

  // Variables passed into the query
  variables: PropTypes.object,

  // Wait for loading to complete before rendering anything instead of
  // passing loading boolean into the render callback
  wait: PropTypes.bool,

  // Lazy load server side
  lazy: PropTypes.bool,

  // Fail by throwing an exception and letting the React error boundary
  // take care of it instead of passing the error into the render callback
  fail: PropTypes.bool,

  // The time interval (in milliseconds) on which this query should be
  // refetched from the server.
  pollInterval: PropTypes.number,

  // Specifies the fetch policy to be used for this query
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy
  fetchPolicy: PropTypes.oneOf([
    "cache-first",
    "cache-and-network",
    "network-only",
    "cache-only"
  ]),

  // Specifies the error policy to be used for this query
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-errorPolicy
  errorPolicy: PropTypes.oneOf(["none", "ignore", "all"]),

  // Whether or not updates to the network status should trigger next on the observer of this query
  notifyOnNetworkStatusChange: PropTypes.bool,

  // Context to pass to ApolloLink
  // see https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context
  context: PropTypes.object
};

const propsToOptions = ({
  gql,
  variables,
  pollInterval,
  fetchPolicy,
  errorPolicy,
  notifyOnNetworkStatusChange,
  context
}) => ({
  query: gql,
  variables,
  pollInterval,
  fetchPolicy,
  errorPolicy,
  notifyOnNetworkStatusChange,
  context
});

function shallowEquals(a, b) {
  for (let key in a) if (a[key] !== b[key]) return false;
  for (let key in b) if (!(key in a)) return false;
  return true;
}
