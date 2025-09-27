// utils/emailContentTemplate.js
export default function emailContentTemplate ({ title, body }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f6f9fc;">
    <!-- Wrapper -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f6f9fc;padding:40px 0;">
      <tr>
        <td align="center">
          <!-- Container -->
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td align="center" bgcolor="#42a11aff" style="padding:24px;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">
                    ${process.env.APP_NAME}
                </h1>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding:30px;color:#333333;font-size:16px;line-height:1.6;">
                ${body}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td bgcolor="#f1f3f6" style="padding:20px;text-align:center;font-size:13px;color:#777;">
                <p style="margin:0;">&copy; ${new Date().getFullYear()} ${
    process.env.APP_NAME
  }. All rights reserved.</p>
                <p style="margin:4px 0 0 0;">
                  <a href="${
                    process.env.WEBSITE_URL
                  }" style="color:#0d6efd;text-decoration:none;">Visit Website</a>
                </p>
              </td>
            </tr>
            
          </table>
          <!-- End Container -->
        </td>
      </tr>
    </table>
    <!-- End Wrapper -->
  </body>
  </html>
  `
}
