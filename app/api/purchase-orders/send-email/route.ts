import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

export const runtime = "nodejs";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function buildRawEmail({
  from,
  to,
  cc,
  bcc,
  subject,
  htmlBody,
}: {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlBody: string;
}): string {
  const boundary = `----=_NextPart_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;

  // Build recipient headers
  const recipients = [];
  if (to && to.length > 0) recipients.push(`To: ${to.join(", ")}`);
  if (cc && cc.length > 0) recipients.push(`Cc: ${cc.join(", ")}`);
  if (bcc && bcc.length > 0) recipients.push(`Bcc: ${bcc.join(", ")}`);

  // Email headers
  const headers = [
    `From: ${from}`,
    ...recipients,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36)}@${
      process.env.VERIFIED_DOMAIN
    }>`,
    ``,
  ].join("\r\n");

  // HTML body part
  const htmlPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    htmlBody,
    ``,
  ].join("\r\n");

  // End boundary (ready for future attachments)
  const endBoundary = `--${boundary}--`;

  return headers + htmlPart + endBoundary;
}

function validateEmailPayload(payload: any) {
  const errors: string[] = [];

  // Check recipients
  if (!payload.to || !Array.isArray(payload.to) || payload.to.length === 0) {
    errors.push("At least one TO recipient is required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allEmails = [
    ...(payload.to || []),
    ...(payload.cc || []),
    ...(payload.bcc || []),
  ];

  const invalidEmails = allEmails.filter((email) => !emailRegex.test(email));
  if (invalidEmails.length > 0) {
    errors.push(`Invalid email addresses: ${invalidEmails.join(", ")}`);
  }

  // Check required fields
  if (
    !payload.subject ||
    typeof payload.subject !== "string" ||
    payload.subject.trim().length === 0
  ) {
    errors.push("Subject is required");
  }

  if (
    !payload.body ||
    typeof payload.body !== "string" ||
    payload.body.trim().length === 0
  ) {
    errors.push("Body is required");
  }

  return errors;
}

// Send raw email function
async function sendRawEmail({
  to,
  cc,
  bcc,
  subject,
  body,
}: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
}) {
  try {
    const fromAddress = process.env.SES_FROM_EMAIL!;
    if (!fromAddress) throw new Error("SES_FROM_EMAIL is not configured");

    console.log("Sending raw email:", {
      from: fromAddress,
      to: to.length,
      cc: cc?.length || 0,
      bcc: bcc?.length || 0,
      subject: subject.substring(0, 50) + (subject.length > 50 ? "..." : ""),
    });

    // Build raw MIME message
    const rawMessage = buildRawEmail({
      from: fromAddress,
      to,
      cc,
      bcc,
      subject,
      htmlBody: body,
    });

    // Prepare all recipients for SES
    const allRecipients = [...to, ...(cc || []), ...(bcc || [])];

    // Send raw email
    const command = new SendEmailCommand({
      FromEmailAddress: fromAddress,
      Destination: {
        ToAddresses: to,
        CcAddresses: cc,
        BccAddresses: bcc,
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: body,
              Charset: "UTF-8",
            },
          },
        },
      },
    });

    const result = await sesClient.send(command);

    console.log("Raw email sent successfully:", result);

    return {
      success: true,
      messageId: result.$metadata.requestId || null,
      recipients: allRecipients.length,
    };
  } catch (error) {
    console.error("Failed to send raw email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code || "UNKNOWN_ERROR",
    };
  }
}

// Future: Function to send email with PDF attachment
async function sendRawEmailWithAttachment({
  to,
  cc,
  bcc,
  subject,
  body,
  pdfBuffer,
  pdfFileName,
}: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  pdfBuffer?: Buffer;
  pdfFileName?: string;
}) {
  return await sendRawEmail({ to, cc, bcc, subject, body });
}

export async function POST(req: Request) {
  //   const { po_id } = await req.json();

  //   if (!po) return new Response("Order not found", { status: 404 });

  //   const pdfBuffer = await pdf(<PoDetailPDF data={po} />).toBuffer();

  // 2) Email with SESv2 (attachment = bytes)

  try {
    const payload = await req.json();

    console.log("Raw email request received:", {
      to: payload.to?.length || 0,
      cc: payload.cc?.length || 0,
      bcc: payload.bcc?.length || 0,
      subject:
        payload.subject?.substring(0, 50) +
        (payload.subject?.length > 50 ? "..." : ""),
    });

    // Validate payload
    const validationErrors = validateEmailPayload(payload);
    if (validationErrors.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Send raw email
    const result = await sendRawEmail({
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      body: payload.body,
    });

    if (result.success) {
      return Response.json({
        status: "success",
        message: "Raw email sent successfully",
        messageId: result.messageId,
        recipients: result.recipients,
        type: "raw_email",
      });
    } else {
      return Response.json(
        {
          success: false,
          message: "Failed to send raw email",
          error: result.error,
          code: result.code,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
