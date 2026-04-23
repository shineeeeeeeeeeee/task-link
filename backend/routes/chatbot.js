import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const userId = req.body.userId;
    const authToken = req.body.authToken;

    const response = await axios.post("http://127.0.0.1:5002/chatbot", {
      message: userMessage,
      userId: userId,         
      authToken: authToken    
    });

    // forward the reply and recommendations (if any) from the AI service
    console.log("Chatbot service response:", response.data);
    res.json({
      reply: response.data.reply,
      recommendations: response.data.recommendations || []
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      reply: "Error connecting to AI service",
      recommendations: []
    });
  }
});

export default router;
