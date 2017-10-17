import React from "react";
import gql from "graphql-tag";
import Link from "next/link";

import { OrderRecordRow } from "./OrderRecord";

export const SingleOrder = ({ id, name, records }) => (
  <div id={id}>
    <Link href="/">
      <a>Back</a>
    </Link>
    <h1>{name}</h1>
    <ol>{records.map(rec => <OrderRecordRow key={rec.id} {...rec} />)}</ol>
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
