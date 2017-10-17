import "babel-polyfill";
import "isomorphic-fetch";

import React from "react";
import gql from "graphql-tag";
import { Provider, Query } from "apollo-component";
import ApolloClient, { HttpLink } from "apollo-client-preset";
import { InMemoryCache } from "apollo-cache-inmemory";

const getClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "https://api.graph.cool/simple/v1/ciy1yx99701ou0147zvkyb6w5"
    })
  });

import { OrderRow, LoadingOrderRow } from "../components/OrderRow";
import { SingleOrder } from "../components/SingleOrder";

export default ({ url: { query } }) => (
  <Provider client={getClient()}>
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
            </button>
          ]
        )}
    </Query>
  </div>
);

const ListOrderQuery = gql`
  query ListOrder ($after: String) {
    allOrders(first: 2, after: $after) {
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
