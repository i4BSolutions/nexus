// StatusBadge.tsx
export default function StatusBadge({ status }: { status: string }) {
  const getStyles = (status: string) => {
    switch (status) {
      case "Not Started":
        return {
          color: "#8c8c8c",
          background: "#f5f5f5",
          border: "1px solid #d9d9d9",
        };
      case "Partially Invoiced":
        return {
          color: "#1890FF",
          background: "#E6F7FF",
          border: "1px solid #91D5FF",
        };
      case "Awaiting Delivery":
        return {
          color: "#FAAD14",
          background: "#FFFBE6",
          border: "1px solid #FFE58F",
        };
      case "Partially Received":
        return {
          color: "#722ED1",
          background: "#F9F0FF",
          border: "1px solid #D3ADF7",
        };
      case "Closed":
        return {
          color: "#52C41A",
          background: "#F6FFED",
          border: "1px solid #B7EB8F",
        };
      case "Cancel":
        return {
          color: "#ff4d4f",
          background: "#fff1f0",
          border: "1px solid #ffa39e",
        };
      default:
        return {
          color: "#faad14",
          background: "#fffbe6",
          border: "1px solid #ffe58f",
        };
    }
  };

  const styles = {
    ...getStyles(status),
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 400,
    padding: "0 8px",
    maxWidth: "fit-content",
  };

  return <div style={styles}>{status}</div>;
}
