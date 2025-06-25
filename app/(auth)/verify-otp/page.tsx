import { Spin } from "antd";
import { Suspense } from "react";
import VerifyOtpClientPage from "./pageClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen">
          <Spin size="large" />
        </div>
      }
    >
      <VerifyOtpClientPage />
    </Suspense>
  );
}
