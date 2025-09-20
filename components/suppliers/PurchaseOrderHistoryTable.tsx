import { CalendarOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Pagination, Table, TableProps, Typography } from "antd";
import Link from "antd/es/typography/Link";
import StatusBadge from "../purchase-orders/StatusBadge";
import TableCardWrapper from "./TableWrapper";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";

interface PurchaseOrderHistoryTableProps {
  data: {
    dto: Array<{
      id: string | number;
      purchase_order_no: string;
      contact_person: string;
      order_date: string;
      expected_delivery_date: string;
      amount_local: number;
      amount_usd: number;
      currency_code: string;
      purchase_order_smart_status: string;
    }>;
  };
  pagination: {
    page: number;
  };
  total: number;
  onPageChange: (page: number) => void;
}

const PurchaseOrderHistoryTable = ({
  data,
  pagination,
  total,
  onPageChange,
}: PurchaseOrderHistoryTableProps) => {
  const historyData = data?.dto?.map((po) => ({
    key: po.id,
    order_number: po.purchase_order_no,
    contact_person: po.contact_person,
    order_date: po.order_date,
    expected_delivery_date: po.expected_delivery_date,
    amount_local: po.amount_local,
    amount_usd: po.amount_usd,
    currency_code: po.currency_code,
    purchase_order_smart_status: po.purchase_order_smart_status,
  }));

  const columns: TableProps<any>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "order_number",
      sorter: (a, b) => a.order_number.localeCompare(b.order_number),
      render: (text, record) => (
        <Link href={`/purchase-orders/${record.key}`}>{text}</Link>
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "CONTACT PERSON",
      dataIndex: "contact_person",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
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
      title: "EXPECTED DELIVERY",
      dataIndex: "expected_delivery_date",
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
            {formatWithThousandSeparator(record.amount_local) ?? "-"}{" "}
            {record.currency_code}
          </Typography.Text>
          <div>
            <Typography.Text type="secondary">
              (${formatWithThousandSeparator(record.amount_usd) ?? "-"})
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
      dataIndex: "purchase_order_smart_status",
      render: (purchase_order_smart_status) => (
        <StatusBadge status={purchase_order_smart_status} />
      ),
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "ACTIONS",
      render: (_, record) => (
        <Link href={`/purchase-orders/${record.key}`}>View</Link>
      ),
    },
  ];

  return (
    <TableCardWrapper
      icon={<ShoppingCartOutlined />}
      title="Related Purchase Orders"
      subtitle="Purchase Orders linked to this supplier"
      gradient="linear-gradient(90deg, rgba(230, 247, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)"
      borderColor="#91D5FF"
      backgroundColor="#40A9FF"
    >
      <Table
        size="middle"
        pagination={false}
        rowKey="key"
        columns={columns}
        dataSource={historyData}
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

export default PurchaseOrderHistoryTable;
