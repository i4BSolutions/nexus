import { StatItem } from "@/types/shared/stat-item.type";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Flex, Space, Statistic, Tooltip, Typography } from "antd";

const StatisticsCards = ({ stats }: { stats: StatItem[] }) => (
  <Flex className="!mb-6" gap={12}>
    {stats.map((item, index) => (
      <Card
        size="small"
        style={{
          borderColor: item.borderColor,
          background: item.gradient,
          padding: "4px 24px",
          width: "100%",
        }}
        key={index}
      >
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: 4,
          }}
        >
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">
              {item.title}{" "}
              {item.tooltip && (
                <Tooltip title={item.tooltip}>
                  <InfoCircleOutlined style={{ cursor: "pointer" }} />
                </Tooltip>
              )}
            </Typography.Text>
            <Statistic
              value={
                item.title === "Total POs"
                  ? item.value
                  : item.value.toLocaleString()
              }
              prefix={item.prefix}
              suffix={item.suffix}
            />
          </Flex>
          <div
            style={{
              width: 32,
              height: 32,
              background: item.bgColor,
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 20,
            }}
          >
            {item.icon}
          </div>
        </Space>
        {item.footerContent && (
          <div style={{ marginTop: 8 }}>{item.footerContent}</div>
        )}
        {/* {index !== 0 && (
          <Typography.Text type="secondary">
            Across {stats[0].total_approved || 0} {item.approved_text}
          </Typography.Text>
        )} */}
      </Card>
    ))}
  </Flex>
);

export default StatisticsCards;
