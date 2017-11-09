import fetch from "isomorphic-unfetch";

import React from "react";
import gql from "graphql-tag";
import {
  Provider,
  Query,
  Mutate,
  renderState
} from "@department/apollo-component";
import ApolloClient, { HttpLink } from "apollo-client-preset";

import { OrderRow, LoadingOrderRow } from "../components/OrderRow";
import { SingleOrder } from "../components/SingleOrder";

export default class extends React.Component {
  static async getInitialProps({ req, query }) {
    // create a client in ssr mode
    // and render the state of the root component
    // to populate the cache
    const client = createClient({ ssrMode: !!req });
    await renderState(client, <Root id={query.id} />);
    return { state: client.cache.extract() };
  }

  // an apollo client for client side rendering
  // rehydrated with the state from ssr
  client = createClient({}, this.props.state);

  render() {
    const { url: { query } } = this.props;
    return (
      <Provider client={this.client}>
        <Root id={query.id} />
      </Provider>
    );
  }
}

const createClient = (opts = {}, state) => {
  const client = new ApolloClient({
    link: new HttpLink({
      fetch,
      uri: "https://api.graph.cool/simple/v1/ciy1yx99701ou0147zvkyb6w5"
    }),
    ...opts
  });
  if (state) {
    client.cache.restore(state);
  }
  return client;
};

const Root = ({ id }) => (id ? <Show id={id} /> : <List />);

const List = ({}) => (
  <div>
    <Query gql={ListOrderQuery}>
      {({ data: { allOrders }, error, loading, refetch, fetchMore }) =>
        loading ? (
          Array.from({ length: 5 }).map((_, i) => <LoadingOrderRow key={i} />)
        ) : error ? (
          <span>{error}</span>
        ) : (
          [
            allOrders.map((order, i) => <OrderRow key={i} {...order} />),
            <button key="btn" type="button" onClick={() => refetch()}>
              Refetch
            </button>,
            <button
              key="btn2"
              type="button"
              onClick={() =>
                fetchMore({
                  variables: { after: allOrders[allOrders.length - 1].id },
                  updateQuery: (previousResult, { fetchMoreResult }) => ({
                    allOrders: [
                      ...previousResult.allOrders,
                      ...fetchMoreResult.allOrders
                    ]
                  })
                })}
            >
              More
            </button>,

            <Mutate
              key="add"
              gql={AddOrderMutation}
              refetchQueries={["ListOrder"]}
            >
              {(add, { data: { createOrder }, error, loading }) => (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    add({ name: e.currentTarget.elements.name.value });
                  }}
                >
                  <input type="text" name="name" />
                  <button disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </button>

                  {createOrder ? `created ${createOrder.id}` : null}
                </form>
              )}
            </Mutate>
          ]
        )}
    </Query>
  </div>
);

const AddOrderMutation = gql`
  mutation AddOrder($name: String!) {
    createOrder(name: $name) {
      id
    }
  }
`;

const ListOrderQuery = gql`
  query ListOrder ($after: String) {
    allOrders(first: 2, after: $after, orderBy: name_ASC) {
      ...OrderRow
    }
  }
  ${OrderRow.fragments.OrderRow}
`;

const Show = ({ id }) => (
  <div>
    <Query gql={ShowOrderQuery} variables={{ id }} wait>
      {({ data: { Order }, error, refetch }) =>
        error || !Order ? (
          <span>{error || "Not Found"}</span>
        ) : (
          <SingleOrder {...Order} />
        )}
    </Query>
  </div>
);

const ShowOrderQuery = gql`
  query ShowOrder($id: ID!) {
    Order(id: $id) {
      ...SingleOrder
    }
  }
  ${SingleOrder.fragments.SingleOrder}
`;
