// React & Next
import { useEffect, useState } from "react";
import Link from "next/link";

// Types
import {
  DynamicPricingItems,
  ProductDynamicPricing,
} from "@/types/product/product.type";
import { StatItem } from "@/types/shared/stat-item.type";

// Components
import StatisticsCards from "@/components/shared/StatisticsCards";

// Ant Design
import {
  CalendarOutlined,
  DollarOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Pagination,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";

export default function DynamicPricing({
  data,
  filters,
  pagination,
  onPaginationChange,
  handleFilterChange,
  handleClearFilter,
  onExportCSV,
  loading,
}: {
  data: ProductDynamicPricing | undefined;
  filters: any[];
  pagination: {
    page: number;
    pageSize: number;
  };
  onPaginationChange: (page: number, pageSize: number) => void;
  handleFilterChange: (key: any) => (value: any) => void;
  handleClearFilter: () => void;
  onExportCSV: () => void;
  loading: boolean;
}) {
  const columns: TableProps<DynamicPricingItems>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_number",
      key: "purchase_order_no",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (purchase_order_number) => <a>{purchase_order_number}</a>,
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
      key: "order_date",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (order_date) => (
        <Flex align="center" gap={3}>
          <CalendarOutlined />
          <Typography.Text>{order_date}</Typography.Text>
        </Flex>
      ),
    },
    {
      title: "REGION",
      dataIndex: "region",
      key: "region",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (region) => <Typography.Text>{region}</Typography.Text>,
    },
    {
      title: "CONTACT PERSON",
      dataIndex: "contact_person",
      key: "contact_person",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (contact_person) => (
        <Typography.Text>{contact_person}</Typography.Text>
      ),
    },
    {
      title: "CURRENCY",
      dataIndex: "currency_code",
      key: "currency_code",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (currency_code) => (
        <Typography.Text>{currency_code}</Typography.Text>
      ),
    },
    {
      title: "UNIT PRICE(LOCAL)",
      dataIndex: "unit_price_local",
      key: "unit_price_local",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      sorter: (a, b) => a.unit_price_local - b.unit_price_local,
      render: (unit_price_local, record) => (
        <Typography.Text>
          {unit_price_local.toFixed(2).toLocaleString()} {record.currency_code}
        </Typography.Text>
      ),
    },
    {
      title: "EXCHANGE RATE",
      dataIndex: "exchange_rate",
      key: "exchange_rate",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (exchange_rate, record) => (
        <Typography.Text>
          1 USD = {exchange_rate} {record.currency_code}
        </Typography.Text>
      ),
    },
    {
      title: "UNIT PRICE(EUSD)",
      dataIndex: "unit_price_usd",
      key: "unit_price_usd",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      sorter: (a, b) => a.unit_price_usd - b.unit_price_usd,
      render: (unit_price_usd) => (
        <Typography.Text>
          {unit_price_usd.toFixed(2).toLocaleString()} USD
        </Typography.Text>
      ),
    },
  ];

  const [statItems, setStatItems] = useState<StatItem[]>([]);

  useEffect(() => {
    if (data) {
      setStatItems([
        {
          title: "Average Price (EUSD)",
          value: data.statistics?.average_price_usd || 0,
          suffix: "$",
          icon: <DollarOutlined />,
          bgColor: "#40A9FF",
          gradient: "linear-gradient(90deg, #E6F7FF 0%, #FFF 100%)",
          borderColor: "#91D5FF",
          tooltip: "Average Price of this product in EUSD.",
        },
        {
          title: "Max Price (EUSD)",
          value: data.statistics?.max_price_usd || 0,
          suffix: "$",
          icon: <DollarOutlined />,
          bgColor: "#FFC53D",
          gradient: "linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)",
          borderColor: "#FFE58F",
          tooltip: "Average Price of this product in EUSD.",
          footerContent: (
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 4,
              }}
              size={0}
            >
              <Typography>{data.statistics?.max_price_local} </Typography>
              <Link href={"/"}>
                {data.statistics?.max_purchase_order_number || ""}
              </Link>
            </Space>
          ),
        },
        {
          title: "Min Price (EUSD)",
          value: data.statistics?.min_price_usd || 0,
          suffix: "$",
          icon: <DollarOutlined />,
          bgColor: "#36CFC9",
          gradient: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
          borderColor: "#87E8DE",
          tooltip: "Average Price of this product in EUSD.",
          footerContent: (
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 4,
              }}
              size={0}
            >
              <Typography>{data.statistics?.min_price_local} </Typography>
              <Link href={"/"}>
                {data.statistics?.min_purchase_order_number || ""}
              </Link>
            </Space>
          ),
        },
      ]);
    }
  }, [data]);

  return (
    <section className="max-w-7xl mx-auto">
      <StatisticsCards stats={statItems} />

      <Col style={{ textAlign: "left", marginBottom: 24 }}>
        <Space>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Filter(s):
          </Typography.Text>

          {filters?.map(
            ({
              key,
              label,
              placeholder,
              value,
              options,
            }: {
              key: string;
              label?: string;
              placeholder?: string;
              value?: string | number;
              options: { value: string | number; label: string }[];
            }) => (
              <Select
                key={key}
                allowClear
                placeholder={placeholder || `Select ${label || key}`}
                value={value}
                style={{ width: 200, textAlign: "left" }}
                onChange={handleFilterChange(key)}
              >
                {options.map(
                  (opt: { value: string | number; label: string }) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  )
                )}
              </Select>
            )
          )}

          <Typography.Text
            onClick={() => handleClearFilter()}
            style={{ fontSize: 12, color: "#1890FF", cursor: "pointer" }}
          >
            Clear Filter(s)
          </Typography.Text>
        </Space>
      </Col>

      <div>
        <Card
          styles={{
            header: {
              background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
              borderBottom: "1px solid #D3ADF7",
            },
          }}
          title={
            <Space
              style={{
                margin: "12px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Space>
                <Space
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 20,
                    color: "white",
                    background: "#9254DE",
                    marginRight: 8,
                  }}
                >
                  <DollarOutlined />
                </Space>
                <Space direction="vertical" size={0}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Price History
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ margin: 0 }}>
                    Recent price history containing this product
                  </Typography.Text>
                </Space>
              </Space>

              <Space style={{ display: "flex", alignItems: "center" }}>
                <Button onClick={onExportCSV}>
                  <ExportOutlined />
                  Export CSV
                </Button>
              </Space>
            </Space>
          }
          variant="outlined"
          style={{ borderRadius: 16, marginTop: 12 }}
        >
          <Table
            loading={loading}
            size="middle"
            pagination={false}
            columns={columns}
            dataSource={data?.items}
            rowKey={(record) =>
              record.purchase_order_number +
              record.order_date +
              record.unit_price_local
            }
            bordered
            footer={() => (
              <div className="flex justify-between">
                <Typography.Text type="secondary">
                  Total {data?.pagination.total} items
                </Typography.Text>
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.pageSize}
                  total={data?.pagination.total}
                  onChange={onPaginationChange}
                />
              </div>
            )}
          />
        </Card>
      </div>
    </section>
  );
}
