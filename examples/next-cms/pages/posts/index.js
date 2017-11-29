import React from "react";
import gql from "graphql-tag";
import Link from "next/link";
import { Query, Mutate } from "@department/apollo-component";
import { Table, Column, Button, Popconfirm } from "antd";

import { Layout } from "components/Layout";
import withApollo from "components/withApollo";

const List = ({}) => (
  <Layout>
    <Mutate gql={DeletePostMutation} fail>
      {(destroy, destroying) => (
        <Query gql={ListPostsQuery} fail>
          {({ data: { allPosts }, loading }) => (
            <Table
              rowSelection={{
                onChange: (selectedRowKeys, selectedRows) => {
                  console.log(
                    `selectedRowKeys: ${selectedRowKeys}`,
                    "selectedRows: ",
                    selectedRows
                  );
                }
              }}
              dataSource={allPosts}
              loading={loading}
            >
              <Column title="Title" dataIndex="title" key="title" />
              <Column
                title="Action"
                key="action"
                render={(text, { id, title }) => (
                  <span>
                    <Link href={`/posts/edit?id=${id}`}>
                      <a>Edit</a>
                    </Link>
                    <span className="ant-divider" />
                    <Popconfirm
                      title={`Are you sure delete "${title}"?`}
                      onConfirm={() => destroy({ id })}
                    >
                      <a href="#">Delete</a>
                    </Popconfirm>
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
