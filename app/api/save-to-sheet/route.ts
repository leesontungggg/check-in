import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_NAME = "Check In Day 2"; // Change if your sheet name is different

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const sheet = await sheetService();

    const totalData = await sheet.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:A`,
    });

    const valuesArray = totalData.data.values ?? [];
    const values = [[valuesArray.length - 1, '', ...Object.values(body)]];

    await sheet.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${(totalData.data.values?.length ?? 0) + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error saving to sheet:", error);
    let message = "An unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
