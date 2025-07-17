import { InvoiceFieldType } from "@/types/purchase-invoice/purchase-invoice.type";
import { DatePicker, Form, Input } from "antd";

export default function InvoiceFirstStep() {
  return (
    <section className="w-full">
      <Form.Item
        name="invoiceNumber"
        label="Invoice Number"
        rules={[{ required: true, message: "Please input invoice number!" }]}
      >
        <Input size="large" style={{ width: "100%" }} disabled />
      </Form.Item>

      <div className="flex gap-6 justify-between items-center">
        <Form.Item<InvoiceFieldType>
          name="invoice_date"
          label="Invoice Date"
          style={{ width: "100%" }}
          rules={[{ required: true, message: "Please select invoice date!" }]}
        >
          <DatePicker
            size="large"
            format={"MMM DD YYYY"}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<InvoiceFieldType>
          name="due_date"
          label="Due Date"
          style={{ width: "100%" }}
          rules={[
            {
              required: true,
              message: "Please select due date!",
            },
          ]}
        >
          <DatePicker
            size="large"
            format={"MMM DD YYYY"}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </div>
    </section>
  );
}
