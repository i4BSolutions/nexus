"use client";

import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

interface PiWarningModalProps {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

const PiWarningModal: React.FC<PiWarningModalProps> = ({
  open,
  onCancel,
  onDiscard: onProceed,
}) => (
  <Modal
    open={open}
    onCancel={onCancel}
    centered
    closable={false}
    footer={null}
    width={400}
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
        Discard Changes
      </Title>

      <Text type="secondary" style={{ fontSize: 14 }}>
        Are you sure you want to discard changes?
        <br /> This action cannot be undone.
      </Text>

      <Space size="middle" style={{ marginTop: 16 }}>
        <Button size="large" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" size="large" onClick={onProceed}>
          Proceed
        </Button>
      </Space>
    </Space>
  </Modal>
);

export default PiWarningModal;
