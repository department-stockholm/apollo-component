import React from "react";
import PropTypes from "prop-types";

import { isPlainObject } from "./util";

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
    // special case for when vars are event
    // ex. <button onClick={mutate} />
    if (!isPlainObject(variables)) {
      variables = undefined;
    }
    // default to variables prop
    if (typeof variables == "undefined") {
      variables = this.props.variables;
    }
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
    if (this.props.fail && this.state.error) {
      throw this.state.error;
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

  // Default variables passed into the Mutation
  // (when no variables are passed into the mutation callback)
  variables: PropTypes.object,

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