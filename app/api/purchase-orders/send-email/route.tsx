import PoDetailPDF from "@/components/purchase-orders/detail/PoDetailPdf";
import { getPoDetail } from "@/lib/getPoDetail";
import { renderToBuffer } from "@react-pdf/renderer";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const { to, cc, bcc, subject, body, po_id } = await req.json();

  const po = await getPoDetail(po_id);

  if (!po) {
    return Response.json(
      {
        success: false,
        message: "Purchase order not found",
      },
      { status: 404 }
    );
  }

  const pdfStream = await renderToBuffer(<PoDetailPDF data={po} />);

  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: to,
    cc: cc,
    bcc: bcc,
    subject: subject,
    text: body,
    attachments: [
      {
        content: pdfStream,
        filename: `${po.purchase_order_no}.pdf`,
      },
    ],
  });

  if (result.error) {
    return Response.json(
      {
        success: false,
        message: "Failed to send raw email",
        error: result.error,
      },
      { status: 500 }
    );
  }

  if (result.data) {
    return Response.json({
      status: "success",
      message: "Email sent successfully",
      data: result.data,
    });
  }
}
