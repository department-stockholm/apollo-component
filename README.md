# Apollo Component

[![npm version](https://badge.fury.io/js/%40department%2Fapollo-component.svg)](https://badge.fury.io/js/%40department%2Fapollo-component)

A render component for easy querying and mutating of your GraphQL API.

## Install

```sh
npm install @department/apollo-component
```

## Examples

Here is an example of fetching and rendering the data of an imaginary `Order`.

```js
import { gql } from "graphql-tag"
import { Query } from "@department/apollo-component"
import SingleOrder, { LoadingOrder } from "components/SingleOrder"
import { GenericError, NotFound } from "components/Errors"

const ShowOrderQuery = gql`
  query ShowOrder($id: ID!) {
    Order(id: $id) {
      ...SingleOrder
    }
  }
  ${SingleOrder.fragments.SingleOrder}
`;

const Show = ({ id }) => (
  <Query gql={ShowOrderQuery} variables={{id}}>
    {({ data: { Order }, loading, error, refetch }) =>
      loading ? (
        <LoadingOrder />
      ) : error ? (
        <GenericError error={error} />
      ) : (
        <SingleOrder {...Order} update={refetch} />
      )}
  </Query>
));
```

And another example using `<Mutate/>` and `fail`-props to raise any errors to
the nearest
[React 16+ Error Boundary](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html):

```js
import { gql } from "graphql-tag";
import { Mutate, Query } from "@department/apollo-component";
import { Exception } from "components/Exception";

const IncrementMutation = gql`
  mutation IncrementMutation($num: Int!) {
    incr(num: $num)
  }
`;

const ShowCountQuery = gql`
  query ShowCount {
    count
  }
`;

const IncrementView = ({ id }) => (
  <Exception>
    <Query gql={ShowCount} wait fail>
      {({ data: { count } }) => <div>Current count: {count}</div>}
    </Query>
    <Mutate gql={IncrementMutation} refetchQueries={["ShowCount"]} fail>
      {incr => (
        <form onSubmit={e => incr({ num: e.currentTarget.num.valueAsNumber })}>
          <input type="number" name="num" value={1} step={1} />
          <button>+</button>
        </form>
      )}
    </Mutate>
  </Exception>
);
```

## API

### `<Query />`

[Available Props](https://github.com/department-stockholm/apollo-component/blob/master/Query.js#L142-L187):

* `gql`
* `wait`
* `lazy`
* `fail`
* `skip`
* `variables`

#### Arguments in render callback

* _QueryResults_
  * `data` the loaded data or an empty object
  * `loading` true while loading (unless the `wait`-prop was set)
  * `skipped` true if the request was skipped (using the `skip`-prop)
  * `error` Error object if there was any error (unless the `fail`-props was
    set)
  * `refetch(variables)` call this function rerun query with, optionally, new
    variables
  * `fetchMore(opts)` call this function to fetch more (read about the
    [opts](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-fetchMore))

##### Example:

```js
({ data: { stuff }, loading }) => <div>{loading ? "loading..." : stuff}</div>;
```

### `<Mutate />`

[Available Props](https://github.com/department-stockholm/apollo-component/blob/master/Mutate.js#L86-L106):

* `gql`
* `refetchQueries`
* `optimisticResponse`
* `update`

#### Arguments in render callback

* `Mutate(variables)` call this function to trigger the mutation
* _QueryResults_ (like for Query but without `skipped`)
  * `data`
  * `loading`
  * `error`
  * `refetch`
  * `fetchMore`

##### Example:

```js
(mutate, { data: { stuff }, loading }) => (
  <button onClick={() => mutate()} disabled={loading}>
    {loading ? "loading..." : stuff}
  </button>
);
```

### `renderState(client, component, options)`

For server side rendering `renderState()` may be used. It uses a query queue in
the React Context which is populated by `<Query/>` in its `componentWillMount()`
lifecycle method using a naïve component renderer.

It will by default render the tree repeatedly until all queries, without the
`lazy`-prop has been completed but the maximum "depth" may be adjusted with the
`maxDepth` option.

#### Arguments

* `client` an instance of ApolloClient
* `component` the root component, will be wrapped by a `<Provider />` with a
  queue
* _RenderStateOptions_
  * `maxDepth` number of attempts to render the tree, defaults to `Infinity`
    (until no more queries are to be found)

#### Example

An example which could be used to server side render.

Note how the `<Provider/>` is not needed in `renderState()`, it's because it
wraps the component with a special one.

```js
function renderHTML() {
  return renderState(client, <App />, { maxDepth: 1 })
    .then(() =>
      ReactDOM.renderToString(
        <Provider client={client}>
          <App />
        </Provider>
      )
    )
    .catch(err => {
      // you can let the error throw here
      // or ignore it and let the client side
      // handle it inline
      console.error("failed to render state:", err);
      return renderErrorPage(err);
    });
}
```
