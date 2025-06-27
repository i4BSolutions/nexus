"use client";

import { Popover } from "antd";
import {
  DeleteOutlined,
  StopOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { useState } from "react";

interface PopConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeactivate: () => void;
  onDelete: () => void;
}

export default function PopConfirm({
  open,
  setOpen,
  onDeactivate,
  onDelete,
}: PopConfirmProps) {
  const handleDeactivate = () => {
    onDeactivate();
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  const content = (
    <div style={{ width: 160 }}>
      <div
        onClick={handleDeactivate}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          cursor: "pointer",
          backgroundColor: "#f5f5f5",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <StopOutlined style={{ marginRight: 8 }} />
        <span>Deactivate</span>
      </div>
      <div
        onClick={handleDelete}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          cursor: "pointer",
          color: "#f5222d",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <DeleteOutlined style={{ marginRight: 8 }} />
        <span>Delete</span>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={(visible) => setOpen(visible)}
      placement="bottomRight"
    >
      <EllipsisOutlined
        style={{
          cursor: "pointer",
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid #d9d9d9",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </Popover>
  );
}
