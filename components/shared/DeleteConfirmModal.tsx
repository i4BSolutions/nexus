import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  title,
  onCancel,
  onConfirm,
}) => (
  <Modal
    open={open}
    onCancel={onCancel}
    centered
    closable={false}
    footer={null}
  >
    <Space
      direction="vertical"
      align="center"
      style={{ width: "100%", textAlign: "center" }}
      size="middle"
    >
      <div
        style={{
          backgroundColor: "#f5222d",
          borderRadius: "50%",
          padding: 16,
          display: "inline-flex",
        }}
      >
        <ExclamationCircleOutlined style={{ fontSize: 32, color: "#fff" }} />
      </div>

      <Title level={4} style={{ margin: 0 }}>
        Delete {title}
      </Title>

      <Text type="secondary">
        Are you sure you want to delete this {title.toLowerCase()}?
        <br />
        This action cannot be undone.
      </Text>

      <Space size="middle">
        <Button size="large" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="large" danger type="primary" onClick={onConfirm}>
          Delete
        </Button>
      </Space>
    </Space>
  </Modal>
);

export default DeleteConfirmModal;
