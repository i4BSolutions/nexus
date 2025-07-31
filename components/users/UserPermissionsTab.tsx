import { UserDetailResponse } from "@/types/user/user-detail.type";
import {} from "@/types/user/user.type";
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  FileDoneOutlined,
  FileOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Col, Row, Typography } from "antd";

export default function UserPermissionsTab({
  data,
}: {
  data: UserDetailResponse;
}) {
  return (
    <div className="rounded-2xl border-2 border-[#F5F5F5]">
      <div
        className="px-6 py-3 rounded-tl-2xl rounded-tr-2xl flex items-center gap-3 border-b border-[#D3ADF7]"
        style={{ background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)" }}
      >
        <div className="rounded-full bg-[#9254DE] size-8 grid place-items-center">
          <FileDoneOutlined style={{ fontSize: 20, color: "white" }} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-medium">Access Permissions</span>
          <Typography.Text type="secondary">
            Control which parts of the system this user can access
          </Typography.Text>
        </div>
      </div>
      <div className="px-6">
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#40A9FF] rounded-full grid place-items-center">
              <ShoppingCartOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Purchase Orders</span>
          </Col>

          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_purchase_orders ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Purchase Orders</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view purchase order list and details
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>

          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_purchase_orders ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Purchase Orders</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete purchase orders
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#FFC53D] rounded-full grid place-items-center">
              <FileOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Invoices</span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_invoices ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Invoices</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view invoice list and details
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_invoices ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Invoices</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete invoices
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#9254DE] rounded-full grid place-items-center">
              <TagOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Products & Suppliers</span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_products_suppliers ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Products & Suppliers</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view list and details of products & suppliers
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_products_suppliers ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Products & Suppliers</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete products & suppliers
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stock Management */}
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#FFA940] rounded-full grid place-items-center">
              <AuditOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Stock Management</span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_stock ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Stock</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view inventory and stock movements
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 12,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_stock_in ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Record Stock-In</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can record incoming stock movements
                  </Typography.Text>
                </div>
              </div>
            </div>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_stock_out ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Record Stock-Out</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can record outgoing stock movements
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#597EF7] rounded-full grid place-items-center">
              <HomeOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Warehouses</span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_warehouses ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Warehouses</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view warehouse list and details
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_warehouses ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Warehouses</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete warehouses
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            borderBottom: "2px solid #F5F5F5",
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#36CFC9] rounded-full grid place-items-center">
              <DollarCircleOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">Budget Management</span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_budget_allocations ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Budgets & Allocations</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view budgets & allocations
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_budget_allocations ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Budgets & Allocations</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and allocate budgets
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            padding: "24px 0",
          }}
        >
          <Col
            span={8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="size-8 bg-[#FF4D4F] rounded-full grid place-items-center">
              <SettingOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <span className=" text-lg font-semibold">
              Administrative Access
            </span>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_read_dashboard ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">View Dashboard</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can access the main system dashboard
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                marginBottom: 0,
                width: "100%",
              }}
            >
              <div className="flex items-center gap-4">
                {data.permissions.can_manage_users ? (
                  <CheckCircleOutlined
                    style={{ color: "#722ED1", fontSize: 20 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ fontSize: 20, color: "rgba(0, 0, 0, 0.25)" }}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">Manage Users</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and manage user accounts and their
                    permissions
                  </Typography.Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
