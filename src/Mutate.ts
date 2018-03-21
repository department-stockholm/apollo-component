import React from "react";
import PropTypes from "prop-types";

import { isPlainObject } from "./util";

export interface VariablesFunc<V> {
  (vars: V): V;
}

export interface MutateRenderFunc<T, V> {
  (mutate: (vars: V) => Promise<any>, state: MutateState<T>): React.ReactNode;
}

export type MutateProps<T, V> = {
  // A graphql-tag compiled gql query
  gql: object;

  // Default variables passed into the Mutation (when no variables
  // are passed into the mutation callback).
  // May also be a function in which case it will take the variables
  // passed into the mutate call and return the variables to use in
  // the request.
  // ex. <Mutate variables={(vars) => ({...vars, id: "1"})} />
  variables: V | VariablesFunc<V>;

  // Fail by throwing an exception and letting the React error boundary
  // take care of it instead of passing the error into the render callback
  fail: boolean;

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-refetchQueries
  refetchQueries: string[];

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-optimisticResponse
  optimisticResponse: Function;

  // see https://www.apollographql.com/docs/react/basics/mutations.html#graphql-mutation-options-update
  update: Function;

  // Render using either the `children`- or a `render`-prop callback
  children: MutateRenderFunc<T, V> | React.ReactNode;
  render: MutateRenderFunc<T, V>;
};

export type MutateState<T> = {
  data: T | any;
  error?: Error;
  loading: boolean;
};

/**
 * Example:
 *
 * ```
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
 * ```
 */
export class Mutate<T = any, V = any> extends React.Component<
  MutateProps<T, V>,
  MutateState<T>
> {
  static contextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired,
      queued: PropTypes.array
    }).isRequired
  };

  state = {
    data: {},
    error: null,
    loading: false
  };

  mounted = false;

  constructor(props, context) {
    super(props, context);
    this.mutate = this.mutate.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async mutate(vars: V) {
    const { variables } = this.props;

    // special case for when vars are event
    // ex. <button onClick={mutate} />
    if (!isPlainObject(vars)) {
      vars = undefined;
    }

    // default to variables prop
    if (typeof vars == "undefined" && typeof variables !== "function") {
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

    let fn: MutateRenderFunc<T, V> = this.props.render;
    if (!fn && typeof this.props.children === "function") {
      fn = this.props.children;
    }

    // <Query render={() => {}}/> or <Query>{() => {}}</Query>
    return fn(this.mutate, this.state);
  }
}
