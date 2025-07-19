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
      title: "INVOICE DATE",
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
      title: "DUE DATE",
      dataIndex: "due_date",
      key: "due_date",
      render: (due_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(due_date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "AMOUNT",
      key: "amount",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.total_amount_usd - b.total_amount_usd,
      render: (_, record) => (
        <div>
          <div>
            <Typography.Text>
              {record.total_amount_local.toFixed(2)} {record.currency_code}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">
              (${record.total_amount_usd.toLocaleString()})
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "EXCHANGE RATE",
      dataIndex: "usd_exchange_rate",
      key: "usd_exchange_rate",
      render: (usd_exchange_rate, record) => (
        <Typography.Text>
          1 USD = {usd_exchange_rate.toFixed(2)} {record.currency_code}
        </Typography.Text>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Flex justify="start" align="center" gap={4}>
          <Button
            style={{ padding: 0 }}
            type="link"
            onClick={() => router.push(`/invoices/${record.id}`)}
          >
            View
          </Button>
          <Divider type="vertical" />
          <Button
            style={{ padding: 0 }}
            type="link"
            onClick={() => router.push(`/invoices/${record.id}/edit`)}
          >
            Edit
          </Button>
        </Flex>
      ),
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
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        footer={() => (
          <Flex justify="space-between" align="center" gap={4}>
            <Typography.Text>
              Showing {pagination.pageSize * (pagination.page - 1) + 1} to{" "}
              {Math.min(pagination.pageSize * pagination.page, total)} of{" "}
              {total} items
            </Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={total}
              onChange={paginationChangeHandler}
            />
          </Flex>
        )}
      />
    </section>
  );
}
