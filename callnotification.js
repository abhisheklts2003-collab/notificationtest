import express from "express";
import admin from "firebase-admin";

const router = express.Router();

/* =========================
   📞 SEND CALL NOTIFICATION
========================= */
router.post("/send-call", async (req, res) => {
  console.log("📞 /send-call HIT");
  console.log("📦 Request body:", req.body);

  const { token, callerName, channelId } = req.body;

  if (!token || !callerName || !channelId) {
    return res.status(400).json({
      success: false,
      message: "token, callerName & channelId required",
    });
  }

  try {
    const response = await admin.messaging().send({
      token: token,

      // ⚠️ CALL TYPE DATA MESSAGE
      data: {
        type: "call",
        callerName: callerName,
        channelId: channelId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },

      android: {
        priority: "high",
        notification: {
          channelId: "call_channel",
          sound: "default",
        },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
            contentAvailable: true,
          },
        },
      },
    });

    console.log("✅ Call notification sent");

    return res.json({
      success: true,
      response,
    });

  } catch (error) {
    console.error("❌ CALL FCM ERROR", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
