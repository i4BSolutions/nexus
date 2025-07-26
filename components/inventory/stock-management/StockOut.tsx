import { useGetById } from "@/hooks/react-query/useGetById";
import { InventoryInterface } from "@/types/inventory/inventory.type";
import {
  ProductInterface,
  ProductResponse,
} from "@/types/product/product.type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import {
  MinusOutlined,
  PlusOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
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

const { Option } = Select;
const { TextArea } = Input;

interface StockOutProps {
  warehouses: WarehouseInterface[] | undefined;
  warehouseLoading?: boolean;
  mutateLoading?: boolean;
  onSubmit?: (payload: any) => void;
}

const StockOut = ({
  warehouses,
  warehouseLoading,
  mutateLoading,
  onSubmit,
}: StockOutProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const reason = Form.useWatch("reason", form);
  const selectedWarehouseName = Form.useWatch("warehouse", form);

  const selectedWarehouse = warehouses?.find(
    (w) => w.name === selectedWarehouseName
  );
  console.log(selectedWarehouse?.id);

  const { data: inventoryDataRaw, isLoading: inventoryLoading } = useGetById(
    "inventory/get-by-warehouse-id",
    selectedWarehouse?.id as any,
    !!selectedWarehouse?.id
  );
  console.log(inventoryDataRaw);

  const inventoryItems = (inventoryDataRaw as InventoryInterface[]) || [];

  useEffect(() => {
    if (inventoryItems.length) {
      form.setFieldsValue({
        items: inventoryItems.map((item) => ({
          inventory_id: item.id,
          quantity: 1,
        })),
      });
    } else {
      form.setFieldsValue({ items: [] });
    }
  }, [inventoryItems, form]);

  const handleFinish = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.warning("Please select at least one item.");
      return;
    }

    const warehouseId = selectedWarehouse?.id;
    const payload = {
      stock_out_items: values.items.map((item: any) => {
        const baseItem: any = {
          product_id: item.id,
          warehouse_id: warehouseId,
          quantity: item.quantity,
          reason: values.reason,
        };

        if (
          values.reason === "Warehouse Transfer" &&
          values.destination_warehouse
        ) {
          const destinationWarehouse = warehouses?.find(
            (w) => w.name === values.destination_warehouse
          );
          if (destinationWarehouse) {
            baseItem.destination_warehouse_id = destinationWarehouse.id;
          }
        }

        if (values.note) {
          baseItem.note = values.note;
        }

        return baseItem;
      }),
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
              style={{ color: "#000000D9", fontSize: "20px", fontWeight: 500 }}
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
            <Empty description="No inventory items available for this warehouse." />
          ) : (
            <Form.List name="items">
              {(fields) => (
                <div
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
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

                  {fields.map(({ key, name, ...restField }, index) => {
                    const item = inventoryItems[name];
                    if (!item) return null;

                    return (
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
                        {/* Product Name */}
                        <Col span={6}>
                          <Typography.Text>{item.product.name}</Typography.Text>
                        </Col>

                        {/* Product SKU */}
                        <Col span={4}>
                          <Flex style={{ gap: 4 }}>
                            <TagOutlined />
                            <Typography.Text>
                              {item.product.sku}
                            </Typography.Text>
                          </Flex>
                        </Col>

                        {/* Stock */}
                        <Col span={6}>
                          <Typography.Text>{item.quantity}</Typography.Text>
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
                                message: "Quantity must be at least 1",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={1}
                              max={item.quantity}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
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
  );
};

export default StockOut;
