"use client";

import React from "react";
import { Button, Typography } from "antd";
import type { ButtonProps } from "antd";
import { CSSProperties } from "react";

type CustomButtonProps = {
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
} & ButtonProps;

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  icon,
  onClick,
  className,
  ...props
}) => {
  const customStyle: CSSProperties = {
    backgroundColor: "#722ED1",
    borderColor: "#722ED1",
    color: "#fff",
    borderRadius: 8,
    padding: "4px 15px",
    height: 32,
    boxShadow: "0px 2px 0px rgba(0, 0, 0, 0.043)",
    gap: 8,
    display: "inline-flex",
    alignItems: "center",
  };

  return (
    <Button
      type="primary"
      icon={icon}
      onClick={onClick}
      className={className}
      style={customStyle}
      {...props}
    >
      <Typography.Text
        style={{ fontWeight: 400, fontSize: "14px", color: "#FFF" }}
      >
        {text}
      </Typography.Text>
    </Button>
  );
};

export default CustomButton;
