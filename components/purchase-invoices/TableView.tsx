import { PurchaseInvoiceDto } from "@/types/purchase-invoice/purchase-invoice.type";
import { CalendarOutlined } from "@ant-design/icons";

import {
  Button,
  Divider,
  Flex,
  Pagination,
  Table,
  TableProps,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

export default function TableView({
  data,
  total,
  pagination,
  paginationChangeHandler,
}: {
  data: PurchaseInvoiceDto[];
  total: number;
  pagination: { page: number; pageSize: number };
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const router = useRouter();

  const columns: TableProps<PurchaseInvoiceDto>["columns"] = [
    {
      title: "INVOICE NUMBER",
      dataIndex: "purchase_invoice_number",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "ORDER DATE",
      dataIndex: "invoice_date",
      key: "invoice_date",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime(),
      render: (invoice_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(invoice_date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "TOTAL AMOUNT",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total_amount) => `$${total_amount.toFixed(2)}`,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  return (
    <section className="py-4">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="id"
        scroll={{ x: true }}
        onRow={(record) => ({
          onClick: () => {
            router.push(`/purchase-invoices/${record.purchase_invoice_number}`);
          },
        })}
      />
      <Flex justify="space-between" align="center" gap={4}>
        <Typography.Text>
          Showing {pagination.pageSize * (pagination.page - 1) + 1} to{" "}
          {Math.min(pagination.pageSize * pagination.page, total)} of {total}{" "}
          items
        </Typography.Text>
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onChange={paginationChangeHandler}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Flex>
    </section>
  );
}
