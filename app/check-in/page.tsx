/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handleScanQRCode = (qrCode: any) => {
    setIsLoading(true);

    const code = String(qrCode).split("/")[4].split(",")[0];

    fetch(`/api/check-in/${code}`, {
      method: "GET",
    }).then(() => {
      setIsLoading(false);
    });
  };

  // useEffect(() => {
  //   const handlePermissions = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //       });

  //       setPermissionsGranted(true);
  //     } catch (error) {
  //       console.error("Error getting user media:", error);
  //       setPermissionsGranted(false);
  //     }
  //   };

  //   handlePermissions();
  // }, []);

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
    </div>
  );
}
