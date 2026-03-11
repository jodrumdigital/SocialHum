import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // HubSpot Contact Creation Endpoint
  app.post("/api/hubspot/contact", async (req, res) => {
    const { firstName, lastName, email, phone, businessName, websiteUrl } = req.body;
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("HUBSPOT_ACCESS_TOKEN is not set");
      return res.status(500).json({ error: "HubSpot integration not configured" });
    }

    try {
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          properties: {
            firstname: firstName,
            lastname: lastName,
            email: email,
            phone: phone,
            company: businessName,
            website: websiteUrl,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("HubSpot API error:", data);
        return res.status(response.status).json(data);
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error sending to HubSpot:", error);
      res.status(500).json({ error: "Failed to send data to HubSpot" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
