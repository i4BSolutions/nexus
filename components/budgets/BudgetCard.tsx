"use client";

import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import {
  Card,
  Tag,
  Progress,
  Tooltip,
  Row,
  Col,
  Empty,
  Typography,
  Popover,
} from "antd";
import {
  InfoCircleOutlined,
  DollarCircleOutlined,
  EllipsisOutlined,
  StopOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";

type BudgetsSectionProps = {
  data: BudgetResponse;
  onStatusChange: (budget: Budget) => void;
};

const BudgetCard = ({ data, onStatusChange }: BudgetsSectionProps) => {
  const budgets = data.items;

  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  if (budgets.length === 0) {
    return <Empty description="No budgets found" />;
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      <Row gutter={[16, 16]}>
        {budgets.map((budget) => (
          <Col xs={24} sm={12} md={12} lg={8} key={budget.id}>
            <Card
              style={{ borderRadius: 12, overflow: "hidden" }}
              styles={{ body: { padding: 0 } }}
            >
              {/* Gradient Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #E6FFFB, #FFFFFF)",
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #36CFC9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      background: "#36CFC9",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <DollarCircleOutlined
                      style={{
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      {budget.budget_name}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {budget.project_name}
                      <Tag
                        style={{ borderRadius: 8 }}
                        color={budget.status ? "green" : "red"}
                      >
                        {budget.status ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </div>
                </div>
                <Popover
                  content={
                    <div style={{ width: 160 }}>
                      <div
                        onClick={() => {
                          onStatusChange?.(budget);
                          setOpenPopoverId(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        {budget.status ? (
                          <StopOutlined style={{ marginRight: 8 }} />
                        ) : (
                          <CheckCircleOutlined style={{ marginRight: 8 }} />
                        )}
                        <span>{budget.status ? "Inactive" : "Active"}</span>
                      </div>
                    </div>
                  }
                  open={openPopoverId === budget.id}
                  onOpenChange={(visible) => {
                    setOpenPopoverId(visible ? budget.id : null);
                  }}
                  trigger="click"
                  placement="bottomRight"
                >
                  <EllipsisOutlined
                    style={{
                      cursor: "pointer",
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </Popover>
              </div>

              {/* Card Body */}
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: 13,
                  }}
                >
                  <Typography.Text
                    style={{
                      fontWeight: 400,
                      fontSize: 14,
                      color: "#00000073",
                    }}
                  >
                    Planned Budget
                  </Typography.Text>
                  <Typography.Text
                    strong
                    style={{
                      fontSize: 30,
                      fontWeight: 500,
                      color: "#000000D9",
                    }}
                  >
                    $ {budget.planned_amount_usd.toLocaleString()}
                  </Typography.Text>
                </div>

                {/* Period */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                    justifyContent: "space-between",
                  }}
                >
                  <Typography.Text
                    style={{
                      color: "#00000073",
                      fontSize: 14,
                      fontWeight: 400,
                    }}
                  >
                    Period
                  </Typography.Text>
                  <Typography.Text
                    strong
                    style={{
                      color: "#000000D9",
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {dayjs(budget.start_date).format("MMM D, YYYY")} -{" "}
                    {dayjs(budget.end_date).format("MMM D, YYYY")}
                  </Typography.Text>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ flexDirection: "column", display: "flex" }}>
                    <div>
                      <Typography.Text
                        style={{
                          color: "#00000073",
                          fontSize: 14,
                          fontWeight: 400,
                        }}
                      >
                        Allocated{" "}
                      </Typography.Text>
                      <Tooltip title="Amount allocated to teams">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: "#888" }}
                        />
                      </Tooltip>
                    </div>
                    <Typography.Text
                      strong
                      style={{
                        color: "#000000D9",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      $ {budget.allocated_amount_usd?.toLocaleString()}
                    </Typography.Text>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div>
                      <Typography.Text
                        style={{
                          color: "#00000073",
                          fontSize: 14,
                          fontWeight: 400,
                        }}
                      >
                        Allocated Variance{" "}
                      </Typography.Text>
                      <Tooltip title="Unallocated budget portion">
                        <InfoCircleOutlined
                          style={{ marginLeft: 4, color: "#888" }}
                        />
                      </Tooltip>
                    </div>
                    <Typography.Text
                      strong
                      style={{
                        color: "#000000D9",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      $ {budget.allocated_variance_usd?.toLocaleString()}
                    </Typography.Text>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography.Text
                      style={{
                        color: "#00000073",
                        fontWeight: 400,
                        fontSize: 14,
                      }}
                    >
                      Allocation
                    </Typography.Text>
                    <Typography.Text strong style={{}}>
                      {budget.allocation_percentage}%
                    </Typography.Text>
                  </div>
                  <Progress
                    percent={budget.allocation_percentage}
                    strokeColor="#40A9FF"
                    trailColor="#F5F5F5"
                    showInfo={false}
                  />
                </div>

                {/* Invoiced */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  <div>
                    <Typography.Text
                      style={{
                        color: "#00000073",
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      Invoiced{" "}
                    </Typography.Text>
                    <Tooltip title="Invoiced amount">
                      <InfoCircleOutlined
                        style={{ marginLeft: 4, color: "#888" }}
                      />
                    </Tooltip>
                    <div style={{ fontWeight: 600 }}>
                      $ {budget.invoiced_amount_usd?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Typography.Text
                      style={{
                        color: "#00000073",
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      Unutilized{" "}
                    </Typography.Text>
                    <Tooltip title="Remaining unutilized portion">
                      <InfoCircleOutlined
                        style={{ marginLeft: 4, color: "#888" }}
                      />
                    </Tooltip>
                    <div style={{ fontWeight: 600 }}>
                      $ {budget.unutilized_amount_usd?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography.Text
                      style={{
                        color: "#00000073",
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      Utilization{" "}
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        textAlign: "right",
                        color: "#888",
                        fontSize: 13,
                      }}
                    >
                      {budget.utilization_percentage}%
                    </Typography.Text>
                  </div>
                  <Progress
                    percent={budget.utilization_percentage}
                    strokeColor="#9254DE"
                    trailColor="#F5F5F5"
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BudgetCard;
