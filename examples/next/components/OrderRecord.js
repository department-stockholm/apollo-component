import React from "react";
import gql from "graphql-tag";

export const OrderRecordRow = ({ title }) => <li>{title}</li>;

OrderRecordRow.fragments = {
  OrderRecordRow: gql`
    fragment OrderRecordRow on OrderRecord {
      id
      title
    }
  `
};
