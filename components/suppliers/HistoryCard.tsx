"use client";

import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import {
  SupplierInvoiceHistoryResponse,
  SupplierPurchaseOrderHistoryResponse,
} from "@/types/supplier/supplier.type";
import { useEffect, useState } from "react";
import InvoiceHistoryTable from "./InvoiceHistoryTable";
import PurchaseOrderHistoryTable from "./PurchaseOrderHistoryTable";

const HistoryCard = ({ id }: { id: string }) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 3 });
  const [purchaseOrderTotal, setPurchaseOrderTotal] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  const { data: purchaseOrderHistory } =
    usePaginatedById<SupplierPurchaseOrderHistoryResponse>(
      "suppliers/purchase-order-history",
      id,
      pagination
    );

  const { data: invoiceHistory } =
    usePaginatedById<SupplierInvoiceHistoryResponse>(
      "suppliers/invoice-history",
      id,
      pagination
    );

  useEffect(() => {
    if (purchaseOrderHistory) {
      setPurchaseOrderTotal(purchaseOrderHistory.total);
    }

    if (invoiceHistory) {
      setInvoiceTotal(invoiceHistory.total);
    }
  }, [purchaseOrderHistory, invoiceHistory]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize ?? 3 });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <PurchaseOrderHistoryTable
        data={purchaseOrderHistory ?? { dto: [] }}
        pagination={pagination}
        total={purchaseOrderTotal}
        onPageChange={handlePageChange}
      />

      <InvoiceHistoryTable
        data={{
          data:
            invoiceHistory?.data?.map((item) => ({
              ...item,
              supplier_name: item.supplier_name ?? "",
            })) ?? [],
        }}
        pagination={pagination}
        total={invoiceTotal}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default HistoryCard;
