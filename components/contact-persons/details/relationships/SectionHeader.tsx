"use client";

import React from "react";
import { Space, Typography } from "antd";

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  borderColor: string;
  badgeBg: string;
  rightExtra?: React.ReactNode;
};

const SectionHeader: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  gradient,
  borderColor,
  badgeBg,
  rightExtra,
}) => {
  return (
    <Space
      style={{
        padding: "12px 24px",
        background: gradient,
        borderRadius: "16px 16px 0 0",
        border: `1px solid ${borderColor}`,
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Space>
        <div
          style={{
            backgroundColor: badgeBg,
            color: "white",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        <Space direction="vertical" size={0}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ margin: 0 }}>
            {subtitle}
          </Typography.Text>
        </Space>
      </Space>

      <Space>{rightExtra}</Space>
    </Space>
  );
};

export default SectionHeader;
