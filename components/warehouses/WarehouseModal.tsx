"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Radio, Space, Typography } from "antd";
import React, { useEffect } from "react";

import { WarehouseInterface } from "@/types/warehouse/warehouse.type";

import Modal from "@/components/shared/Modal";

interface WarehouseModalProps {
  open: boolean;
  isEdit: boolean;
  initialValues?: WarehouseInterface;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({
  open,
  isEdit,
  initialValues,
  onClose,
  onSubmit,
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
      title={isEdit ? "Edit Warehouse" : "Add New Warehouse"}
      description={
        isEdit
          ? "Edit the details of the warehouse."
          : "Fill in the details to add a new warehouse location."
      }
      onClose={onClose}
      icon={<PlusOutlined style={{ color: "#FFFFFF" }} />}
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
                Warehouse Name
              </Typography.Text>
            </div>
          }
          name="name"
          rules={[{ required: true, message: "Warehouse name is required" }]}
        >
          <Input size="large" placeholder="eg. Warehouse One" />
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
                Location
              </Typography.Text>
            </div>
          }
          name="location"
          rules={[{ required: true, message: "Location is required" }]}
        >
          <Input size="large" placeholder="eg. Yangon" />
        </Form.Item>

        <Form.Item
          label={
            <div className="p-0 my-2 flex items-center">
              <Typography.Text style={{ fontSize: 16 }}>
                Capacity
              </Typography.Text>
            </div>
          }
          name="capacity"
        >
          <Input size="large" placeholder="eg. 1,000" addonAfter="Units" />
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
              {isEdit ? "Save" : "Add Warehouse"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WarehouseModal;
