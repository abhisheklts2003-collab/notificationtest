import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import callNotificationRoutes from "./callnotification.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", callNotificationRoutes);

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
   🔔 SEND TO ALL USERS (TOPIC)
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
    const response = await admin.messaging().send({
      topic: "all_users",
      notification: { title, body },
    });

    return res.json({ success: true, response });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================
   🔔 SEND TO SINGLE USER (TOKEN)
========================= */
app.post("/send-to-token", async (req, res) => {
  console.log("📩 /send-to-token HIT");
  console.log("📦 Request body:", req.body);

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({
      success: false,
      message: "token, title & body required",
    });
  }

  try {
    const response = await admin.messaging().send({
      token: token, // 🔥 SINGLE USER TOKEN
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
      },
    });

    console.log("✅ Notification sent to single user");

    return res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("❌ FCM ERROR", error);

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
