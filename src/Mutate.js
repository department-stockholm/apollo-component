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

  async mutate(vars) {
    const { variables } = this.props;

    // special case for when vars are event
    // ex. <button onClick={mutate} />
    if (!isPlainObject(vars)) {
      vars = undefined;
    }

    // default to variables prop
    if (typeof vars == "undefined") {
      vars = variables;
    }

    // map to variables if function
    if (typeof variables == "function") {
      vars = await Promise.resolve(variables(vars));
    }

    const { client } = this.context.apollo;
    const { gql, refetchQueries, optimisticResponse, update } = this.props;
    const req = client.mutate({
      mutation: gql,
      variables: vars,
      refetchQueries,
      optimisticResponse,
      update
    });

    this.setState({ loading: true });

    // returning `req` so the user
    // also can track when its done and any errors
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

  // Default variables passed into the Mutation (when no variables
  // are passed into the mutation callback).
  // May also be a function in which case it will take the variables
  // passed into the mutate call and return the variables to use in
  // the request.
  // ex. <Mutate variables={(vars) => ({...vars, id: "1"})} />
  variables: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

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
