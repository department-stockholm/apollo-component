import React from "react";
import gql from "graphql-tag";

import { OrderRecordRow } from "./OrderRecord";

export const SingleOrder = ({ id, name, records }) => (
  <div id={id}>
    <h1>{name}</h1>
    <ol>{records.map(rec => <OrderRecordRow {...rec} />)}</ol>
  </div>
);

SingleOrder.fragments = {
  SingleOrder: gql`
    fragment SingleOrder on Order {
      id
      name
      records {
        ...OrderRecordRow
      }
    }
    ${OrderRecordRow.fragments.OrderRecordRow}
  `
};
