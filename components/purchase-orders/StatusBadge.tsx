export default function StatusBadge({ status }: { status: string }) {
  return (
    <div
      style={{
        color: status === "Approved" ? "#52C41A" : "#FAAD14",
        background: status === "Approved" ? "#F6FFED" : "#FFFBE6",
        border:
          status === "Approved" ? "1px solid #B7EB8F" : "1px solid #FFE58F",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 400,
        padding: "0 8px",
        maxWidth: "fit-content",
      }}
    >
      {status}
    </div>
  );
}
