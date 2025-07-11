// PoDetailPDF.tsx
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

import { PurchaseOrderDetailDto } from "@/types/purchase-order/purchase-order-detail.type";
import { PurchaseOrderItemInterface } from "@/types/purchase-order/purchase-order-item.type";

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
    backgroundColor: "#F9F0FF",
    borderBottom: "1pt solid #D3ADF7",
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
    color: "#9254DE",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#666",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#9254DE",
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

export default function PoDetailPDF({
  data,
}: {
  data: PurchaseOrderDetailDto;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* <View style={styles.orgHeader}>
          <Image src={""} style={styles.orgLogo} />
        </View> */}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <G clip-path="url(#clip0_981_1937)">
                <Path
                  d="M19.5091 8.8098L18.8484 1.83212C18.8149 1.47052 18.527 1.1848 18.1654 1.14909L11.1877 0.488373H11.1788C11.1073 0.488373 11.0515 0.510694 11.0091 0.553105L0.556 11.0062C0.535308 11.0269 0.518891 11.0514 0.507689 11.0784C0.496488 11.1054 0.490723 11.1344 0.490723 11.1636C0.490723 11.1928 0.496488 11.2218 0.507689 11.2488C0.518891 11.2758 0.535308 11.3003 0.556 11.321L8.67654 19.4415C8.71895 19.4839 8.77475 19.5062 8.83502 19.5062C8.89529 19.5062 8.95109 19.4839 8.9935 19.4415L19.4466 8.98837C19.4913 8.9415 19.5136 8.87677 19.5091 8.8098ZM8.83279 17.2004L2.79707 11.1647L11.7189 2.24284L17.2323 2.76516L17.7547 8.27855L8.83279 17.2004ZM13.7502 4.28302C12.6676 4.28302 11.7859 5.16471 11.7859 6.2473C11.7859 7.32989 12.6676 8.21159 13.7502 8.21159C14.8328 8.21159 15.7145 7.32989 15.7145 6.2473C15.7145 5.16471 14.8328 4.28302 13.7502 4.28302ZM13.7502 6.96159C13.3551 6.96159 13.0359 6.64239 13.0359 6.2473C13.0359 5.85221 13.3551 5.53302 13.7502 5.53302C14.1453 5.53302 14.4645 5.85221 14.4645 6.2473C14.4645 6.64239 14.1453 6.96159 13.7502 6.96159Z"
                  fill="white"
                />
              </G>
              <Defs>
                <ClipPath id="clip0_981_1937">
                  <Rect width="20" height="20" fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
          </View>
          <View>
            <Text style={styles.headerTitle}>Purchase Order Details</Text>
            <Text style={styles.headerSubtitle}>
              Details and information about this purchase order
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Supplier:</Text>
            <Text>{data.supplier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text>{data.order_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Budget:</Text>
            <Text>{data.budget}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Region:</Text>
            <Text>{data.region}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expected Delivery Date:</Text>
            <Text>{data.expected_delivery_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Currency:</Text>
            <Text>
              {data.currency_code} (1 USD ={" "}
              {data.usd_exchange_rate?.toLocaleString()} {data.currency_code})
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Items</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.col]}>PRODUCT</Text>
          <Text style={[styles.col]}>QUANTITY</Text>
          <Text style={[styles.col]}>UNIT PRICE</Text>
          <Text style={[styles.colRight]}>SUBTOTAL</Text>
        </View>

        {data.product_items.map(
          (item: PurchaseOrderItemInterface, index: number) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.col}>{item.product_name}</Text>
              <Text style={styles.col}>{item.quantity}</Text>
              <View style={styles.col}>
                <Text>
                  {item.unit_price_local.toLocaleString()} {data.currency_code}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  ({item.unit_price_usd.toLocaleString()} USD)
                </Text>
              </View>
              <View style={styles.colRight}>
                <Text>
                  {item.sub_total_local.toLocaleString()} {data.currency_code}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  ({item.sub_total_usd.toLocaleString()} USD)
                </Text>
              </View>
            </View>
          )
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.label}>Total Amount</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {data.total_amount_local.toLocaleString()} {data.currency_code}
          </Text>
          <Text style={{ fontSize: 10, color: "#666" }}>
            ({data.total_amount_usd.toLocaleString()} USD)
          </Text>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Contact Person:</Text>
            <Text>{data.contact_person}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sign Person:</Text>
            <Text>{data.sign_person || "No sign person"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Authorized Sign Person:</Text>
            <Text>
              {data.authorized_sign_person || "No authorized sign person"}
            </Text>
          </View>
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
