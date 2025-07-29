// UpdateReason.tsx
import { Modal, Input, Button, Space, Typography } from "antd";

export default function UpdateReason({
  open,
  onClose,
  comment,
  setComment,
  loading,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  comment: string;
  setComment: (val: string) => void;
  loading: boolean;
  onSave: () => void;
}) {
  return (
    <Modal
      title={
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Save Changes
        </Typography.Title>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={onSave}
          disabled={!comment.trim()}
          loading={loading}
        >
          Save
        </Button>,
      ]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <Typography.Text type="secondary" style={{ textAlign: "center" }}>
          Let us know why you're making this change.
        </Typography.Text>
      </div>
      <Input.TextArea
        rows={4}
        placeholder="Enter comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />
    </Modal>
  );
}
