/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  // const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handleScanQRCode = async (qrCode: any) => {
    setIsLoading(true);
    setResultMessage("");

    // const code = String(qrCode).split("/")[4].split(",")[0];

    console.log("Scanned QR Code:", qrCode);

    try {
      const response = await fetch(`/api/check-in/${qrCode}`, {
        method: "GET",
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        const firstName = data?.rowData?.[2] ?? "";
        const lastName = data?.rowData?.[3] ?? "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

        setResultMessage(
          fullName
            ? `${fullName} - Bạn đã check in thành công`
            : "Bạn đã check in thành công",
        );
      } else {
        setResultMessage("bạn đã check in thất bại");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
      setResultMessage("bạn đã check in thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="aspect-square w-96 h-96 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <Image src="/loading.gif" alt="Loading" width={100} height={100} />
          </div>
        )}
        <Scanner
          paused={false}
          allowMultiple
          scanDelay={5000}
          onScan={(result: any) => {
            if (!isLoading) {
              handleScanQRCode(result[0].rawValue);
            }
          }}
          sound={false}
        />
      </div>
      {resultMessage && (
        <div className="absolute bottom-10 left-1/2 w-full max-w-md -translate-x-1/2 px-4">
          <div className="rounded-lg bg-white p-4 text-center text-lg font-semibold shadow-lg">
            {resultMessage}
          </div>
        </div>
      )}
    </div>
  );
}
