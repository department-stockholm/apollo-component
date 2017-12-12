import React from "react";
import { withRouter } from "next/router";
import gql from "graphql-tag";
import { Query, Mutate } from "@department/apollo-component";

import withApollo from "../components/withApollo";
import { OrderRow, LoadingOrderRow } from "../components/OrderRow";
import { SingleOrder } from "../components/SingleOrder";

const Root = ({ query }) =>
  query.error ? <Error /> : query.id ? <Show /> : <List skip={!!query.skip} />;

const List = ({ skip }) => (
  <Query gql={ListOrderQuery} skip={skip}>
    {({ data: { allOrders }, error, loading, refetch, fetchMore }) =>
      loading ? (
        Array.from({ length: 5 }).map((_, i) => <LoadingOrderRow key={i} />)
      ) : error ? (
        <span>{error}</span>
      ) : (
        [
          allOrders.map((order, i) => <OrderRow key={i} {...order} />),
          <button
            key="btn-10"
            type="button"
            onClick={() => refetch({ count: 10 })}
          >
            Refetch w. count: 10
          </button>,
          <button key="btn" type="button" onClick={refetch}>
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
              })
            }
          >
            More
          </button>,
          <Posts key="posts" />,
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
      )
    }
  </Query>
);

const Posts = withRouter(({ router: { query } }) => (
  <Query gql={ListPostsQuery} lazy={!!query.lazy}>
    {({ loading, data: { allPosts }, error }) =>
      loading ? (
        <div>Loading posts</div>
      ) : error ? (
        <div>Error while loading posts: {error.message}</div>
      ) : (
        allPosts.map(p => <div key={p.id}>{p.id}</div>)
      )
    }
  </Query>
));

const Error = withRouter(({ router: { query } }) => (
  <Query gql={ListInvalidPostsQuery} fail={!!query.fail}>
    {({ loading, data: { allPosts }, error }) =>
      loading ? (
        <div>Loading posts</div>
      ) : error ? (
        <div>Error while loading posts: {error.message}</div>
      ) : (
        allPosts.map(p => <div key={p.id}>{p.id}</div>)
      )
    }
  </Query>
));

const ListPostsQuery = gql`
  query ListPosts {
    allPosts {
      id
      description
      sections
    }
  }
`;

const ListInvalidPostsQuery = gql`
  query ListInvalidPosts {
    allPosts {
      idz
      description
      sections
    }
  }
`;

const AddOrderMutation = gql`
  mutation AddOrder($name: String!) {
    createOrder(name: $name) {
      id
    }
  }
`;

const ListOrderQuery = gql`
  query ListOrder ($after: String, $count: Int = 2) {
    allOrders(first: $count, after: $after, orderBy: name_ASC) {
      ...OrderRow
    }
  }
  ${OrderRow.fragments.OrderRow}
`;

const Show = withRouter(({ router: { query } }) => (
  <Query gql={ShowOrderQuery} variables={query} wait>
    {({ data: { Order }, error, refetch }) =>
      error ? (
        <span>{error.message}</span>
      ) : !Order ? (
        <span>{"Not Found"}</span>
      ) : (
        <SingleOrder {...Order} />
      )
    }
  </Query>
));

const ShowOrderQuery = gql`
  query ShowOrder($id: ID!) {
    Order(id: $id) {
      ...SingleOrder
    }
  }
  ${SingleOrder.fragments.SingleOrder}
`;

export default withApollo(Root);
