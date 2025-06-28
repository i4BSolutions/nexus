"use client";

import { Modal, Button, Typography } from "antd";
import { ExclamationCircleFilled, StopOutlined } from "@ant-design/icons";
import React from "react";

const { Text, Title } = Typography;

interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  type: "delete" | "deactivate";
}

export default function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  type,
}: ConfirmModalProps) {
  const isDelete = type === "delete";

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      centered
      style={{
        textAlign: "center",
        padding: "32px 24px",
        borderRadius: 16,
        width: 400,
        height: 248,
      }}
    >
      {/* Icon */}
      <div
        style={{
          backgroundColor: isDelete ? "#FF4D4F" : "#FFA940",
          width: 64,
          height: 64,
          borderRadius: "50%",
          margin: "0 auto 16px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDelete ? (
          <ExclamationCircleFilled style={{ fontSize: 32, color: "white" }} />
        ) : (
          <ExclamationCircleFilled style={{ fontSize: 32, color: "white" }} />
        )}
      </div>

      {/* Title */}
      <Title level={4} style={{ marginBottom: 8 }}>
        {isDelete ? "Delete product" : "Deactivate product"}
      </Title>

      {/* Message */}
      <Text type="secondary">
        Are you sure you want to {isDelete ? "delete" : "deactivate"} this
        product?
        <br />
        This action cannot be undone.
      </Text>

      {/* Buttons */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          danger={isDelete}
          onClick={onConfirm}
          style={{
            backgroundColor: isDelete ? "#FF4D4F" : "#722ED1",
            borderColor: isDelete ? "#FF4D4F" : "#722ED1",
            color: "#fff",
          }}
        >
          {isDelete ? "Delete" : "Deactivate"}
        </Button>
      </div>
    </Modal>
  );
}
