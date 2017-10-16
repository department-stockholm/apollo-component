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

  state = {
    loading: true
  };

  componentDidMount() {
    // TODO figure out SSR? can we just queue up queries in
    //      the provider? or traverse the tree like in react-apollo?
    this.mounted = true;
    this.request();
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
      return this.request();
    }
    if (!shallowEquals(this.props.variables, nextProps.variables)) {
      return this.request();
    }
  }

  request = async () => {
    const { gql, variables } = this.props;
    // TODO more options
    const options = {
      query: gql,
      variables
    };

    if (this.observable) {
      this.observable.setOptions(options);
    } else {
      this.observable = this.context.apollo.client.watchQuery(options);
      this.subscription = this.observable.subscribe({
        next: this.onNext,
        error: this.onError
      });
    }
  };

  onNext = results => {
    if (this.mounted) {
      console.error("next", results);
      this.setState(results);
    }
  };

  onError = error => {
    if (this.mounted) {
      console.error("error", error);
      this.setState({ error });
    }
  };

  refetch = vars => this.observable && this.observable.refetch(vars);
  fetchMore = opts => this.observable && this.observable.fetchMore(opts);

  render() {
    // FIXME <Query wait> will not render while loading the first time
    if (this.props.wait && this.state.loading) {
      return null;
    }
    return this.props.children({
      ...this.state,
      refetch: this.refetch,
      fetchMore: this.fetchMore
    });
  }
}

function shallowEquals(a, b) {
  for (let key in a) if (a[key] !== b[key]) return false;
  for (let key in b) if (!(key in a)) return false;
  return true;
}
