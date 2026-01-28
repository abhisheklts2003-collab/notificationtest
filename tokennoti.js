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
    console.log("🎯 Sending notification to SINGLE USER");

    const response = await admin.messaging().send({
      token: token, // 🔥 DIRECT USER TOKEN
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
      },
    });

    console.log("✅ Notification sent to single user");
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
