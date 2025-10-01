import { PurchaseOrderDto } from "@/types/purchase-order/purchase-order.type";
import { MenuOutlined, UploadOutlined } from "@ant-design/icons";
import type { CheckboxOptionType } from "antd/es/checkbox/Group";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Flex,
  Form,
  Modal,
  Select,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useProductCurrencies } from "@/hooks/products/useProductCurrencies";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { PurchaseOrderRegionsResponse } from "@/types/purchase-order/purchase-order-region.type";

const { RangePicker } = DatePicker;

export type FlattenedPurchaseOrderDto = PurchaseOrderDto & {
  inv_number?: string;
  inv_currency?: string;
  inv_exchange_rate_to_usd?: number;
  inv_amount?: number;
  inv_quantity?: number;
  inv_sku?: string;
  inv_name?: string;
  inv_price?: number;
  stock_type?: string;
  stock_qty?: number;
  stock_sku?: string;
};

export type ExportColumn = {
  key: keyof FlattenedPurchaseOrderDto;
  label: string;
};

const AVAILABLE_COLUMNS: ExportColumn[] = [
  { key: "purchase_order_no", label: "Purchase Order No" },
  { key: "order_date", label: "Order Date" },
  { key: "contact_person", label: "Contact Person" },
  { key: "expected_delivery_date", label: "Expected Delivery Date" },
  { key: "amount_local", label: "Amount (Local)" },
  { key: "amount_usd", label: "Amount (USD)" },
  { key: "region", label: "Region" },
  { key: "supplier", label: "Supplier" },
  { key: "currency_code", label: "Currency" },
  { key: "purchase_order_smart_status", label: "Status" },
  { key: "inv_number", label: "Invoice Number" },
  { key: "inv_amount", label: "Invoice Amount (Local)" },
  { key: "inv_exchange_rate_to_usd", label: "Invoice Amount (USD)" },
  { key: "inv_quantity", label: "Invoice Quantity" },
  { key: "inv_sku", label: "Invoice SKU" },
  { key: "inv_price", label: "Invoice Price" },
  { key: "inv_currency", label: "Invoice Currency" },
  { key: "inv_name", label: "Invoice Product Name" },
  { key: "stock_type", label: "Stock Type" },
  { key: "stock_qty", label: "Stock Qty" },
  { key: "stock_sku", label: "Stock SKU" },
];

type TransactionDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: (config: {
    filters: {
      dateFrom?: string;
      dateTo?: string;
      region?: string;
      status?: string;
      currency?: string;
    };
    columns: ExportColumn[];
  }) => void;
};

