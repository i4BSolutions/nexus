"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";

import { useList } from "@/hooks/react-query/useList";
import { useCreate } from "@/hooks/react-query/useCreate";
import { RankInterface } from "@/types/person/rank/rank.type";
import { DepartmentInterface } from "@/types/departments/department.type";
import getAvatarUrl from "@/utils/getAvatarUrl";

export default function CreateContact() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const router = useRouter();

  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [newRank, setNewRank] = useState("");

  const {
    data: ranksData,
    isLoading: ranksLoading,
    refetch: refetchRanks,
  } = useList<RankInterface[]>("ranks", {
    pageSize: "all" as any,
  });

  const { mutate: createRank } = useCreate("ranks");

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    refetch: refetchDepartments,
  } = useList<DepartmentInterface[]>("departments", {
    pageSize: "all" as any,
  });

  const { mutate: createContact } = useCreate("persons");

  const openCreateRank = () => {
    setNewRank("");
    setRankModalOpen(true);
  };

  const handleCreateRank = (values: { name: string }) => {
    createRank(values, {
      onSuccess: (data: unknown) => {
        const createdRank = data as RankInterface;
        form.setFieldsValue({ rank: createdRank.id });
        message.success("Rank created");
        setRankModalOpen(false);
        refetchRanks();
      },
    });
  };

  // submit
  const onFinish = async (values: any) => {
    createContact(values);
    message.success("Contact created!");
    router.back();
  };

  const onCancel = () => router.back();

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            type="link"
            onClick={() => router.back()}
            style={{ fontSize: 20, color: "#000" }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              Create Contact
            </Typography.Title>
            <Typography.Text type="secondary" style={{ marginBottom: 0 }}>
              Add a new contact
            </Typography.Text>
          </Space>
        </Space>
      </Space>

      {/* Card */}
      <Space
        direction="vertical"
        size={0}
        style={{
          marginTop: 12,
          border: "1px solid #F5F5F5",
          width: "100%",
          borderRadius: 16,
          background: "#fff",
        }}
      >
        {/* Card header */}
        <Space direction="vertical" size={0} style={{ padding: "12px 24px" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Contact Information
          </Typography.Title>
          <Typography.Text type="secondary">
            Basic contact details and information
          </Typography.Text>
        </Space>

        <Divider style={{ margin: 0 }} />

        <Space
          direction="vertical"
          size={0}
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Avatar banner */}
          <Space
            direction="vertical"
            size={0}
            style={{ padding: 24, width: "100%", justifyContent: "center" }}
          >
            <Space
              direction="vertical"
              style={{
                background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
                borderRadius: 8,
                width: 1020,
                maxWidth: "100%",
                height: 139,
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #D9D9D9",
              }}
            >
              <img
                src={getAvatarUrl("seed")}
                alt=""
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 50,
                }}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Avatar will be generated automatically.
              </Typography.Text>
            </Space>
          </Space>

          {/* Form */}
          <div style={{ padding: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark="optional"
              style={{ maxWidth: 1020 }}
            >
              <Space style={{ width: "100%" }} size={22}>
                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Full Name
                      </Typography.Text>
                    </div>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Full name is required." },
                  ]}
                  style={{ width: "500px" }}
                >
                  <Input
                    size="large"
                    placeholder="Enter full name"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Email Address
                      </Typography.Text>
                    </div>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email address." },
                    { type: "email", message: "Invalid email format." },
                  ]}
                  style={{ width: "500px" }}
                >
                  <Input
                    size="large"
                    placeholder="Enter email address"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Space>

              <Space style={{ width: "100%" }} size={22}>
                <Form.Item
                  style={{ width: "500px" }}
                  label={
                    <div
                      style={{
                        width: "500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="p-0 m-0 flex items-center">
                        <Typography.Paragraph
                          style={{
                            color: "red",
                            fontSize: 20,
                            marginTop: "6px",
                            marginBottom: "0px",
                            marginRight: "4px",
                          }}
                        >
                          *
                        </Typography.Paragraph>
                        <Typography.Text style={{ fontSize: 16 }}>
                          Rank
                        </Typography.Text>
                      </div>
                      <Typography.Link
                        onClick={() => {
                          openCreateRank();
                        }}
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          marginRight: 0,
                        }}
                      >
                        Create New
                      </Typography.Link>
                    </div>
                  }
                  name="rank"
                  rules={[{ required: true, message: "Please select rank." }]}
                >
                  <Select
                    size="large"
                    placeholder="Select rank"
                    options={ranksData?.map((rank) => ({
                      label: rank.name,
                      value: rank.id,
                    }))}
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Department
                      </Typography.Text>
                    </div>
                  }
                  name="department"
                  rules={[
                    { required: true, message: "Please select department." },
                  ]}
                  style={{ width: "500px" }}
                >
                  <Select
                    size="large"
                    placeholder="eg. Finance"
                    options={departmentsData?.map((dept) => ({
                      label: dept.name,
                      value: dept.id,
                    }))}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Space>

              <Form.Item style={{ width: "100%" }}>
                <Space
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    Create Contact
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </Space>
      </Space>

      {/* Create Rank Modal */}
      <Modal
        title="Create Rank"
        open={rankModalOpen}
        onCancel={() => setRankModalOpen(false)}
        onOk={() => handleCreateRank({ name: newRank })}
        okText="Add Rank"
      >
        <Input
          size="large"
          placeholder="Enter rank name (e.g., Associate)"
          value={newRank}
          onChange={(e) => setNewRank(e.target.value)}
          onPressEnter={() => handleCreateRank({ name: newRank })}
        />
      </Modal>
    </section>
  );
}
