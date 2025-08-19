import { StopOutlined } from "@ant-design/icons";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <StopOutlined className="text-6xl !text-red-600 mb-4" />
        <p className="text-lg text-gray-700 mb-6">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}
