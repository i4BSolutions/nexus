import { ArrowRightOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Typography } from "antd";
import React from "react";

type MainMenuItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

const MainMenuItemCard = ({
  icon,
  title,
  description,
  onClick,
}: MainMenuItemProps) => {
  return (
    <Card variant="outlined" style={{ height: "100%" }}>
      <Flex justify="space-between" align="center">
        <Flex gap={12} align="center">
          {icon}
          <Col
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography.Text
              style={{ color: "#000000D9", fontSize: 20, fontWeight: 500 }}
            >
              {title}
            </Typography.Text>
            <Typography.Text
              style={{ color: "#00000073", fontWeight: 400, fontSize: 14 }}
            >
              {description}
            </Typography.Text>
          </Col>
        </Flex>
        <Button type="default" icon={<ArrowRightOutlined />} onClick={onClick}>
          Navigate
        </Button>
      </Flex>
    </Card>
  );
};

export default MainMenuItemCard;
