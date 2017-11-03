import fetch from "isomorphic-fetch";

import React from "react";
import gql from "graphql-tag";
import {
  Provider,
  Query,
  Mutate,
  MockClient
} from "@department/apollo-component";
import ApolloClient, { HttpLink } from "apollo-client-preset";

const getClient = mock =>
  mock
    ? new MockClient([])
    : new ApolloClient({
        link: new HttpLink({
          uri: "https://api.graph.cool/simple/v1/ciy1yx99701ou0147zvkyb6w5"
        }),
        fetch
      });

import { OrderRow, LoadingOrderRow } from "../components/OrderRow";
import { SingleOrder } from "../components/SingleOrder";

export default ({ url: { query } }) => (
  <Provider client={getClient(query.mock)}>
    {query.id ? <Show id={query.id} /> : <List />}
  </Provider>
);

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
