"use client";

import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface WarningModalProps {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
  loading?: boolean;
}

const WarningModal: React.FC<WarningModalProps> = ({
  open,
  onCancel,
  onDiscard,
  onSaveDraft,
  loading = false,
}) => (
  <Modal
    open={open}
    onCancel={onCancel}
    centered
    closable={false}
    footer={null}
    width={480}
  >
    <Space
      direction="vertical"
      align="center"
      style={{ width: "100%", textAlign: "center" }}
      size="middle"
    >
      <div
        style={{
          backgroundColor: "#faad14",
          borderRadius: "50%",
          padding: 16,
          display: "inline-flex",
        }}
      >
        <ExclamationCircleOutlined style={{ fontSize: 32, color: "#fff" }} />
      </div>

      <Title level={4} style={{ margin: 0 }}>
        Unsaved Changes
      </Title>

      <Text type="secondary" style={{ fontSize: 14 }}>
        You have unsaved changes. What would you like to do?
        <br />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
          Saving as draft will preserve your progress and allow you to continue
          later.
        </Text>
      </Text>

      <Space size="middle" style={{ marginTop: 16 }}>
        <Button size="large" onClick={onCancel}>
          Continue Editing
        </Button>
        <Button size="large" danger onClick={onDiscard}>
          Discard Progress
        </Button>
        <Button
          size="large"
          type="primary"
          onClick={onSaveDraft}
          loading={loading}
        >
          Save Draft
        </Button>
      </Space>
    </Space>
  </Modal>
);

export default WarningModal;
