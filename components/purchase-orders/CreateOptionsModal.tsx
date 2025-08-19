"use client";

import { Modal, Button, Space, Typography, List, Empty, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { useRouter } from "next/navigation";

import { useList } from "@/hooks/react-query/useList";
import { useDelete } from "@/hooks/react-query/useDelete";

import { PurchaseOrderDraftInterface } from "@/types/purchase-order/purchase-order-draft.type";

const { Title, Text } = Typography;

interface CreateOptionsModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateOptionsModal: React.FC<CreateOptionsModalProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();

  const {
    data: draftsData,
    isLoading,
    refetch,
  } = useList("purchase-orders/drafts");

  const { mutate: deleteDraft } = useDelete("purchase-orders/drafts");

  const handleStartNew = (draftId: number | null) => {
    onClose();

    if (draftId) {
      deleteDraft(draftId.toString(), {
        onSuccess: () => {
          refetch();
        },
      });
    }

    router.push("/purchase-orders/create");
  };

  const handleContinueDraft = (draft: PurchaseOrderDraftInterface) => {
    onClose();
    router.push(`/purchase-orders/create?draft=${draft.id}`);
  };

  const handleDeleteDraft = (draftId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    deleteDraft(draftId.toString(), {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const getStepName = (step: number) => {
    const stepNames = [
      "Supplier & Region",
      "Date & Currency",
      "Items",
      "Contact Persons",
      "Review & Submit",
    ];
    return stepNames[step] || "Unknown";
  };

  const getProgressPercentage = (step: number) => {
    return ((step + 1) / 5) * 100;
  };

  const drafts = (draftsData as PurchaseOrderDraftInterface[]) || [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Create New Purchase Order"
      footer={null}
      width={600}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Start New Option */}
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "16px",
            cursor: "pointer",
            transition: "all 0.3s",
            backgroundColor: "#fafafa",
          }}
          onClick={() => handleStartNew(drafts[0]?.id || null)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f0f0f0";
            e.currentTarget.style.borderColor = "#1890ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fafafa";
            e.currentTarget.style.borderColor = "#d9d9d9";
          }}
        >
          <Space align="center">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <PlusOutlined style={{ fontSize: "18px" }} />
            </div>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Start New Purchase Order
              </Title>
              <Text type="secondary">
                Create a new purchase order from scratch
              </Text>
            </div>
          </Space>
        </div>

        {/* Existing Drafts */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
            <Text style={{ marginLeft: 8 }}>Loading drafts...</Text>
          </div>
        ) : drafts.length > 0 ? (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              Continue Existing Drafts ({drafts.length})
            </Title>
            <List
              dataSource={drafts}
              renderItem={(draft: PurchaseOrderDraftInterface) => (
                <List.Item
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onClick={() => handleContinueDraft(draft)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                    e.currentTarget.style.borderColor = "#1890ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#d9d9d9";
                  }}
                  actions={[
                    <Button
                      key="continue"
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueDraft(draft);
                      }}
                    >
                      Continue
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{draft.po_number || "Draft"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {getStepName(draft.current_step)}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size={0}
                        style={{ width: "100%" }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Created:{" "}
                          {new Date(draft.created_at).toLocaleDateString()}
                        </Text>
                        <div style={{ width: "100%", marginTop: 4 }}>
                          <div
                            style={{
                              width: "100%",
                              height: "4px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${getProgressPercentage(
                                  draft.current_step
                                )}%`,
                                height: "100%",
                                backgroundColor: "#1890ff",
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            {Math.round(
                              getProgressPercentage(draft.current_step)
                            )}
                            % complete
                          </Text>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Empty
            description="No drafts found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Space>
    </Modal>
  );
};

export default CreateOptionsModal;
