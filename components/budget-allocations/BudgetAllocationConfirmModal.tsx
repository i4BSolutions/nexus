import { StopOutlined } from "@ant-design/icons";
import { Avatar, Button, Modal, Typography } from "antd";

export default function BudgetAllocationConfirmModal({
  onProceedHandler,
  confirmModalOpen,
  setConfirmModalOpen,
}: {
  onProceedHandler: () => void;
  confirmModalOpen: boolean;
  setConfirmModalOpen: (open: boolean) => void;
}) {
  return (
    <Modal
      open={confirmModalOpen}
      onCancel={() => {
        setConfirmModalOpen(false);
      }}
      onOk={() => {
        setConfirmModalOpen(false);
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
          Cancel Budget Allocation
        </Typography.Title>
      </div>
      <div className="flex flex-col justify-center items-center">
        <Typography.Text type="secondary" className="text-center">
          Are you sure you want to cancel this Budget Allocation?
        </Typography.Text>
        <Typography.Text type="secondary">
          This action cannot be undone.
        </Typography.Text>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <Button onClick={() => setConfirmModalOpen(false)}>No</Button>
        <Button
          type="primary"
          danger
          onClick={() => {
            setConfirmModalOpen(false);
            onProceedHandler();
          }}
        >
          Proceed
        </Button>
      </div>
    </Modal>
  );
}
