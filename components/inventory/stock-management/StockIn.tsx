import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  InputNumber,
  Typography,
  Space,
  Flex,
  Divider,
} from "antd";
import { useState } from "react";
import {
  DownloadOutlined,
  MinusOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import StockInHistory, { StockInHistoryProps } from "./StockInHistory";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

type LineItem = {
  name: string;
  sku: string;
  invoiced: number;
  remaining: number;
};

const invoiceLineItems: LineItem[] = [
  { name: "iPhone 16", sku: "AA - 00001", invoiced: 3, remaining: 3 },
  { name: "iPhone 16 Pro", sku: "AA - 00002", invoiced: 1, remaining: 1 },
];

const stockInHistoryItems: StockInHistoryProps[] = [
  {
    id: 1,
    product_name: "MacBook Pro M3",
    stock: 20,
    product_sku: "MBP-M3-001",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-001",
    date: "Jul 10, 2025",
  },
  {
    id: 2,
    product_name: "iPhone 16 Pro Max",
    stock: 35,
    product_sku: "IPH16PM-002",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-002",
    date: "Jul 11, 2025",
  },
  {
    id: 3,
    product_name: "Samsung Galaxy S25",
    stock: 50,
    product_sku: "SGS25-003",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-003",
    date: "Jul 12, 2025",
  },
  {
    id: 4,
    product_name: "Dell XPS 13",
    stock: 18,
    product_sku: "DX13-004",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-004",
    date: "Jul 13, 2025",
  },
  {
    id: 5,
    product_name: "iPad Air 6",
    stock: 25,
    product_sku: "IPAD6-005",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-005",
    date: "Jul 14, 2025",
  },
  {
    id: 6,
    product_name: "Google Pixel 9",
    stock: 22,
    product_sku: "PIXEL9-006",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-006",
    date: "Jul 15, 2025",
  },
  {
    id: 7,
    product_name: "HP EliteBook 850",
    stock: 30,
    product_sku: "HP850-007",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-007",
    date: "Jul 16, 2025",
  },
  {
    id: 8,
    product_name: "Lenovo ThinkPad X1",
    stock: 40,
    product_sku: "TPX1-008",
    warehouse_name: "Warehouse B",
    invoice_number: "INV-2025-008",
    date: "Jul 17, 2025",
  },
  {
    id: 9,
    product_name: "Asus ROG Zephyrus",
    stock: 15,
    product_sku: "ROGZ-009",
    warehouse_name: "Warehouse A",
    invoice_number: "INV-2025-009",
    date: "Jul 18, 2025",
  },
  {
    id: 10,
    product_name: "AirPods Pro 3",
    stock: 60,
    product_sku: "APP3-010",
    warehouse_name: "Warehouse C",
    invoice_number: "INV-2025-010",
    date: "Jul 19, 2025",
  },
];

const StockInForm = () => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<{ [sku: string]: number }>({
    "AA - 00001": 3,
    "AA - 00002": 3,
  });

  const handleQtyChange = (sku: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.max(
        1,
        Math.min(
          value,
          invoiceLineItems.find((i) => i.sku === sku)?.remaining || 1
        )
      ),
    }));
  };

  const increment = (sku: string, max: number) => {
    const current = quantities[sku] || 1;
    handleQtyChange(sku, Math.min(max, current + 1));
  };

  const decrement = (sku: string) => {
    handleQtyChange(sku, (quantities[sku] || 1) - 1);
  };

  const columns: ColumnsType<LineItem> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Product SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => (
        <Space>
          <TagOutlined /> {sku}
        </Space>
      ),
    },
    {
      title: "Invoiced Qty",
      dataIndex: "invoiced",
      key: "invoiced",
    },
    {
      title: "Remaining Qty",
      dataIndex: "remaining",
      key: "remaining",
    },
    {
      title: "Quantity to Stock In",
      key: "stockInQty",
      render: (_, record) => {
        const currentQty = quantities[record.sku] ?? 1;
        const hasError = currentQty > record.remaining;
        return (
          <Space>
            <Button
              icon={<MinusOutlined />}
              onClick={() => decrement(record.sku)}
            />
            <InputNumber
              value={currentQty}
              min={1}
              max={record.remaining}
              status={hasError ? "error" : ""}
              onChange={(val) => handleQtyChange(record.sku, val ?? 1)}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() => increment(record.sku, record.remaining)}
            />
            {hasError && (
              <Text type="danger" style={{ marginLeft: 8 }}>
                Exceeded quantity.
              </Text>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #F6FFED 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #73D13D",
          },
        }}
        title={
          <div className="flex items-center gap-3 py-2">
            <div
              style={{
                width: 32,
                height: 32,
                background: "#73D13D",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DownloadOutlined style={{ color: "#FFFFFF" }} />
            </div>
            <div className="flex flex-col">
              <Typography.Text
                strong
                style={{
                  color: "#000000D9",
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              >
                Stock In
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                Receive items into inventory from invoices
              </Typography.Text>
            </div>
          </div>
        }
        variant="outlined"
      >
        <Form layout="vertical" form={form} style={{}}>
          <Flex style={{ gap: 12 }}>
            <Form.Item
              label="Invoice"
              name="invoice"
              style={{ width: "100%" }}
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Invoice">
                <Option value="INV-2025-1239-01">INV-2025-1239-01</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Warehouse"
              name="warehouse"
              style={{ width: "100%" }}
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Warehouse">
                <Option value="Warehouse A">Warehouse A</Option>
              </Select>
            </Form.Item>
          </Flex>

          <Card
            styles={{
              header: {
                borderBottom: "none",
              },
            }}
            title={
              <div className="flex flex-col">
                <Typography.Text
                  strong
                  style={{
                    fontWeight: 500,
                    color: "#000000D9",
                    fontSize: "20px",
                  }}
                >
                  Available Items
                </Typography.Text>
                <Typography.Text
                  style={{
                    color: "#00000073",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  Select quantities to add to stock
                </Typography.Text>
              </div>
            }
            style={{ marginTop: 12 }}
          >
            <Table
              dataSource={invoiceLineItems}
              columns={columns}
              rowKey="sku"
              pagination={false}
              bordered
            />
          </Card>

          <Form.Item
            label="Note (Optional)"
            name="note"
            style={{ marginTop: 12 }}
          >
            <TextArea placeholder="Enter note" />
          </Form.Item>

          <Space
            style={{
              display: "flex",
              marginTop: 16,
              justifyContent: "space-between",
            }}
          >
            <Button htmlType="reset">Reset</Button>
            <Button type="primary" htmlType="submit">
              Complete Stock In
            </Button>
          </Space>
        </Form>
      </Card>

      <Divider plain>
        <Typography.Text
          style={{ fontSize: "12px", fontWeight: 400, color: "#00000073" }}
        >
          Scroll down to see recent stock in history
        </Typography.Text>
      </Divider>

      <StockInHistory items={stockInHistoryItems} />
    </>
  );
};

export default StockInForm;
