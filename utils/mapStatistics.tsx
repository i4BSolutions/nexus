import { StatItem } from "@/components/budgets/BudgetStatsCard";
import { BudgetStatistics } from "@/types/budgets/budgets.type";
import {
  DollarOutlined,
  DownCircleOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";

export function mapBudgetStatsToItems(data: BudgetStatistics): StatItem[] {
  return [
    {
      title: "Total Planned",
      value: data.totalPlannedUSD,
      tooltip: "Sum of all planned budgets across all active projects",
      icon: <DollarOutlined />,
      bgColor: "#87E8DE",
      gradient: "linear-gradient(135deg, #E6FFFB, #FFFFFF)",
      borderColor: "#87E8DE",
      bottomText: "Across 4 active budget projects",
    },
    {
      title: "Total Allocated",
      value: data.totalAllocatedUSD,
      tooltip: "Total budget already allocated to project teams",
      icon: <DownCircleOutlined />,
      bgColor: "#91D5FF",
      gradient: "linear-gradient(135deg, #E6F7FF, #FFFFFF)",
      borderColor: "#91D5FF",
      showProgress: true,
      progressPercent:
        data.totalPlannedUSD > 0
          ? (data.totalAllocatedUSD / data.totalPlannedUSD) * 100
          : 0,
    },
    {
      title: "Total Invoiced",
      value: data.totalInvoicedUSD,
      tooltip: "Actual amount invoiced or spent across all campaigns",
      icon: <UpCircleOutlined />,
      bgColor: "#D3ADF7",
      gradient: "linear-gradient(135deg, #F9F0FF, #FFFFFF)",
      borderColor: "#D3ADF7",
      showProgress: true,
      progressPercent:
        data.totalAllocatedUSD > 0
          ? (data.totalInvoicedUSD / data.totalAllocatedUSD) * 100
          : 0,
    },
    {
      title: "Avg Utilization",
      value: `${data.averageUtilization.toFixed(2)}%`,
      tooltip:
        "Average percentage of how much of the allocated budget has been utilized across all campaigns",
      icon: <DollarOutlined />,
      bgColor: "#FFC53D",
      gradient: "linear-gradient(135deg, #FFFBE6, #FFFFFF)",
      borderColor: "#FFE58F",
      bottomText: "Across 4 active budget projects",
      progressPercent: data.averageUtilization,
    },
  ];
}
