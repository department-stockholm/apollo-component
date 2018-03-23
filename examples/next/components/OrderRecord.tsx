import React from "react";
import gql from "graphql-tag";

export const OrderRecordRow = ({ title }) => <li>{title}</li>;

export const fragments = {
  OrderRecordRow: gql`
    fragment OrderRecordRow on OrderRecord {
      id
      title
    }
  `
};
