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
  static contextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired
    }).isRequired
  };

  componentWillMount() {
    const { client } = this.context.apollo;

    this.observable = client.watchQuery(propsToOptions(this.props));

    if (!this.props.lazy && client.ssrQueries) {
      client.ssrQueries.push(this.observable);
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

  request = props => {
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
  };

  getState = () => {
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
  };

  refetch = vars => {
    if (this.observable) {
      return this.observable.refetch(vars);
    }
  };

  fetchMore = opts => {
    if (this.observable) {
      return this.observable.fetchMore(opts);
    }
  };

  render() {
    const state = this.getState();

    // FIXME <Query wait> will not render while loading the first time
    if (this.props.wait && state.loading) {
      return null;
    }

    return this.props.children({
      ...state,
      refetch: this.refetch,
      fetchMore: this.fetchMore
    });
  }
}

const propsToOptions = ({ gql, variables }) =>
  // TODO more options
  ({
    query: gql,
    variables
  });

function shallowEquals(a, b) {
  for (let key in a) if (a[key] !== b[key]) return false;
  for (let key in b) if (!(key in a)) return false;
  return true;
}
