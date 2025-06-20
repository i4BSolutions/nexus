"use client";

import { Flex, Input, Space, Typography } from "antd";
import { OTPProps } from "antd/es/input/OTP";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { verfiyOtp } from "./action";

export default function VerfiyOtpPage() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onChange: OTPProps["onChange"] = (text) => {
    console.log("onChange:", text);
    if (text && text.length === 6) {
      console.log("All inputs are filled:", text);
      // Perform your desired action here
      startTransition(() => {
        // Simulate an API call or any other action
        verfiyOtp(
          new URLSearchParams(window.location.search).get("email") || "",
          text
        )
          .then((session) => {
            console.log("OTP verified successfully:", session);
            // Redirect or perform any other action after successful verification
            router.push("/"); // Redirect to home or another page
          })
          .catch((error) => {
            console.error("OTP verification failed:", error);
            // Handle error, show notification, etc.
            alert("OTP verification failed: " + error.message);
            // You can replace this with your actual submission logic
          });
      });
    }
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };

  return (
    <Flex
      justify="start"
      gap={20}
      align="center"
      vertical
      className="!h-screen !pt-20"
    >
      <Typography.Title>Check your mail for OTP</Typography.Title>
      <Space direction="horizontal" size="large">
        <Input.OTP onChange={onChange} onInput={onInput} />
      </Space>
    </Flex>
  );
}
