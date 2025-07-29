import React from "react";

export type StatItem = {
  title: string;
  value: number | any;
  icon: React.ReactNode;
  bgColor: string;
  gradient: string;
  borderColor: string;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  total_approved?: number;
  approved_text?: string;
  footerContent?: any;
};
