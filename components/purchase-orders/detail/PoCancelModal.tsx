import { StopOutlined } from "@ant-design/icons";
import { Avatar, Button, Modal, Typography } from "antd";

export default function PoCancelModal({
  onProceedHandler,
  cancelModalOpen,
  setCancelModalOpen,
}: {
  onProceedHandler: () => void;
  cancelModalOpen: boolean;
  setCancelModalOpen: (open: boolean) => void;
}) {
  return (
    <Modal
      open={cancelModalOpen}
      onCancel={() => {
        setCancelModalOpen(false);
      }}
      onOk={() => {
        setCancelModalOpen(false);
        onProceedHandler();
      }}
      centered
      closable={false}
      footer={null}
      width={400}
    >
      <div className="flex flex-col gap-2 justify-center items-center">
        <Avatar
          size={64}
          style={{ backgroundColor: "#FF4D4F" }}
          icon={<StopOutlined />}
        />
        <Typography.Title level={3} className="!mb-2">
          Cancel Purchase Order
        </Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <Typography.Text type="secondary">
          Are you sure you want to cancel this PO?
        </Typography.Text>
        <Typography.Text type="secondary">
          This action cannot be undone.
        </Typography.Text>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <Button onClick={() => setCancelModalOpen(false)}>No</Button>
        <Button
          type="primary"
          danger
          onClick={() => {
            setCancelModalOpen(false);
            onProceedHandler();
          }}
        >
          Proceed
        </Button>
      </div>
    </Modal>
  );
}
