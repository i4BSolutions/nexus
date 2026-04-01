import { Spin } from "antd";

export default function PageLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Spin />
    </div>
  );
}
