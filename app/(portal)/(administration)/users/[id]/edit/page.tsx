"use client";

import DepartmentCreateModal from "@/components/users/DepartmentCreateModal";
import { getAuthenticatedUser } from "@/helper/getUser";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { PERMISSION_KEYS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { DepartmentInterface } from "@/types/departments/department.type";
import { UserDetailResponse } from "@/types/user/user-detail.type";
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
  Input,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserEditPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [form] = Form.useForm<UserFieldType>();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: lastAdminData, isLoading: lastAdminDataLoading } =
    useGetWithParams<{ isLastAdmin: boolean }, { userId: string }>(
      "users/check-last-admin",
      { userId: params.id as string }
    );

  const { data: userDetailData, isLoading: isInitailDataLoading } =
    useGetById<UserDetailResponse>("users", params.id as string);

  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGetAll<
    DepartmentInterface[]
  >("departments", ["departments"]);

  const { mutate: createDepartment } = useCreate("departments", [
    "departments",
  ]);

  const { mutateAsync: updateUser } = useUpdate("users", ["users"]);

  useEffect(() => {
    const getUserId = async () => {
      if (userDetailData) {
        const user = await getAuthenticatedUser(supabase);
        setCurrentUser(user);
      }
    };
    getUserId();
  }, [params.id, userDetailData]);

  const onFinish = (values: UserFieldType) => {
    const hasAtLeastOnePermission = PERMISSION_KEYS.some(
      (key) => values[key as keyof UserFieldType]
    );

    if (!hasAtLeastOnePermission) {
      message.error("Please select at least one permission for the user.");
      return;
    }

    const updatePayload = {
      email: values.email,
      full_name: values.full_name,
      username: "@" + values.username,
      department: values.department,
      permissions: Object.fromEntries(
        PERMISSION_KEYS.map((key) => [key, values[key]])
      ),
    };

    const logPayload = {
      actor: currentUser.user_metadata.full_name,
      target: userDetailData!.full_name,
      target_id: userDetailData!.id,
    };
    updateUser(
      { id: params.id as string, data: { updatePayload, logPayload } },
      {
        onSuccess: () => {
          message.success("User updated successfully!");
          router.back();
        },
        onError: (error) => {
          console.error("Error updating user:", error);
          message.error("Failed to update user. Please try again.");
        },
      }
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDepartmentCreate = (values: { name: string }) => {
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

  if (
    isInitailDataLoading ||
    !userDetailData ||
    lastAdminDataLoading ||
    lastAdminData === undefined ||
    !currentUser
  )
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin />
      </div>
    );

  const {
    permissions = {} as any,
    department,
    username,
    ...rest
  } = userDetailData || {};

  const initialValues = {
    ...rest,
    username: username.split("@")[1],
    department: department?.id ?? null,
    ...Object.fromEntries(
      PERMISSION_KEYS.map((key) => [key, !!permissions[key]])
    ),
  };

  return (
    <section className="max-w-7xl mx-auto">
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
              Edit User Details
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Change user details & customize granular permissions
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>

      <Form<UserFieldType>
        name="user-creation-form"
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={initialValues}
        onValuesChange={(changed) => {
          const changedKey = Object.keys(changed)[0];
          if (changedKey.startsWith("can_stock_") && changed[changedKey]) {
            form.setFieldsValue({ can_view_stock: true });
          }
          if (changedKey.startsWith("can_manage_") && changed[changedKey]) {
            const correspondingViewKey = changedKey.replace(
              "can_manage_",
              "can_view_"
            );
            form.setFieldsValue({ [correspondingViewKey]: true });
          }
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
              src={getAvatarUrl("@" + initialValues.username)}
              alt="avatar"
              className="rounded-full w-30 h-30 object-cover"
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Avatar will change relatively to the username.
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
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
            <Form.Item
              name="department"
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_purchase_orders"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Purchase Orders</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view purchase order list and details
                  </Typography.Text>
                </div>
              </div>
            </Col>

            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_purchase_orders"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Manage Purchase Orders</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete purchase orders
                  </Typography.Text>
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_invoices"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Invoices</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view invoice list and details
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_invoices"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Manage Invoices</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete invoices
                  </Typography.Text>
                </div>
              </div>
            </Col>
          </Row>

          {/* Products & Suppliers */}
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_products_suppliers"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Products & Suppliers</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view list and details of products & suppliers
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_products_suppliers"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Manage Products & Suppliers</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete products & suppliers
                  </Typography.Text>
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_stock"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Stock</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view inventory and stock movements
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8} className="!space-y-2">
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_stock_in"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Record Stock-In</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can record incoming stock movements
                  </Typography.Text>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_stock_out"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Record Stock-Out</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can record outgoing stock movements
                  </Typography.Text>
                </div>
              </div>
            </Col>
          </Row>

          {/* Warehouses */}
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_warehouses"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Warehouses</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view warehouse list and details
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_warehouses"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Manage Warehouses</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and delete warehouses
                  </Typography.Text>
                </div>
              </div>
            </Col>
          </Row>

          {/* Budget Management */}
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_budgets_allocations"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Budgets & Allocations</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can view budgets & allocations
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_budgets_allocations"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">Manage Budgets & Allocations</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can create, edit, and allocate budgets
                  </Typography.Text>
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
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_view_dashboard"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox disabled={lastAdminData.isLastAdmin} />
                </Form.Item>
                <div className="flex flex-col">
                  <span className="text-sm">View Dashboard</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Can access the main system dashboard
                  </Typography.Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex items-center gap-4">
                <Form.Item<UserFieldType>
                  name="can_manage_users"
                  valuePropName="checked"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  <Checkbox
                    disabled={
                      currentUser.id == params.id || lastAdminData.isLastAdmin
                    }
                  />
                </Form.Item>
                <Tooltip
                  title={
                    currentUser == params.id
                      ? "Please use another Admin to change this permission"
                      : ""
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-sm">Manage Users</span>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Can create, edit, and manage user accounts and their
                      permissions
                    </Typography.Text>
                  </div>
                </Tooltip>
              </div>
            </Col>
          </Row>
        </div>
        <div className="flex w-full justify-between items-center my-6">
          <Button type="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Update User
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
