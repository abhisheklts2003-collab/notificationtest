import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🔐 FIREBASE INIT (SAFE)
========================= */
let serviceAccount;

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT ENV missing");
    process.exit(1);
  }

  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("✅ Firebase service account loaded");
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT");
  console.error(err);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin initialized");
} catch (err) {
  console.error("❌ Firebase initializeApp failed");
  console.error(err);
  process.exit(1);
}

/* =========================
   🔔 TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("🚀 Notification Server Running");
});

/* =========================
   🔔 SEND NOTIFICATION API
========================= */
app.post("/send-notification", async (req, res) => {
  console.log("📩 /send-notification HIT");
  console.log("📦 Request body:", req.body);

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: "title & body required",
    });
  }

  try {
    console.log("🔥 Sending notification to ALL USERS (topic)");

    const response = await admin.messaging().send({
      topic: "all_users",   // ✅ MAGIC LINE
      notification: {
        title,
        body,
      },
    });

    console.log("✅ Notification sent to all users");
    console.log("📨 FCM Response:", response);

    return res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("❌ FCM ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || "UNKNOWN",
    });
  }
});

/* =========================
   🔥 SERVER START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
