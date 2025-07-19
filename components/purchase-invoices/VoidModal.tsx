// VoidModal.tsx
import { StopOutlined } from "@ant-design/icons";
import { Modal, Button, Space, Typography } from "antd";

export default function VoidModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void | Promise<void>;
}) {
  return (
    <Modal
      title={
        <Space
          direction="vertical"
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Space
            style={{
              width: 32,
              height: 32,
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 20,
              color: "white",
              background: "#FF4D4F",
            }}
          >
            <StopOutlined />
          </Space>
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            Void Invoice
          </Typography.Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button key="cancel" onClick={onClose}>
            No
          </Button>
          <Button key="save" type="primary" danger onClick={onSave}>
            Proceed
          </Button>
        </div>
      }
      centered
      width={352}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <Typography.Text type="secondary" style={{ textAlign: "center" }}>
          Are you sure you want to void this invoice?
        </Typography.Text>
        <Typography.Text type="secondary" style={{ textAlign: "center" }}>
          This action cannot be undone.
        </Typography.Text>
      </div>
    </Modal>
  );
}
