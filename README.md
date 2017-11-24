# Apollo Component

A render component for easy querying and mutating of your GraphQL API.

## Example

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

And another example using `<Mutate/>`:

```js
import { gql } from "graphql-tag"
import { Mutate, Query } from "@department/apollo-component"

const IncrementMutation = gql`
  mutation IncrementMutation {
    incr()
  }
`;

const ShowCountQuery = gql`
  query ShowCount {
    count
  }
`

const IncrementView = ({ id }) => [
  <Query gql={ShowCount} wait>{
    ({ data: { count }, error }) =>
      error ? (
        <div>Failed: {error.message}</div>
      ) : (
        <div>Current count: {count}</div>
      )
  }</Query>
  ,
  <Mutate gql={IncrementMutation} refetchQueries={["ShowCount"]}>{
    (incr, {error, loading}) =>
      loading ? (
        <div>Saving...</div>
      ) : error ? (
        <div>Failed: {error.message}</div>
      ) : (
        <button onClick={incr}>+</button>
      )
  }</Mutate>
));
```

## API

### <Query />

Available Props:

* gql
* wait
* lazy
* fail
* variables

Arguments in render callback:

* QueryResults
  * data
  * loading
  * error
  * refetch
  * fetchMore

### <Mutate />

Available Props:

* gql
* refetchQueries
* optimisticResponse
* update

Arguments in render callback:

* Mutate(variables)
* QueryResults
  * data
  * loading
  * error
  * refetch
  * fetchMore
