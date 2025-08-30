"use client";

import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import { CalendarOutlined, StopOutlined } from "@ant-design/icons";
import { VoidPreview } from "@/types/inventory/stock-transaction.type";

const { Text, Title } = Typography;
const { TextArea } = Input;

export type VoidDirection = "Stock In" | "Stock Out";

interface VoidTransactionModalProps {
  open: boolean;
  loading?: boolean;
  tx?: VoidPreview | null;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

export default function VoidTransactionModal({
  open,
  loading,
  tx,
  onCancel,
  onConfirm,
}: VoidTransactionModalProps) {
  const { message } = App.useApp();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const isIn = tx?.type === "IN";
  const accent = isIn ? "#52C41A" : "#FAAD14";
  const qtyLabel = "Warehouse Qty";
  const delta = useMemo(() => (tx ? tx.toQty - tx.fromQty : 0), [tx]);

  const confirm = async () => {
    if (!reason.trim()) {
      message.error("Please provide a reason for voiding.");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnHidden
      styles={{
        header: { display: "none" },
        body: { padding: 0, borderRadius: 12 },
        content: { borderRadius: 12, overflow: "hidden" },
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 8px",
        }}
      >
        <Flex vertical align="center" gap={8}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#FF4D4F",
              display: "grid",
              placeItems: "center",
            }}
          >
            <StopOutlined style={{ fontSize: 32, color: "#ffffff" }} />
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Void Transaction
          </Title>
        </Flex>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 16,
        }}
      >
        {/* Product summary card */}
        <div
          style={{
            background: "#FAFAFA",
            borderRadius: 12,
            padding: 14,
            position: "relative",
            // “left” vs “right” accent bar:
            ...(isIn
              ? { boxShadow: `inset 0 -2px 0 0 ${accent}` } // right screenshot shows top accent
              : { boxShadow: `inset 0 -2px 0 0 ${accent}` }), // left screenshot shows bottom accent
          }}
        >
          <Flex justify="space-between" align="start">
            <Text style={{ fontWeight: 600 }}>{tx?.product_name}</Text>
            <Text style={{ color: accent }} strong>
              {(delta > 0 ? "+" : "") + delta.toLocaleString()}
            </Text>
          </Flex>
          <Flex justify="space-between" style={{ marginTop: 4 }}>
            {!!tx?.product_sku && (
              <div>
                <Text type="secondary">{tx.product_sku}</Text>
              </div>
            )}
            <Text type="secondary">
              <>
                <CalendarOutlined style={{ marginRight: 6 }} />
                {tx?.date}
              </>
            </Text>
          </Flex>
          <Flex justify="space-between" style={{ marginTop: 4 }}>
            {!!tx?.reference && (
              <Text type="secondary">{"INV" + " - " + tx.reference}</Text>
            )}
            <Text type="secondary">{tx?.warehouse_name ?? "Warehouse"}</Text>
          </Flex>
        </div>

        {/* Change preview */}
        <div
          style={{
            background: "#FAFAFA",
            marginTop: 14,
            borderRadius: 10,
            padding: 12,
            border: `1px solid #D9D9D9`,
            textAlign: "center",
          }}
        >
          <Text type="secondary">Following changes will be made.</Text>
          <Flex
            gap={8}
            align="baseline"
            wrap
            style={{
              textAlign: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Text>{qtyLabel}:</Text>
            <Text delete>{tx ? tx.fromQty.toLocaleString() : "-"}</Text>
            <Text>to</Text>
            <Text style={{ color: "#722ED1" }}>
              {" "}
              {tx ? tx.toQty.toLocaleString() : "-"}
            </Text>
          </Flex>
        </div>

        {/* Reason input */}
        <div style={{ marginTop: 12 }}>
          <TextArea
            placeholder="Reason for voiding (required)"
            autoSize={{ minRows: 3, maxRows: 6 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Footer actions */}
        <Flex justify="center" gap={8} style={{ marginTop: 14 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            danger
            loading={loading || submitting}
            onClick={confirm}
          >
            Void Transaction
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
