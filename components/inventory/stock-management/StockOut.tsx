import { useGetById } from "@/hooks/react-query/useGetById";
import { InventoryInterface } from "@/types/inventory/inventory.type";
import { StockTransactionHistory } from "@/types/stock/stock.type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { PlusOutlined, TagOutlined, UploadOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";

import React, { useEffect } from "react";
import StockOutHistory from "./StockOutHistory";

const { Option } = Select;
const { TextArea } = Input;

interface StockOutProps {
  warehouses: WarehouseInterface[] | undefined;
  warehouseLoading?: boolean;
  mutateLoading?: boolean;
  stockOutHistories: StockTransactionHistory[] | undefined;
  stockOutHistoryLoading?: boolean;
  onSubmit?: (payload: any) => void;
}

const StockOut = ({
  warehouses,
  warehouseLoading,
  mutateLoading,
  stockOutHistories,
  stockOutHistoryLoading,
  onSubmit,
}: StockOutProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const reason = Form.useWatch("reason", form);
  const selectedWarehouseName = Form.useWatch("warehouse", form);

  const selectedWarehouse = warehouses?.find(
    (w) => w.name === selectedWarehouseName
  );

  const { data: inventoryDataRaw, isLoading: inventoryLoading } = useGetById(
    "inventory/get-by-warehouse-id",
    selectedWarehouse?.id as any,
    !!selectedWarehouse?.id
  );

  const inventoryItems = (inventoryDataRaw as InventoryInterface[]) || [];

  useEffect(() => {
    if (selectedWarehouse && inventoryItems.length > 0) {
      form.setFieldsValue({
        items: [{ product: null, quantity: 1 }],
      });
    } else {
      form.setFieldsValue({ items: [] });
    }
  }, [selectedWarehouse, inventoryItems, form]);

  const handleFinish = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.warning("Please select at least one item.");
      return;
    }

    const payload = {
      stock_out_items: (values.items ?? [])
        .filter((i: any) => Number(i.quantity) > 0)
        .map((i: any) => {
          const product = inventoryItems.find(
            (inv) => inv.product.id === i.product
          );

          if (!product || product.quantity <= 0) return null;

          const base = {
            product_id: product.product.id,
            warehouse_id: selectedWarehouse?.id!,
            quantity: Number(i.quantity),
            reason: values.reason,
          } as {
            product_id: number;
            warehouse_id: number;
            quantity: number;
            reason: string;
            destination_warehouse_id?: number;
            note?: string;
          };

          if (
            values.reason === "Warehouse Transfer" &&
            values.destination_warehouse
          ) {
            const dest = warehouses?.find(
              (w) => w.name === values.destination_warehouse
            );
            if (dest) base.destination_warehouse_id = dest.id;
          }

          if (values.note) base.note = values.note;
          return base;
        })
        .filter(Boolean), // Remove null entries
    };

    try {
      onSubmit?.(payload);
      message.success("Stock Out completed successfully!");
      form.resetFields();
    } catch (error) {
      console.log(error);
      message.error("Stock Out Failed. Please try again.");
    }
  };

  return (
    <>
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #FFFBE6 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #FFE58F",
          },
        }}
        variant="outlined"
        title={
          <div className="flex items-center gap-3 py-2">
            <div
              style={{
                width: 32,
                height: 32,
                background: "#FFC53D",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <UploadOutlined style={{ color: "#FFFFFF" }} />
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
                Stock Out
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                Move items out of inventory for use or transfer
              </Typography.Text>
            </div>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          style={{ maxWidth: "100%" }}
          onFinish={handleFinish}
        >
          <Form.Item
            label="Warehouse"
            name="warehouse"
            style={{ width: "100%" }}
            rules={[{ required: true, message: "Please select warehouse" }]}
          >
            <Select
              allowClear
              loading={warehouseLoading}
              placeholder="Select Warehouse"
            >
              {warehouses?.map((warehouse) => (
                <Option key={warehouse.id} value={warehouse.name}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Card style={{ marginBottom: 12 }}>
            <Space direction="vertical" size="small" style={{ gap: 0 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Select Items
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                Select items to move out of inventory for use or transfer
              </Typography.Text>
            </Space>

            {inventoryLoading ? (
              <div className="grid place-items-center h-[200px]">
                <Spin />
              </div>
            ) : inventoryItems.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  width: "100%",
                }}
              >
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  styles={{ image: { height: 60 } }}
                  description={null}
                />
                <Typography.Text
                  style={{
                    color: "#000000D9",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Select invoice to add items to stock.
                </Typography.Text>
              </div>
            ) : (
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          overflow: "hidden",
                          marginTop: 12,
                        }}
                      >
                        {/* Header */}
                        <Row
                          gutter={16}
                          style={{
                            fontWeight: 600,
                            padding: "12px 8px",
                            background: "#fafafa",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                          align="middle"
                        >
                          <Col span={6}>PRODUCT</Col>
                          <Col span={4}>PRODUCT SKU</Col>
                          <Col span={6}>AVAILABLE QTY</Col>
                          <Col span={6}>QUANTITY TO STOCK OUT</Col>
                        </Row>

                        {/* Rows */}
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Row
                            key={key}
                            gutter={16}
                            align="middle"
                            style={{
                              padding: "12px 8px",
                              borderBottom:
                                index !== fields.length - 1
                                  ? "1px solid #f0f0f0"
                                  : undefined,
                            }}
                          >
                            {/* Product Select */}
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "product"]}
                                rules={[
                                  { required: true, message: "Select product" },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  placeholder="Select Product"
                                  style={{ width: "100%" }}
                                  allowClear
                                  options={inventoryItems
                                    .filter((inv) => inv.quantity > 0)
                                    .map((inv) => ({
                                      value: inv.product.id,
                                      label: inv.product.name,
                                    }))}
                                />
                              </Form.Item>
                            </Col>

                            {/* SKU */}
                            <Col span={4}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) =>
                                  prev.items?.[name]?.product !==
                                  cur.items?.[name]?.product
                                }
                              >
                                {() => {
                                  const pid = form.getFieldValue([
                                    "items",
                                    name,
                                    "product",
                                  ]);
                                  const inv = inventoryItems.find(
                                    (i) => i.product.id === pid
                                  );
                                  return (
                                    <Flex style={{ gap: 4 }}>
                                      <TagOutlined />
                                      <Typography.Text>
                                        {inv?.product.sku ?? "-"}
                                      </Typography.Text>
                                    </Flex>
                                  );
                                }}
                              </Form.Item>
                            </Col>

                            {/* Available Qty */}
                            <Col span={6}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) =>
                                  prev.items?.[name]?.product !==
                                  cur.items?.[name]?.product
                                }
                              >
                                {() => {
                                  const pid = form.getFieldValue([
                                    "items",
                                    name,
                                    "product",
                                  ]);
                                  const inv = inventoryItems.find(
                                    (i) => i.product.id === pid
                                  );
                                  return (
                                    <Typography.Text>
                                      {inv?.quantity?.toLocaleString() ?? "-"}
                                    </Typography.Text>
                                  );
                                }}
                              </Form.Item>
                            </Col>

                            {/* Quantity Input */}
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "quantity"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Quantity is required",
                                  },
                                  {
                                    type: "number",
                                    min: 1,
                                    message: "Minimum quantity is 1",
                                  },
                                  {
                                    validator: (_, value) => {
                                      const pid = form.getFieldValue([
                                        "items",
                                        name,
                                        "product",
                                      ]);
                                      const inv = inventoryItems.find(
                                        (i) => i.product.id === pid
                                      );
                                      if (
                                        typeof value === "number" &&
                                        inv &&
                                        value > inv.quantity
                                      ) {
                                        return Promise.reject(
                                          new Error(
                                            `Cannot exceed available qty (${inv.quantity})`
                                          )
                                        );
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <InputNumber
                                  min={1}
                                  max={(() => {
                                    const pid = form.getFieldValue([
                                      "items",
                                      name,
                                      "product",
                                    ]);
                                    return (
                                      inventoryItems.find(
                                        (i) => i.product.id === pid
                                      )?.quantity ?? undefined
                                    );
                                  })()}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )}

                    {/* Add More Button */}
                    {fields.length > 0 && (
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => add({ product: null, quantity: 1 })}
                        style={{ marginTop: 16 }}
                      >
                        Add More
                      </Button>
                    )}
                  </>
                )}
              </Form.List>
            )}
          </Card>
          <Form.Item
            label="Reason"
            required
            name="reason"
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Select allowClear placeholder="Select reason">
              <Option value="Production Consumption">
                Production Consumption
              </Option>
              <Option value="Warehouse Transfer">Warehouse Transfer</Option>
              <Option value="Damaged/Lost">Damaged/Lost</Option>
              <Option value="Return to Supplier">Return to Supplier</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          {reason === "Warehouse Transfer" && (
            <Form.Item
              label="Destination Warehouse"
              required
              name="destination_warehouse"
              rules={[
                {
                  required: true,
                  message: "Please enter a destination warehouse",
                },
              ]}
            >
              <Select allowClear placeholder="Select destination warehouse">
                {warehouses
                  ?.filter((w) => w.name !== form.getFieldValue("warehouse"))
                  .map((w) => (
                    <Option key={w.id} value={w.name}>
                      {w.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item label="Note (Optional)" name="note">
            <TextArea placeholder="Enter note" />
          </Form.Item>
          <Flex style={{ justifyContent: "space-between" }}>
            <Button
              type="default"
              onClick={() => form.resetFields()}
              disabled={mutateLoading}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={mutateLoading}
              loading={mutateLoading}
            >
              Complete Stock Out
            </Button>
          </Flex>
        </Form>
      </Card>

      <Divider plain>
        <Typography.Text
          style={{ fontSize: "12px", fontWeight: 400, color: "#00000073" }}
        >
          Scroll down to see recent stock in history
        </Typography.Text>
      </Divider>

      <StockOutHistory
        items={stockOutHistories}
        isLoading={stockOutHistoryLoading}
      />
    </>
  );
};

export default StockOut;
