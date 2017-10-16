import "babel-polyfill";
import "isomorphic-fetch";

import React from "react";
import gql from "graphql-tag";
import { Provider, Query } from "apollo-component";
import ApolloClient, { HttpLink } from "apollo-client-preset";

const getClient = () =>
  new ApolloClient({
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
      {({ ListOrder, error, loading, refetch }) =>
        loading ? (
          Array.from({ length: 5 }).map(i => <LoadingOrderRow key={i} />)
        ) : error ? (
          <span>{error}</span>
        ) : (
          ListOrder.orders.map(order => <OrderRow key={order.id} {...order} />)
        )}
    </Query>
  </div>
);

const ListOrderQuery = gql`
  query ListOrder {
    orders {
      ...OrderRow
    }
  }
  ${OrderRow.fragments.OrderRow}
`;

const Show = ({ id }) => (
  <div>
    <Query gql={ShowOrderQuery} variables={{ id }} wait>
      {({ ShowOrder, error, refetch }) =>
        error ? (
          <ErrorMessage error={error} />
        ) : (
          <SingleOrder order={ShowOrder.order} />
        )}
    </Query>
  </div>
);

const ShowOrderQuery = gql`
  query ShowOrder($id: ID!) {
    order {
      ...SingleOrder
    }
  }
  ${SingleOrder.fragments.SingleOrder}
`;
