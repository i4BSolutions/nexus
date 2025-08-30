"use client";

import { useGetById } from "@/hooks/react-query/useGetById";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { useList } from "@/hooks/react-query/useList";
import { ProductResponse } from "@/types/product/product.type";
import {
  StockTransactionFilterParams,
  StockTransactionInterface,
  StockTransactionInterfaceResponse,
} from "@/types/stock/stock.type";
import { WarehouseResponse } from "@/types/warehouse/warehouse.type";
import {
  CalendarOutlined,
  DownCircleOutlined,
  UpCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  DatePicker,
  Empty,
  Flex,
  Pagination,
  Select,
  Space,
  Tag,
  Typography,
  Modal,
  Spin,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import VoidTransactionModal from "./VoidModal";
import { VoidPreview } from "@/types/inventory/stock-transaction.type";

const { RangePicker } = DatePicker;

const Transactions = () => {
  const { message } = App.useApp();

  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<
    "All Directions" | "Stock In" | "Stock Out" | undefined
  >("All Directions");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [voidOpen, setVoidOpen] = useState(false);
  const [voidTx, setVoidTx] = useState<VoidPreview | null>(null);
  const [voidLoading, setVoidLoading] = useState(false);

  const {
    data: stockTransactionsData,
    isLoading: stockTransactionsLoading,
    error: stockTransactionsError,
  } = useGetWithParams<
    StockTransactionInterfaceResponse,
    StockTransactionFilterParams
  >("stock-transactions", {
    start_date: dateRange?.[0]?.startOf("day").toISOString(),
    end_date: dateRange?.[1]?.endOf("day").toISOString(),
    direction: direction,
    warehouse: warehouseId,
    product: productId,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useList<ProductResponse>("products", {
    pageSize: "all" as any,
    status: "true",
  });

  const {
    data: warehousesData,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useList<WarehouseResponse>("warehouses");

  const productsFilterHandler = (value: string) => {
    setProductId(value === "All Products" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const warehouseFilterHandler = (value: string) => {
    setWarehouseId(value === "All Warehouses" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const directionFilterHandler = (
    value: "All Directions" | "Stock In" | "Stock Out"
  ) => {
    setDirection(value === "All Directions" ? undefined : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFiltersHandler = () => {
    setWarehouseId(undefined);
    setProductId(undefined);
    setDirection(undefined);
    setDateRange(null);
    setPagination({ page: 1, pageSize: 10 });
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  const handleView = (id: string) => {
    setSelectedTransactionId(id);
    setIsModalOpen(true);
  };

  const {
    data: transactionDetails,
    isLoading: transactionDetailsLoading,
    error: transactionDetailsError,
  } = useGetById<StockTransactionInterface>(
    "stock-transactions",
    selectedTransactionId && isModalOpen ? selectedTransactionId : ""
  );

  const openVoidModal = async (id: string) => {
    try {
      setVoidLoading(true);
      setSelectedTransactionId(id);

      const res = await fetch(`/api/stock-transactions/void-preview/${id}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to load void preview.");
      }

      const json = await res.json();
      const previewData: VoidPreview = json.data;

      setVoidTx(previewData);
      setVoidOpen(true);
    } catch (e: any) {
      message.error(e?.message ?? "Failed to load void preview.");
    } finally {
      setVoidLoading(false);
    }
  };

  const confirmVoid = async (reason: string) => {
    setVoidLoading(true);
    try {
      const res = await fetch(
        `/api/stock-transactions/${selectedTransactionId}/void`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
      message.success("Transaction voided.");
      setVoidOpen(false);
      setVoidTx(null);
    } catch (e: any) {
      message.error(e?.message ?? "Failed to void transaction.");
    } finally {
      setVoidLoading(false);
    }
  };

  const columns: ColumnsType<StockTransactionInterface> = useMemo(
    () => [
      {
        title: "DATE & TIME",
        key: "date_and_time",
        dataIndex: "date",
        render: (_, record) => (
          <>
            <Typography.Text>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {record.date}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary">{record.time}</Typography.Text>
          </>
        ),
      },
      {
        title: "PRODUCT",
        dataIndex: "product",
        key: "product",
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend"],
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text style={{ fontSize: "14px" }}>
              {record.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
              {record.sku}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "WAREHOUSE",
        dataIndex: "warehouse",
        key: "warehouse",
        render: (warehouse) => <Typography.Text>{warehouse}</Typography.Text>,
      },
      {
        title: "DIRECTION",
        dataIndex: "direction",
        key: "direction",
        render: (direction, record) => (
          <Space>
            <Tag
              style={{ borderRadius: 10, display: "flex", gap: 4 }}
              color={direction === "Stock In" ? "#52C41A" : "#FAAD14"}
            >
              {direction === "Stock In" ? (
                <DownCircleOutlined />
              ) : (
                <UpCircleOutlined />
              )}
              {direction}
            </Tag>
            {record.is_voided && (
              <WarningOutlined style={{ color: "#FF4D4F" }} />
            )}
          </Space>
        ),
      },
      {
        title: "QUANTITY",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity) => <Typography.Text>{quantity}</Typography.Text>,
      },
      {
        title: "REFERENCE",
        dataIndex: "reference",
        key: "reference",
        render: (reference) => <Typography.Text>{reference}</Typography.Text>,
      },
      {
        title: "NOTE",
        dataIndex: "note",
        key: "note",
        render: (note) => <Typography.Text>{note}</Typography.Text>,
      },
      {
        title: "Evidence",
        dataIndex: "evidence",
        key: "evidence",
        render: (_) => <Typography.Text>-</Typography.Text>,
      },
      {
        title: "ACTION",
        key: "action",
        render: (_, record) => (
          <Space size={0}>
            <Button
              variant="link"
              color="primary"
              onClick={() => handleView(String(record.id))}
            >
              View
            </Button>
            {!record.is_voided && (
              <Button
                variant="link"
                color="danger"
                onClick={() => openVoidModal(String(record.id))}
              >
                Void
              </Button>
            )}
          </Space>
        ),
      },
    ],
    []
  );

  if (stockTransactionsError || productsError || warehouseError) {
    message.error(
      stockTransactionsError?.message ||
        productsError?.message ||
        warehouseError?.message
    );
    return <Empty description="Server Error." />;
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full mb-4">
        <span>Filter(s):</span>
        <RangePicker
          onChange={(dates) => setDateRange(dates)}
          allowClear
          style={{ minWidth: 260 }}
          value={dateRange}
        />

        <Select
          loading={productsLoading}
          value={productId ?? "All Products"}
          style={{ width: 130 }}
          onChange={productsFilterHandler}
          options={[
            { value: "All Products", label: "All Products" },
            ...(productsData?.items.map((w) => ({
              value: w.id,
              label: w.name,
            })) || []),
          ]}
        />

        <Select
          loading={warehouseLoading}
          value={warehouseId ?? "All Warehouses"}
          onChange={warehouseFilterHandler}
          options={[
            { value: "All Warehouses", label: "All Warehouses" },
            ...(warehousesData?.items.map((w) => ({
              value: w.id,
              label: w.name,
            })) || []),
          ]}
        />

        <Select
          value={direction ?? "All Directions"}
          style={{ width: 130 }}
          onChange={directionFilterHandler}
          options={[
            {
              value: "All Directions",
              label: "All Directions",
            },
            {
              value: "Stock In",
              label: "Stock In",
            },
            {
              value: "Stock Out",
              label: "Stock Out",
            },
          ]}
        />

        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={clearFiltersHandler}
        >
          Clear Filter(s)
        </Button>
      </div>
      <div style={{ width: "100%" }}>
        <Table
          columns={columns}
          loading={stockTransactionsLoading}
          dataSource={stockTransactionsData?.items}
          pagination={false}
          bordered
          rowKey="id"
          scroll={{ x: true }}
          style={{
            border: "2px solid #F5F5F5",
            borderRadius: "8px",
            width: "100%",
          }}
          footer={() => (
            <Flex justify="space-between" align="center" gap={4}>
              <Typography.Text>
                Total {stockTransactionsData?.total} items
              </Typography.Text>
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={stockTransactionsData?.total}
                onChange={paginationChangeHandler}
              />
            </Flex>
          )}
        />
      </div>

      <VoidTransactionModal
        open={voidOpen}
        loading={false}
        tx={voidTx}
        onCancel={() => {
          setVoidOpen(false);
          setSelectedTransactionId(null);
          setVoidTx(null);
        }}
        onConfirm={confirmVoid}
      />

      {/* Transaction Details Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedTransactionId(null);
        }}
        footer={null}
        title="Transaction Details"
      >
        {transactionDetailsLoading ? (
          <Spin />
        ) : transactionDetailsError ? (
          <Typography.Text type="danger">
            Error loading details.
          </Typography.Text>
        ) : transactionDetails ? (
          <div>
            <Typography.Text strong>Date:</Typography.Text>{" "}
            {transactionDetails.date} {transactionDetails.time}
            <br />
            <Typography.Text strong>Product:</Typography.Text>{" "}
            {transactionDetails.name} ({transactionDetails.sku})
            <br />
            <Typography.Text strong>Warehouse:</Typography.Text>{" "}
            {transactionDetails.warehouse}
            <br />
            <Typography.Text strong>Direction:</Typography.Text>{" "}
            {transactionDetails.direction}
            <br />
            <Typography.Text strong>Quantity:</Typography.Text>{" "}
            {transactionDetails.quantity}
            <br />
            <Typography.Text strong>Reference:</Typography.Text>{" "}
            {transactionDetails.reference}
            <br />
            <Typography.Text strong>Note:</Typography.Text>{" "}
            {transactionDetails.note}
            <br />
            {/* Add more fields as needed */}
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default Transactions;
