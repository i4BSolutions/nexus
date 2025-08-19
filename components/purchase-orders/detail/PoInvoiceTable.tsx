import { PoInvoiceInterface } from "@/types/purchase-order/purchase-order-detail.type";
import { CalendarOutlined } from "@ant-design/icons";
import { Button, Flex, Pagination, Table, TableProps, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/purchase-invoices/StatusBadge";

export default function PoInvoiceTable({
  data,
  total,
  pagination,
  paginationChangeHandler,
}: {
  data: PoInvoiceInterface[];
  total: number;
  pagination: { page: number; pageSize: number };
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const router = useRouter();
  const columns: TableProps<PoInvoiceInterface>["columns"] = [
    {
      title: "INVOICES",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "INVOICE DATE",
      dataIndex: "invoice_date",
      key: "invoice_date",
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
      render: (_, record) => (
        <>
          <Typography.Text>
            {record.amount_local?.toLocaleString() ?? "-"}{" "}
            {record.currency_code}
          </Typography.Text>
          <div>
            <Typography.Text type="secondary">
              (${record.amount_usd?.toLocaleString() ?? "-"})
            </Typography.Text>
          </div>
        </>
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
        </Flex>
      ),
    },
  ];

  return (
    <section className="py-4 px-6 mb-4">
      <Table<PoInvoiceInterface>
        columns={columns}
        dataSource={data}
        showSorterTooltip={{ target: "sorter-icon" }}
        rowKey={"id"}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        pagination={false}
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {total} items
            </Typography.Text>
            <Pagination
              defaultCurrent={1}
              current={pagination.page}
              total={total}
              onChange={paginationChangeHandler}
            />
          </div>
        )}
      />
    </section>
  );
}
