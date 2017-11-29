import React from "react";
import gql from "graphql-tag";
import { Query, Mutate } from "@department/apollo-component";
import { Card, Row, Col, Layout } from "antd";

import { Layout } from "components/Layout";
import withApollo from "components/withApollo";

const Edit = ({}) => (
  <Layout>
    <Row gutter={16}>
      <Col span={6}>
        <Card title="Users">...</Card>
      </Col>
      <Col span={6}>
        <Card title="Posts">...</Card>
      </Col>
    </Row>
  </Layout>
);

export default withApollo(Edit);
