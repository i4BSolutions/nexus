"use client";

import DepartmentCreateModal from "@/components/users/DepartmentCreateModal";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { DepartmentInterface } from "@/types/departments/department.type";
import { UserFieldType } from "@/types/user/user.type";
import getAvatarUrl from "@/utils/getAvatarUrl";
import {
  ArrowLeftOutlined,
  AuditOutlined,
  DollarCircleOutlined,
  FileOutlined,
  HomeOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Col,
  Form,
  FormProps,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserCreationPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const { mutate: createUser } = useCreate("users");

  const { mutate: createDepartment } = useCreate("departments", [
    "departments",
  ]);

  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGetAll<
    DepartmentInterface[]
  >("departments", ["departments"]);

  const onFinish: FormProps<UserFieldType>["onFinish"] = (values) => {
    const permissionKeys = Object.keys(values).filter(
      (key) => key.startsWith("view_") || key.startsWith("manage_")
    );

    const hasAtLeastOnePermission = permissionKeys.some(
      (key) => values[key as keyof UserFieldType]
    );

    if (!hasAtLeastOnePermission) {
      message.error("Please select at least one permission for the user.");
      return;
    }

    console.log("Success:", values);
    console.log("payload:", {
      full_name: values.full_name,
      username: values.username,
      email: values.email,
      department: values.department,
      avatar: values.avatar || "",
      permissions: permissionKeys.reduce((acc, key) => {
        acc[`can_${key}`] = !!values[key as keyof UserFieldType];
        return acc;
      }, {} as Record<string, boolean>),
    });

    try {
      createUser(
        {
          full_name: values.full_name,
          username: "@" + values.username,
          email: values.email,
          department: values.department,
          avatar: values.avatar || "",
          permissions: permissionKeys.reduce((acc, key) => {
            acc[`can_${key}`] = !!values[key as keyof UserFieldType];
            return acc;
          }, {} as Record<string, boolean>),
        },
        {
          onSuccess: () => {
            message.success("User created successfully!");
            router.back();
          },
        }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Failed to create user. Please try again.");
    }
  };

  const handleDepartmentCreate = (values: { name: string }) => {
    console.log("Creating department with values:", values);
    createDepartment(values, {
      onSuccess: () => {
        message.success("Department created successfully!");
        setIsModalOpen(false);
      },
      onError: (error) => {
        console.error("Error creating department:", error);
        message.error("Failed to create department. Please try again.");
      },
    });
  };

  if (isDepartmentsLoading)
    return (
      <div className="h-[500px] grid place-items-center">
        <Spin />
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto py-4 px-6">
      {/* Header */}
      <Space
        size="small"
        style={{
          display: "flex",
          marginBottom: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space size="middle">
          <ArrowLeftOutlined style={{ fontSize: 16 }} onClick={handleCancel} />
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              Create New User
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Add a new user with custom permissions
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>

      <Form
        name="user-creation-form"
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{
          view_purchase_orders: false,
          manage_purchase_orders: false,
          view_invoices: false,
          manage_invoices: false,
          view_products_suppliers: false,
          manage_products_suppliers: false,
          view_stock: false,
          manage_stock_in: false,
          manage_stock_out: false,
          view_warehouses: false,
          manage_warehouses: false,
          view_budgets_allocations: false,
          manage_budgets_allocations: false,
          view_dashboard: false,
          manage_users: false,
        }}
      >
        {/* User Information */}
        <div className="border-t-2 border-r-2 border-l-2 border-[#F5F5F5] rounded-tr-2xl rounded-tl-2xl py-3 px-6 ">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">User Information</span>
            <Typography.Text type="secondary">
              Basic account details and contact information
            </Typography.Text>
          </div>
        </div>
        <div className="border-2 border-[#F5F5F5] rounded-br-2xl rounded-bl-2xl p-6 ">
          <div
            className="w-full flex flex-col items-center justify-center h-40 gap-1 mb-4"
            style={{
              background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
            }}
          >
            <img
              src={getAvatarUrl("username")}
              alt="avatar"
              className="rounded-full w-30 h-30 object-cover"
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Avatar will be generated automatically.
            </Typography.Text>
          </div>

          <div className="flex w-full justify-between items-center gap-6">
            <Form.Item
              label="Full Name"
              name="full_name"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please enter full name!" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
            <Form.Item
              label="Username"
              name="username"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please enter username!" }]}
            >
              <Input placeholder="Enter username" prefix={"@"} />
            </Form.Item>
          </div>

          <div className="flex w-full justify-between items-center gap-6">
            <Form.Item
              label="Email Address"
              name="email"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please enter email address!" },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
            <Form.Item
              label={
                <div className="flex justify-between w-full">
                  <span className="block">Department</span>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: 0, margin: 0 }}
                  >
                    Create New
                  </Button>
                </div>
              }
              name="department"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select department!" }]}
            >
              {departmentsData && (
                <Select
                  placeholder="Select department"
                  loading={isDepartmentsLoading}
                  options={
                    departmentsData.map((department) => ({
                      label: department.name,
                      value: department.id,
                    })) || []
                  }
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option
                      ? option.label.toLowerCase().includes(input.toLowerCase())
                      : false
                  }
                />
              )}
            </Form.Item>
          </div>
        </div>

        {/* Access Permissions */}
        <div className="border-t-2 border-r-2 border-l-2 border-[#F5F5F5] rounded-tr-2xl rounded-tl-2xl py-3 px-6 mt-4">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Access Permissions</span>
            <Typography.Text type="secondary">
              Control which parts of the system this user can access
            </Typography.Text>
          </div>
        </div>
        <div className="border-2 border-[#F5F5F5] rounded-br-2xl rounded-bl-2xl px-6 ">
          {/* Purchase Orders */}
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
              <Form.Item<UserFieldType>
                name="view_purchase_orders"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Purchase Orders</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view purchase order list and details
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_purchase_orders"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Purchase Orders</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and delete purchase orders
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <Form.Item<UserFieldType>
                name="view_invoices"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Invoices</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view invoice list and details
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_invoices"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Invoices</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and delete invoices
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <span className=" text-lg font-semibold">
                Products & Suppliers
              </span>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="view_products_suppliers"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Products & Suppliers</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view list and details of products & suppliers
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_products_suppliers"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Products & Suppliers</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and delete products & suppliers
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <Form.Item<UserFieldType>
                name="view_stock"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Stock</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view inventory and stock movements
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_stock_in"
                valuePropName="checked"
                style={{
                  marginBottom: 12,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Record Stock-In</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can record incoming stock movements
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
              <Form.Item<UserFieldType>
                name="manage_stock_out"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Record Stock-Out</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can record outgoing stock movements
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <Form.Item<UserFieldType>
                name="view_warehouses"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Warehouses</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view warehouse list and details
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_warehouses"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Warehouses</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and delete warehouses
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <Form.Item<UserFieldType>
                name="view_budgets_allocations"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Budgets & Allocations</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can view budgets & allocations
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_budgets_allocations"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      Manage Budgets & Allocations
                    </span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and allocate budgets
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
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
              <Form.Item<UserFieldType>
                name="view_dashboard"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">View Dashboard</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can access the main system dashboard
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<UserFieldType>
                name="manage_users"
                valuePropName="checked"
                style={{
                  marginBottom: 0,
                  width: "100%",
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <Checkbox />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Users</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and manage user accounts and their
                      permissions
                    </Typography.Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="flex w-full justify-between items-center my-6">
          <Button type="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Create User
          </Button>
        </div>
      </Form>
      <DepartmentCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDepartmentCreate}
      />
    </section>
  );
}
