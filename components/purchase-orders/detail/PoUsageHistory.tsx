import { UsageHistoryDto } from "@/types/purchase-order/purchase-order-detail.type";
import {
  DollarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Card, Flex, Progress, Statistic, Typography } from "antd";
import { useState } from "react";
import PoBudgetAllocationTable from "./PoBudgetAllocationTable";
import PoInvoiceTable from "./PoInvoiceTable";

const initialDetailData: UsageHistoryDto = {
  id: 1,
  invoiceCoverage: {
    percent: 100,
    totalAmount: 4000,
    totalInvoicedAmount: 4000,
    totalInvoices: 3,
  },
  paymentStatus: {
    percentage: 68.75,
    paid: 2750,
    remaining: 1250,
  },
  itemCoverage: {
    percentage: 100,
    itemsInvoiced: 2,
    itemsRemaining: 0,
  },
  invoices: [
    {
      id: 1,
      invoice_no: "INV-001",
      supplier: "Supplier A",
      invoice_date: "2023-10-01",
      due_date: "2023-10-15",
      amount_local: 2000,
      amount_usd: 200,
      currency_code: "THB",
      status: "Paid",
    },
    {
      id: 2,
      invoice_no: "INV-002",
      supplier: "Supplier A",
      invoice_date: "2023-10-05",
      due_date: "2023-10-20",
      amount_local: 1500,
      amount_usd: 150,
      currency_code: "THB",
      status: "Paid",
    },
  ],
  total_invoices: 3,
  totalPoAmountLocal: 4000,
  totalPoAmountUsd: 400,
  totalAllocatedAmountLocal: 4000,
  totalAllocatedAmountUsd: 400,
  totalRemainingAmountLocal: 4000,
  totalRemainingAmountUsd: 400,
  allocationProgressPercent: 100,
  budgetAllocations: [
    {
      id: 1,
      budget_no: "BUD-001",
      allocation_date: "2023-10-01",
      allocated_amount_local: 2000,
      allocated_amount_usd: 200,
      status: "Allocated",
      currency_code: "THB",
    },
    {
      id: 2,
      budget_no: "BUD-002",
      allocation_date: "2023-10-05",
      allocated_amount_local: 2000,
      allocated_amount_usd: 200,
      status: "Allocated",
      currency_code: "THB",
    },
  ],
  total_budget_allocations: 2,
};

export default function PoUsageHistory() {
  const [data, setData] = useState<UsageHistoryDto>(initialDetailData);
  const [invoicePagination, setInvoicePagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [budgetAllocationPagination, setBudgetAllocationPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const invoicePaginationChangeHandler = (page: number, pageSize?: number) => {
    setInvoicePagination({ page, pageSize: pageSize || 10 });
  };

  const budgetAllocationPaginationChangeHandler = (
    page: number,
    pageSize?: number
  ) => {
    setBudgetAllocationPagination({ page, pageSize: pageSize || 10 });
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
              <Statistic title={"Invoice Coverage"} value={100} suffix={"%"} />
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
                percent={100}
                strokeColor={"#FFC53D"}
                showInfo={false}
              />
              $4,000/4,000
            </Flex>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              3 Invoices Created
            </Typography.Text>
          </Card>
          {/* Payment Status Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Statistic title={"Invoice Coverage"} value={100} suffix={"%"} />
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
                percent={68.75}
                strokeColor={"#36CFC9"}
                showInfo={false}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Paid: $2,750
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Remaining: $1,250
              </Typography.Text>
            </Flex>
          </Card>
          {/* Item Coverage Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex justify="space-between" align="center">
              <Statistic title={"Invoice Coverage"} value={100} suffix={"%"} />
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
                percent={100}
                strokeColor={"#9254DE"}
                showInfo={false}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Item Invoiced: 2
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Remaining: 0
              </Typography.Text>
            </Flex>
          </Card>
        </div>

        {/* Invoice Table */}
        <PoInvoiceTable
          data={data.invoices}
          total={data.total_invoices}
          pagination={invoicePagination}
          paginationChangeHandler={invoicePaginationChangeHandler}
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

        {/* Invoice Stats */}
        <div className="px-6 mt-8 flex gap-8 items-center">
          {/* Total PO Amount Card */}
          <Card style={{ border: "2px solid #F5F5F5", width: "100%" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 10 }}
            >
              {" "}
              <Statistic title={"Total PO Amount"} value={4000} prefix="$" />
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
                128,000 THB
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
                value={4000}
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
                128,000 THB
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
              <Statistic title={"Total PO Amount"} value={0} prefix="$" />
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
                0 THB
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
              <Statistic title={"Allocation Progress"} value={100} prefix="$" />
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
            <Progress percent={100} showInfo={false} strokeColor={"#36CFC9"} />
          </Card>
        </div>

        {/* Budget Allocation Table */}
        <PoBudgetAllocationTable
          data={data.budgetAllocations}
          total={data.total_budget_allocations}
          pagination={budgetAllocationPagination}
          paginationChangeHandler={budgetAllocationPaginationChangeHandler}
        />
      </div>
    </section>
  );
}
