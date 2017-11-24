import React from "react";
import PropTypes from "prop-types";

/**
 * Example:
 *
 * const IncrementMutation = gql`
 *  mutation Increment($num: Number! = 1) {
 *    increment(num: $num) {
 *      count
 *    }
 * }
 * `
 *
 * <Mutate gql={IncrementMutation}>{(incr, {loading, error, data: {increment: count}}) =>
 *   <div>
 *     Current count: {loading ? '...' : count || 0}
 *     <button onClick={incr}>Increment</button>
 *   </div>
 * }</Mutate>
 */
export class Mutate extends React.Component {
  constructor() {
    super();
    this.mutate = this.mutate.bind(this);
    this.state = {
      data: {},
      loading: false
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  mutate(variables) {
    const { client } = this.context.apollo;
    const { gql, refetchQueries, optimisticResponse, update } = this.props;
    const req = client.mutate({
      mutation: gql,
      refetchQueries,
      optimisticResponse,
      update,
      variables
    });

    this.setState({ loading: true });

    req
      .then(res => {
        if (this.mounted) {
          this.setState(
            Object.assign({}, res, { error: null, loading: false })
          );
        }
      })
      .catch(error => {
        if (this.mounted) {
          this.setState({ error, loading: false });
        }
      });

    return req;
  }

  render() {
    // <Mutate fail> will throw the error instead of using the callback
    if (this.props.fail && state.error) {
      throw state.error;
    }

    return (this.props.render || this.props.children)(this.mutate, this.state);
  }
}

Mutate.contextTypes = {
  apollo: PropTypes.shape({
    client: PropTypes.object.isRequired
  }).isRequired
};

Mutate.propTypes = {
  // A graphql-tag compiled gql query
  gql: PropTypes.object.isRequired,

  // Fail by throwing an exception and letting the React error boundary
  // take care of it instead of passing the error into the render callback
  fail: PropTypes.bool,

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-refetchQueries
  refetchQueries: PropTypes.array,

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-optimisticResponse
  optimisticResponse: PropTypes.func,

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-update
  update: PropTypes.func,

  // Render using either the `children`- or a `render`-prop callback
  children: PropTypes.func,
  render: PropTypes.func
};
