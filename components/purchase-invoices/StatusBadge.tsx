export default function StatusBadge({ status }: { status: string }) {
  return (
    <div
      style={{
        color: status === "Paid" ? "#52C41A" : "black",
        background: status === "Paid" ? "#F6FFED" : "#FAFAFA",
        border: status === "Paid" ? "1px solid #B7EB8F" : "1px solid #D9D9D9",
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
