import { Button, Space, Typography } from "antd";
import React from "react";

const HeaderSection = ({
  title,
  description,
  bgColor,
  iconColor,
  icon,
  onAddNew,
  buttonText,
  buttonIcon,
  hasPermission = false,
  isExport = false,
  onExport,
}: {
  title: string;
  description?: string;
  bgColor?: string;
  iconColor?: string;
  icon: React.ReactNode;
  onAddNew: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  hasPermission?: boolean;
  isExport?: boolean;
  onExport?: () => void;
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
          background: bgColor ? bgColor : "#40A9FF",
          borderRadius: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {React.cloneElement(icon as any, {
          style: { fontSize: 20, color: iconColor ? iconColor : "white" },
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
    <Space>
      {isExport && hasPermission && (
        <Button type="default" onClick={onExport}>
          Export CSV
        </Button>
      )}
      {buttonText && hasPermission && (
        <Button type="primary" onClick={onAddNew} icon={buttonIcon}>
          {buttonText || `New ${title}`}
        </Button>
      )}
    </Space>
  </Space>
);

export default HeaderSection;
