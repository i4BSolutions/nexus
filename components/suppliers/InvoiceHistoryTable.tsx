import { CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import { Pagination, Table, TableProps, Typography } from "antd";
import Link from "antd/es/typography/Link";
import StatusBadge from "../purchase-invoices/StatusBadge";
import TableCardWrapper from "./TableWrapper";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";

interface InvoiceHistoryTableProps {
  data: {
    data: Array<{
      id: string | number;
      purchase_invoice_number: string;
      supplier_name: string;
      invoice_date: string;
      due_date: string;
      currency_code: string;
      total_amount_local: number;
      total_amount_usd: number;
      status: string;
    }>;
  };
  pagination: {
    page: number;
  };
  total: number;
  onPageChange: (page: number) => void;
}

const InvoiceHistoryTable: React.FC<InvoiceHistoryTableProps> = ({
  data,
  pagination,
  total,
  onPageChange,
}) => {
  const invoiceData = data?.data?.map((inv) => ({
    key: inv.id,
    purchase_invoice_number: inv.purchase_invoice_number,
    supplier_name: inv.supplier_name,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    currency_code: inv.currency_code,
    total_amount_local: inv.total_amount_local,
    total_amount_usd: inv.total_amount_usd,
    status: inv.status,
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "INVOICES",
      dataIndex: "purchase_invoice_number",
      sorter: (a, b) =>
        a.purchase_invoice_number.localeCompare(b.purchase_invoice_number),
      render: (text, record) => (
        <Link href={`/invoices/${record.key}`}>{text}</Link>
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier_name",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "INVOICE DATE",
      dataIndex: "invoice_date",
      render: (date) => (
        <>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {date}
        </>
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "DUE DATE",
      dataIndex: "due_date",
      render: (date) => (
        <>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {date}
        </>
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "AMOUNT",
      render: (_, record) => (
        <>
          <Typography.Text>
            {formatWithThousandSeparator(record.total_amount_local) ?? "-"}{" "}
            {record.currency_code}
          </Typography.Text>
          <div>
            <Typography.Text type="secondary">
              (${formatWithThousandSeparator(record.total_amount_usd) ?? "-"})
            </Typography.Text>
          </div>
        </>
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (status) => <StatusBadge status={status} />,
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "ACTIONS",
      render: (_, record) => <Link href={`/invoices/${record.key}`}>View</Link>,
    },
  ];

  return (
    <TableCardWrapper
      icon={<FileTextOutlined />}
      title="Related Invoices"
      subtitle="Invoices linked to this supplier"
      gradient="linear-gradient(90deg, rgba(255, 251, 230, 1) 0%, rgba(255, 255, 255, 0) 100%)"
      borderColor="#FFE58F"
      backgroundColor="#FFC53D"
    >
      <Table
        size="middle"
        pagination={false}
        rowKey="key"
        columns={columns}
        dataSource={invoiceData}
        bordered
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {total} items
            </Typography.Text>
            <Pagination
              current={pagination.page}
              total={total}
              onChange={onPageChange}
            />
          </div>
        )}
      />
    </TableCardWrapper>
  );
};

export default InvoiceHistoryTable;
