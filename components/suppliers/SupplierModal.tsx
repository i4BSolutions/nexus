"use client";

import {
  EditOutlined,
  MailOutlined,
  MobileOutlined,
  PlusOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Radio, Space, Typography } from "antd";
import React, { useEffect } from "react";

import { SupplierInterface } from "@/types/supplier/supplier.type";

import Modal from "@/components/shared/Modal";

interface SupplierModalProps {
  open: boolean;
  isEdit: boolean;
  initialValues?: SupplierInterface;
  onClose: () => void;
  onSubmit: (values: any) => void;
  emailDuplicateError?: string;
  onEmailChange?: () => void;
  loading?: boolean;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  isEdit,
  initialValues,
  onClose,
  onSubmit,
  emailDuplicateError,
  onEmailChange,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      isOpen={open}
      title={isEdit ? "Edit Supplier" : "Add New Supplier"}
      description={
        isEdit
          ? "Edit the details of the supplier."
          : "Fill in the details to add a new supplier to your directory."
      }
      icon={
        isEdit ? (
          <EditOutlined style={{ color: "#FFFFFF" }} />
        ) : (
          <PlusOutlined style={{ color: "#FFFFFF" }} />
        )
      }
      onClose={onClose}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark="optional"
      >
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
                Supplier Name
              </Typography.Text>
            </div>
          }
          name="name"
          rules={[{ required: true, message: "Supplier name is required" }]}
        >
          <Input
            size="large"
            placeholder="Enter supplier name"
            prefix={<ShopOutlined />}
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
                Contact Person
              </Typography.Text>
            </div>
          }
          name="contact_person"
          rules={[{ required: true, message: "Contact person is required" }]}
        >
          <Input
            size="large"
            placeholder="Enter contact name"
            prefix={<UserOutlined />}
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
              <Typography.Text style={{ fontSize: 16 }}>Email</Typography.Text>
            </div>
          }
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input
            size="large"
            placeholder="example@email.com"
            prefix={<MailOutlined />}
            onChange={onEmailChange}
          />
        </Form.Item>

        {emailDuplicateError && (
          <Typography.Text
            type="danger"
            style={{ display: "block", marginTop: -16, marginBottom: 16 }}
          >
            {emailDuplicateError}
          </Typography.Text>
        )}

        <Form.Item label="Phone" name="phone">
          <Input
            size="large"
            placeholder="+959 123 456 789"
            prefix={<MobileOutlined />}
          />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input.TextArea
            size="large"
            placeholder="Address"
            autoSize={{ minRows: 2 }}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, marginRight: 8 }}>Status:</span>
            <Form.Item
              name="status"
              initialValue={true}
              rules={[{ required: true, message: "Status is required" }]}
              noStyle
            >
              <Radio.Group>
                <Radio value={true}>Active</Radio>
                <Radio value={false}>Inactive</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item>
          <Space className="flex justify-start w-full">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={loading}
              loading={loading}
            >
              {isEdit ? "Save" : "Add Supplier"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SupplierModal;
