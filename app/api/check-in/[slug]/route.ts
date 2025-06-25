/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";
import { unstable_noStore } from "next/cache";
import puppeteer from "puppeteer";
import { exec } from "child_process";
import path from "path";

const sheetService = async () => {
  const auth = await new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      private_key: process.env.NEXT_PUBLIC_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = await google.sheets({
    auth,
    version: "v4",
  });

  return sheets;
};

export const fetchCache = "force-no-store";
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  unstable_noStore();
  try {
    const { slug } = await params;

    const pdfPath = path.join("./hello.pdf");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const sheet = await sheetService();

    console.log("env", process.env.NEXT_PUBLIC_SPREADSHEET_ID);

    const currentEventData = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: `Guest list eo-rise-above-the-new-world-disorder 2025-06-18`,
    });

    // Check if the slug exists in the sheet data
    const isSlugExists = currentEventData.data.values?.some(
      (row: any[]) => row[6] === slug
    );

    if (!isSlugExists) {
    }

    // If the slug does not exist, return a 404 response
    if (!isSlugExists) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        },
      });
    }
    // Get the row data for the slug
    const rowData = currentEventData.data.values?.find(
      (row: any[]) => row[6] === slug
    );

    // Set page content
    if (!rowData) {
      await browser.close();
      return new Response("Row data not found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        },
      });
    }
    await page.setContent(`
            <html>
                <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh; width:100vw;">
                    <div style="font-size:24px;text-align:center;width:100%;">${
                      rowData[2]
                    }<br /><span style="font-size:${
      String(rowData[1]).length > 50 ? "16" : "20"
    }px; margin-top: 4px">${rowData[1]}</span></div>
                </body>
            </html>
        `);

    // Generate PDF with 7cm x 10cm size
    const pdfBuffer = await page.pdf({
      path: pdfPath,
      width: "7cm",
      height: "5cm",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    console.log("PDF generated successfully");

    // Print the PDF using the default printer (macOS 'lp' command)
    exec(`lp "${pdfPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Print error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Print stderr: ${stderr}`);
        return;
      }
      console.log("Print job sent:", stdout);
    });

    exec(`lp "${pdfPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Print error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Print stderr: ${stderr}`);
        return;
      }
      console.log("Print job sent:", stdout);
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}.pdf"`,
      },
    });
  } catch (error) {
    console.log(error);
    return Response.error();
  }
}
