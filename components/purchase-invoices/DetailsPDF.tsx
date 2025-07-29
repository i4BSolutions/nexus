// PoDetailPDF.tsx
import { PurchaseInvoiceInterface } from "@/types/purchase-invoice/purchase-invoice.type";
import { FileTextOutlined } from "@ant-design/icons";
import {
  ClipPath,
  Defs,
  Document,
  G,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

// PDF-specific styles
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  orgHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orgLogo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  header: {
    backgroundColor: "#FFFBE6",
    borderBottom: "1pt solid #FFE58F",
    padding: 16,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: "bold",
    color: "#FFC53D",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#666",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFC53D",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderTop: "1pt solid #e0e0e0",
    borderBottom: "1pt solid #e0e0e0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e0e0e0",
    padding: 8,
  },
  col: {
    flex: 1,
  },
  colRight: {
    flex: 1,
    textAlign: "right",
  },
  totalSection: {
    marginTop: 12,
    textAlign: "right",
  },
  bottomSection: {
    marginTop: 16,
  },
  note: {
    fontSize: 10,
    color: "#666",
  },
});

export default function PiDetailPDF({
  data,
}: {
  data: PurchaseInvoiceInterface;
}) {
  // Total amount handler
  const getTotal = () => {
    const items = data.invoice_items;
    const exchangeRate = data.usd_exchange_rate;
    let totalLocal = 0;

    if (items) {
      items.forEach((item: any) => {
        const price = item.unit_price_local || 0;
        totalLocal += (item.quantity || 0) * price;
      });
    }

    const totalUSD = exchangeRate
      ? (totalLocal / exchangeRate).toFixed(2)
      : "0.00";

    return {
      totalLocal: totalLocal.toLocaleString(),
      totalUSD: totalUSD.toLocaleString(),
    };
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <Path
                d="M23.647 11.0134L18.8435 6.20982C18.7095 6.07589 18.5287 6 18.339 6H8.85686C8.46177 6 8.14258 6.3192 8.14258 6.71429V25.2857C8.14258 25.6808 8.46177 26 8.85686 26H23.1426C23.5377 26 23.8569 25.6808 23.8569 25.2857V11.5201C23.8569 11.3304 23.781 11.1473 23.647 11.0134ZM22.2095 11.8482H18.0087V7.64732L22.2095 11.8482ZM22.2497 24.3929H9.74972V7.60714H16.4908V12.4286C16.4908 12.6772 16.5896 12.9157 16.7654 13.0915C16.9412 13.2673 17.1797 13.3661 17.4283 13.3661H22.2497V24.3929ZM15.8212 18.3661H11.714C11.6158 18.3661 11.5354 18.4464 11.5354 18.5446V19.6161C11.5354 19.7143 11.6158 19.7946 11.714 19.7946H15.8212C15.9194 19.7946 15.9997 19.7143 15.9997 19.6161V18.5446C15.9997 18.4464 15.9194 18.3661 15.8212 18.3661ZM11.5354 15.5089V16.5804C11.5354 16.6786 11.6158 16.7589 11.714 16.7589H20.2854C20.3837 16.7589 20.464 16.6786 20.464 16.5804V15.5089C20.464 15.4107 20.3837 15.3304 20.2854 15.3304H11.714C11.6158 15.3304 11.5354 15.4107 11.5354 15.5089Z"
                fill="white"
              />
            </Svg>
          </View>
          <View>
            <Text style={styles.headerTitle}>Invoice Details</Text>
            <Text style={styles.headerSubtitle}>
              Details and information about this Invoice
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text>{data?.invoice_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text>{data?.due_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Currency:</Text>
            <Text>{data?.currency_code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Exchange Rate (to USD):</Text>
            <Text>
              1 USD = {data?.usd_exchange_rate} {data?.currency_code}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Items</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.col]}>PRODUCT</Text>
          <Text style={[styles.col]}>ORDERED</Text>
          <Text style={[styles.col]}>PO UNIT PRICE</Text>
          <Text style={[styles.col]}>INV QUANTITY</Text>
          <Text style={[styles.col]}>INV UNIT PRICE</Text>
          <Text style={[styles.colRight]}>SUBTOTAL</Text>
        </View>

        {data.invoice_items
          ? data.invoice_items.map((item: any, index: number) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.col}>{item?.product_name}</Text>
                <Text style={styles.col}>{item?.total_ordered}</Text>
                <View style={styles.col}>
                  <Text>
                    {item?.po_unit_price_local.toLocaleString()}{" "}
                    {data?.purchase_order_currency_code}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    ({item?.po_unit_price_usd.toLocaleString()} USD)
                  </Text>
                </View>
                <Text style={styles.col}>{item?.quantity}</Text>
                <View style={styles.col}>
                  <Text>
                    {item?.unit_price_local.toLocaleString()}{" "}
                    {data?.currency_code}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    ({item?.unit_price_usd.toLocaleString()} USD)
                  </Text>
                </View>
                <View style={styles.colRight}>
                  <Text>
                    {item?.sub_total_local.toLocaleString()}{" "}
                    {data?.currency_code}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    ({item.sub_total_usd.toLocaleString()} USD)
                  </Text>
                </View>
              </View>
            ))
          : []}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.label}>Total Amount</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {getTotal().totalLocal.toLocaleString()} {data?.currency_code}
          </Text>
          <Text style={{ fontSize: 10, color: "#666" }}>
            ({getTotal().totalUSD.toLocaleString()} USD)
          </Text>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Note:</Text>
            <Text style={styles.note}>
              {data.note || "No additional notes"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
