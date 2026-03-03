import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../../utils/constant";
import { useUser } from "../../../context/UserContext";

export const useSignalRConnection = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const { user } = useUser();

  useEffect(() => {
    // لو مفيش يوزر أو توكن مش هنبدأ الاتصال
    if (!user?.token) return;

    // إعداد الاتصال
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/ChatHub`, {
        accessTokenFactory: () => user.token, // إرسال التوكن للسيرفر
      })
      .withAutomaticReconnect() // إعادة الاتصال تلقائياً لو النت فصل
      .build();

    // بدء الاتصال
    newConnection
      .start()
      .then(() => {
        console.log("✅ تم الاتصال بـ SignalR بنجاح");
        setConnection(newConnection);
      })
      .catch((err) => console.error("❌ فشل الاتصال بـ SignalR:", err));

    // قفل الاتصال لما اليوزر يقفل الموقع
    return () => {
      newConnection.stop();
    };
  }, [user?.token]);

  return connection; // بنرجع الـ connection عشان نستخدمه في باقي الأماكن
};
