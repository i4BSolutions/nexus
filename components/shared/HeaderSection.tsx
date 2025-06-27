import React from "react";
import { Typography, Button, Space } from "antd";

const HeaderSection = ({
  title,
  description,
  icon,
  onAddNew,
  buttonText,
  buttonIcon,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onAddNew: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}) => (
  <Space
    size="small"
    style={{
      display: "flex",
      marginBottom: "16px",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Space>
      <div
        style={{
          width: 32,
          height: 32,
          background: "#40A9FF",
          borderRadius: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {React.cloneElement(icon as any, {
          style: { fontSize: 20, color: "white" },
        })}
      </div>
      <Space direction="vertical" size={0}>
        <Typography.Title level={3} style={{ marginBottom: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {description}
          </Typography.Paragraph>
        )}
      </Space>
    </Space>
    <Button type="primary" onClick={onAddNew} icon={buttonIcon}>
      {buttonText || `New ${title}`}
    </Button>
  </Space>
);

export default HeaderSection;
