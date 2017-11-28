import React from "react";
import gql from "graphql-tag";
import Link from "next/link";
import { Query, Mutate } from "@department/apollo-component";
import { Table, Column, Button } from "antd";

import { Layout } from "components/Layout";
import withApollo from "components/withApollo";

const List = ({}) => (
  <Layout>
    <Mutate gql={DeletePostMutation} wait fail>
      {(destroy, { loading }) => (
        <Query gql={ListPostsQuery} wait fail>
          {({ data: { allPosts } }) => (
            <Table dataSource={allPosts}>
              <Column title="Title" dataIndex="title" key="title" />
              <Column
                title="Action"
                key="action"
                render={(text, { id }) => (
                  <span>
                    <Link href={`/posts/edit?id=${id}`}>
                      <a>Edit</a>
                    </Link>
                    <span className="ant-divider" />
                    <Button
                      type="danger"
                      loading={loading}
                      onClick={e => destroy({ id })}
                    >
                      Delete
                    </Button>
                  </span>
                )}
              />
            </Table>
          )}
        </Query>
      )}
    </Mutate>
  </Layout>
);

const ListPostsQuery = gql`
  query ListPosts {
    allPosts {
      id
      title
    }
  }
`;

const DeletePostMutation = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

export default withApollo(List);
