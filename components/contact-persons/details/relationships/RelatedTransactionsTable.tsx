"use client";

import React from "react";
import RelatedPurchaseOrdersTable from "./RelatedPurchaseOrdersTable";

const RelatedTransactionsTable: React.FC<{ id: string }> = ({ id }) => {
  // Reuse the PO table for now
  return <RelatedPurchaseOrdersTable id={id} />;
};

export default RelatedTransactionsTable;
