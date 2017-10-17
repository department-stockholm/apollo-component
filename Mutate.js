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
  static contextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired
    }).isRequired
  };

  state = {
    data: {},
    loading: false
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  mutate = variables => {
    const { gql, refetchQueries, optimisticResponse, update } = this.props;
    const req = this.context.apollo.client.mutate({
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
          this.setState({ ...res, loading: false });
        }
      })
      .catch(error => {
        if (this.mounted) {
          this.setState({ error, loading: false });
        }
      });

    return req;
  };

  render() {
    return this.props.children(this.mutate, this.state);
  }
}
