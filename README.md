# Apollo Component

A render component for easy querying and mutating of your GraphQL API.

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
  mutation IncrementMutation {
    incr()
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
      {incr => <button onClick={incr}>+</button>}
    </Mutate>
  </Exception>
);
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
