import { Card, Space, Typography } from "antd";
import React from "react";

interface TableCardWrapperProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  gradient: string;
  borderColor: string;
  backgroundColor: string;
}

const TableCardWrapper = ({
  icon,
  title,
  subtitle,
  children,
  gradient,
  borderColor,
  backgroundColor,
}: TableCardWrapperProps) => {
  return (
    <Card
      styles={{
        header: {
          background: gradient,
          borderBottom: `1px solid ${borderColor}`,
        },
      }}
      title={
        <Space
          style={{
            margin: "12px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Space>
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
                background: backgroundColor,
                marginRight: 8,
              }}
            >
              {icon}
            </Space>
            <Space direction="vertical" size={0}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                {subtitle}
              </Typography.Text>
            </Space>
          </Space>
        </Space>
      }
      variant="outlined"
      style={{ borderRadius: 12 }}
    >
      {children}
    </Card>
  );
};

export default TableCardWrapper;