const PurchaseOrderExportCSVModal = ({
  open,
  onClose,
  onExport,
}: TransactionDetailsModalProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [orderedCols, setOrderedCols] =
    useState<ExportColumn[]>(AVAILABLE_COLUMNS);

  const { data: regionsRaw, isLoading: regionsLoading } = useGetAll(
    "purchase-orders/purchase-orders-regions",
    ["regions"]
  );

  const regions = regionsRaw as PurchaseOrderRegionsResponse[];

  const { data: currencyData, isLoading: currencyLoading } =
    useProductCurrencies();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const selectedCols = orderedCols.filter((c) =>
        selectedKeys.includes(c.key)
      );

      if (selectedCols.length === 0) {
        message.error("Please select at least one column");
        return;
      }

      const [dateFrom, dateTo] = values.period || [];

      onExport({
        filters: {
          dateFrom: dateFrom ? dateFrom.format("YYYY-MM-DD") : undefined,
          dateTo: dateTo ? dateTo.format("YYYY-MM-DD") : undefined,
          region: values.region !== "All Regions" ? values.region : undefined,
          status: values.status !== "All Statuses" ? values.status : undefined,
          currency:
            values.currency !== "All Currencies" ? values.currency : undefined,
        },
        columns: selectedCols,
      });

      onClose();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrderedCols((items) => {
        const oldIndex = items.findIndex((c) => c.key === active.id);
        const newIndex = items.findIndex((c) => c.key === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0]) {
      setStartDate(dates[0]);
    } else {
      setStartDate(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      footer={null}
      closeIcon={false}
      width={800}
      styles={{
        body: { padding: 0 },
        content: { padding: 0 },
      }}
    >
      <Flex
        gap={12}
        align="center"
        justify="center"
        style={{
          background: "linear-gradient(90deg, #F9F0FF 0%, #FFFFFF 100%)",
          width: "100%",
          padding: "12px 16px",
          borderRadius: 5,
          height: 80,
        }}
      >
        <UploadOutlined
          style={{
            backgroundColor: "#9254DE",
            padding: 8,
            borderRadius: 50,
            color: "#FFFFFF",
          }}
        />
        <Typography.Text
          style={{ color: "#000000D9", fontSize: 20, fontWeight: 500 }}
        >
          Export CSV
        </Typography.Text>
      </Flex>

      <Divider style={{ margin: 0, borderColor: "#D3ADF7" }} />
      <Form
        form={form}
        layout="vertical"
        style={{
          paddingLeft: 40,
          paddingRight: 40,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <Flex gap={12}>
          <Form.Item
            label="Order Date"
            name="orderDate"
            style={{ width: "100%" }}
            rules={[
              { required: true, message: "Please set order date range." },
            ]}
          >
            <RangePicker
              // disabledDate={disableDate}
              onCalendarChange={handleRangeChange}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            style={{ width: "100%" }}
            label="Region"
            name="region"
            required
            rules={[{ required: true, message: "Please select region." }]}
          >
            <Select
              allowClear
              placeholder="Select region"
              style={{ width: "100%" }}
              loading={regionsLoading}
              value={form.getFieldValue("region")}
            >
              <Select.Option value="All Regions">All Regions</Select.Option>
              {regions?.map((region: any) => (
                <Select.Option key={region.id} value={region.name}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Flex>
        <Flex gap={12}>
          <Form.Item
            style={{ width: "100%" }}
            label="Status"
            name="status"
            required
            rules={[{ required: true, message: "Please select status." }]}
          >
            <Select
              allowClear
              placeholder="Select status"
              style={{ width: "100%" }}
              value={form.getFieldValue("status")}
            >
              <Select.Option value="All Statuses">All Statuses</Select.Option>
              <Select.Option value="Not Started">Not Started</Select.Option>
              <Select.Option value="Partially Invoiced">
                Partially Invoiced
              </Select.Option>
              <Select.Option value="Awaiting Delivery">
                Awaiting Delivery
              </Select.Option>
              <Select.Option value="Partially Received">
                Partially Received
              </Select.Option>
              <Select.Option value="Closed">Closed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={{ width: "100%" }}
            label="Currency"
            name="currency"
            required
            rules={[{ required: true, message: "Please select currency." }]}
          >
            <Select
              allowClear
              placeholder="Select currency"
              style={{ width: "100%" }}
              loading={currencyLoading}
              value={form.getFieldValue("currency")}
            >
              <Select.Option value="All Currencies">
                All Currencies
              </Select.Option>
              {currencyData?.map((currency) => (
                <Select.Option key={currency.id} value={currency.currency_code}>
                  {currency.currency_code}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Flex>
        <Form.Item
          style={{ width: "100%" }}
          label="Select and Arrange Columns"
          name="select_and_arrange_columns"
          required
          rules={[
            { required: true, message: "Please select at least one column." },
          ]}
        >
          <Card
            variant="outlined"
            style={{
              // maxHeight: 400,
              height: "100%",
            }}
            styles={{
              body: {
                margin: 0,
                paddingTop: 4,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                overflow: "hidden",
              },
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedCols.map((c) => c.key)}
                strategy={verticalListSortingStrategy}
              >
                {orderedCols.map((col) => (
                  <SortableItem
                    key={col.key}
                    id={col.key}
                    label={col.label}
                    checked={selectedKeys.includes(col.key)}
                    onToggle={() => {
                      setSelectedKeys((prev) =>
                        prev.includes(col.key)
                          ? prev.filter((k) => k !== col.key)
                          : [...prev, col.key]
                      );
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Card>
        </Form.Item>
        <Flex gap={12} justify="end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleOk} icon={<UploadOutlined />}>
            Export
          </Button>
        </Flex>
      </Form>
    </Modal>
  );
};

export default PurchaseOrderExportCSVModal;

function SortableItem({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="flex items-center justify-between py-2 px-2 bg-white"
      >
        <Checkbox required checked={checked} onChange={onToggle}>
          {label}
        </Checkbox>
        <span {...listeners} className="cursor-grab text-gray-400">
          <MenuOutlined />
        </span>
      </div>
      <Divider style={{ margin: 0 }} />
    </div>
  );
}
