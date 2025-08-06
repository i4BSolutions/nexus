import {
  BudgetAllocationHistory,
  InvoiceHistory,
  UsageHistoryDto,
} from "@/types/purchase-order/purchase-order-detail.type";
import {
  DollarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Card, Flex, Progress, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import PoBudgetAllocationTable from "./PoBudgetAllocationTable";
import PoInvoiceTable from "./PoInvoiceTable";
import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";

export default function PoUsageHistory({ id }: { id: string }) {
  const [invoicePagination, setInvoicePagination] = useState({
    page: 1,
    pageSize: 3,
  });
  const [budgetPagination, setBudgetPagination] = useState({
    page: 1,
    pageSize: 3,
  });

  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [budgetAllocationTotal, setBudgetAllocationTotal] = useState(0);

  const { data: invoiceHistory, refetch: refetchInvoice } =
    usePaginatedById<InvoiceHistory>(
      "purchase-orders/invoices",
      id,
      invoicePagination
    );

  const { data: budgetAllocationHistory, refetch: refetchBudgetAllocation } =
    usePaginatedById<BudgetAllocationHistory>(
      "purchase-orders/budget-allocations",
      id,
      budgetPagination
    );

  useEffect(() => {
    refetchInvoice();
  }, [invoicePagination]);

  useEffect(() => {
    refetchBudgetAllocation();
  }, [budgetPagination]);

  useEffect(() => {
    if (invoiceHistory) {
      setInvoiceTotal(invoiceHistory.total);
    }
  }, [invoiceHistory]);

  useEffect(() => {
    if (budgetAllocationHistory) {
      setBudgetAllocationTotal(budgetAllocationHistory.total);
    }
  }, [budgetAllocationHistory]);

  const handleInvoicePageChange = (page: number, pageSize?: number) => {
    setInvoicePagination({ page, pageSize: pageSize ?? 3 });
  };

  const handleBudgetPageChange = (page: number, pageSize?: number) => {
    setBudgetPagination({ page, pageSize: pageSize ?? 3 });
  };

  return (
    <section className="w-full space-y-8 pb-12">
      {/* Related Invoices */}
      <div className="rounded-2xl border-2 border-[#F5F5F5]">
        {/* Invoice Header */}
        <Flex
          align="center"
          gap={16}
          style={{
            padding: "16px 24px",
            borderRadius: "16px 16px 0 0",
            background:
              "linear-gradient(90deg, #FFFBE6 0%, rgba(255, 255, 255, 0.00) 100%)",
            borderBottom: "1px solid #FFE58F",
          }}
        >
          <FileTextOutlined
            style={{
              width: 32,
              height: 32,
              background: "#FFC53D",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 20,
            }}
          />
          <div>
            <Typography.Title level={3} className="!mb-0">
              Related Invoices
            </Typography.Title>
            <Typography.Text type="secondary">
              Invoices linked to this purchase order{" "}
            </Typography.Text>
          </div>
        </Flex>

        {/* Invoice Stats */}
        <div className="px-6 mt-8 flex gap-8 items-center">
          {/* Invoice Coverage Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Statistic
                title={"Invoice Coverage"}
                value={invoiceHistory?.statistics.total_paid_percent.toFixed(2)}
                suffix={"%"}
              />
              <FileTextOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#FFC53D",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex
              align="center"
              gap={12}
              style={{ marginBottom: 10, marginTop: 10 }}
            >
              <Progress
                percent={invoiceHistory?.statistics.total_paid_percent}
                strokeColor={"#FFC53D"}
                showInfo={false}
              />
              ${invoiceHistory?.statistics.total_paid_usd.toLocaleString()}/
              {invoiceHistory?.statistics.total_amount_usd.toLocaleString()}
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {invoiceHistory?.statistics.total_invoices} Invoices Created
            </Typography.Text>
          </Card>
          {/* Payment Status Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Statistic
                title={"Payment Status"}
                value={invoiceHistory?.statistics.total_paid_percent.toFixed(2)}
                suffix={"%"}
              />
              <DollarOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#36CFC9",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex
              align="center"
              gap={12}
              style={{ marginBottom: 10, marginTop: 10 }}
            >
              <Progress
                percent={invoiceHistory?.statistics.total_paid_percent}
                strokeColor={"#36CFC9"}
                showInfo={false}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Paid: $
                {invoiceHistory?.statistics.total_paid_usd.toLocaleString()}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Remaining: $
                {invoiceHistory?.statistics.total_remaining_usd.toLocaleString()}
              </Typography.Text>
            </Flex>
          </Card>
          {/* Item Coverage Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Statistic
                title={"Item Coverage"}
                value={invoiceHistory?.statistics.total_invoiced_items_percentage.toFixed(
                  2
                )}
                suffix={"%"}
              />
              <TagOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#9254DE",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex
              align="center"
              gap={12}
              style={{ marginBottom: 10, marginTop: 10 }}
            >
              <Progress
                percent={
                  invoiceHistory?.statistics.total_invoiced_items_percentage
                }
                strokeColor={"#9254DE"}
                showInfo={false}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Item Invoiced: {invoiceHistory?.statistics.total_invoiced_items}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Remaining: {invoiceHistory?.statistics.total_remaining_items}
              </Typography.Text>
            </Flex>
          </Card>
        </div>

        {/* Invoice Table */}
        <PoInvoiceTable
          data={invoiceHistory?.invoices ?? []}
          total={invoiceTotal}
          pagination={invoicePagination}
          paginationChangeHandler={handleInvoicePageChange}
        />
      </div>

      {/* Related Budget Allocations */}
      <div className="rounded-2xl border-2 border-[#F5F5F5]">
        {/* Budget Allocations Header */}
        <Flex
          align="center"
          gap={16}
          style={{
            padding: "16px 24px",
            borderRadius: "16px 16px 0 0",
            background: "linear-gradient(90deg, #E6FFFB 0%, #FFF 100%)",
            borderBottom: "1px solid #87E8DE",
          }}
        >
          <FileTextOutlined
            style={{
              width: 32,
              height: 32,
              background: "#36CFC9",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 20,
            }}
          />
          <div>
            <Typography.Title level={3} className="!mb-0">
              Related Budget Allocations
            </Typography.Title>
            <Typography.Text type="secondary">
              Budget allocations linked to this purchase order
            </Typography.Text>
          </div>
        </Flex>

        {/* Budget Allocation Stats */}
        <div className="px-6 mt-8 flex gap-8 items-center">
          {/* Total PO Amount Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 10 }}
            >
              {" "}
              <Statistic
                title={"Total PO Amount"}
                value={budgetAllocationHistory?.statistics.total_po_amount_usd.toLocaleString()}
                prefix="$"
              />
              <DollarOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#36CFC9",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {budgetAllocationHistory?.statistics.total_po_amount_local.toLocaleString()}{" "}
                {
                  budgetAllocationHistory?.statistics
                    .purchase_order_currency_code
                }
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                (in PO Currency)
              </Typography.Text>
            </Flex>
          </Card>
          {/* Allocated Amount Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 10 }}
            >
              {" "}
              <Statistic
                title={"Allocated Amount (USD)"}
                value={budgetAllocationHistory?.statistics.total_allocated_usd.toLocaleString()}
                prefix="$"
              />
              <DollarOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#36CFC9",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {budgetAllocationHistory?.statistics.total_allocated_local.toLocaleString()}{" "}
                {
                  budgetAllocationHistory?.statistics
                    .purchase_order_currency_code
                }
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                (in PO Currency)
              </Typography.Text>
            </Flex>
          </Card>
          {/* Remaining Amount Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 10 }}
            >
              {" "}
              <Statistic
                title={"Remaining Amount(USD)"}
                value={budgetAllocationHistory?.statistics.total_remaining_usd.toLocaleString()}
                prefix="$"
              />
              <DollarOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#36CFC9",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {budgetAllocationHistory?.statistics.total_remaining_local.toLocaleString()}{" "}
                {
                  budgetAllocationHistory?.statistics
                    .purchase_order_currency_code
                }
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                (in PO Currency)
              </Typography.Text>
            </Flex>
          </Card>
          {/* Allocation Progress Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 10 }}
            >
              <Statistic
                title={"Allocation Progress"}
                value={budgetAllocationHistory?.statistics.allocation_progress_percent.toFixed(
                  2
                )}
                prefix="%"
              />
              <PercentageOutlined
                style={{
                  width: 32,
                  height: 32,
                  background: "#36CFC9",
                  borderRadius: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 20,
                }}
              />
            </Flex>
            <Progress
              percent={
                budgetAllocationHistory?.statistics.allocation_progress_percent
              }
              showInfo={false}
              strokeColor={"#36CFC9"}
            />
          </Card>
        </div>

        {/* Budget Allocation Table */}
        <PoBudgetAllocationTable
          data={budgetAllocationHistory?.budgetAllocations ?? []}
          total={budgetAllocationTotal}
          pagination={budgetPagination}
          paginationChangeHandler={handleBudgetPageChange}
        />
      </div>
    </section>
  );
}
