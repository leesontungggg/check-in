/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";
import { unstable_noStore } from "next/cache";
import { NextResponse } from "next/server";

const SHEET_NAME = "GuestList";

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

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const fetchCache = "force-no-store";
export async function GET(request: Request, { params }: Props) {
  unstable_noStore();
  try {
    const { slug } = await params;

    const sheet = await sheetService();

    const currentEventData = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    console.log("Checking slug:", slug);

    const rows = currentEventData.data.values ?? [];

    const matchedRowIndex = rows.findIndex((row: any[]) => row[1] === slug);
    const isSlugExists = matchedRowIndex !== -1;

    console.log("Is slug exists:", isSlugExists);

    if (!isSlugExists) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        },
      });
    }

    const rowNumber = matchedRowIndex + 1;
    const rowData = rows[matchedRowIndex];
    const isAlreadyCheckedIn = String(rowData?.[0] ?? "")
      .trim()
      .toLowerCase() === "x";

    if (isAlreadyCheckedIn) {
      return NextResponse.json(
        {
          success: false,
          message: "This user already checkin",
          isSlugExists,
          rowNumber,
          rowData,
        },
        { status: 400 },
      );
    }

    await sheet.spreadsheets.values.update({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["x"]],
      },
    });

    console.log("Row data for slug:", rowData);

    return NextResponse.json({
      success: true,
      isSlugExists,
      rowNumber,
      rowData,
    });
  } catch (error) {
    console.log(error);
    return Response.error();
  }
}
