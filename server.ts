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
    const { firstName, lastName, email, phone, businessName, websiteUrl, location } = req.body;
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("HUBSPOT_ACCESS_TOKEN is not set");
      return res.status(500).json({ error: "HubSpot integration not configured" });
    }

    const properties = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: phone,
      company: businessName,
      website: websiteUrl,
      city: location, // Mapping location to city as a reasonable default
    };

    try {
      // 1. Try to create the contact
      let response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ properties }),
      });

      let data = await response.json();

      // 2. If contact already exists (409 Conflict), update it instead
      if (response.status === 409) {
        console.log(`Contact ${email} already exists, searching for ID to update...`);
        
        // Search for the contact by email to get the ID
        const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: "email",
                operator: "EQ",
                value: email
              }]
            }]
          }),
        });

        const searchData = await searchResponse.json();
        
        if (searchResponse.ok && searchData.results && searchData.results.length > 0) {
          const contactId = searchData.results[0].id;
          console.log(`Updating existing contact ID: ${contactId}`);
          
          // Update the existing contact
          const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ properties }),
          });
          
          data = await updateResponse.json();
          if (!updateResponse.ok) {
             console.error("HubSpot update error:", data);
             return res.status(updateResponse.status).json(data);
          }

          // Create a Task for the update as well
          try {
            await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                properties: {
                  hs_task_subject: `Returning Lead: ${firstName} ${lastName}`,
                  hs_task_body: `An existing user has re-submitted the onboarding form.\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${businessName}`,
                  hs_task_status: "NOT_STARTED",
                  hs_task_priority: "MEDIUM",
                  hs_timestamp: new Date().toISOString()
                },
                associations: [
                  {
                    to: { id: contactId },
                    types: [
                      {
                        associationCategory: "HUBSPOT_DEFINED",
                        associationTypeId: 204 // Task to Contact
                      }
                    ]
                  }
                ]
              }),
            });
          } catch (taskError) {
            console.error("Failed to create update notification task:", taskError);
          }

          return res.json({ success: true, data, updated: true });
        }
      }

      if (!response.ok) {
        console.error("HubSpot API error:", data);
        return res.status(response.status).json(data);
      }

      res.json({ success: true, data, created: true });

      // 3. Create a Task to notify the user of a new lead
      try {
        const contactId = data.id;
        await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            properties: {
              hs_task_subject: `New Lead: ${firstName} ${lastName}`,
              hs_task_body: `A new user has started the onboarding process.\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${businessName}`,
              hs_task_status: "NOT_STARTED",
              hs_task_priority: "MEDIUM",
              hs_timestamp: new Date().toISOString()
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 204 // Task to Contact
                  }
                ]
              }
            ]
          }),
        });
      } catch (taskError) {
        console.error("Failed to create lead notification task:", taskError);
      }
    } catch (error) {
      console.error("Error sending to HubSpot:", error);
      res.status(500).json({ error: "Failed to send data to HubSpot" });
    }
  });

  // HubSpot Strategy Completion Endpoint
  app.post("/api/hubspot/strategy-complete", async (req, res) => {
    const { firstName, lastName, email, strategyData } = req.body;
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("HUBSPOT_ACCESS_TOKEN is not set");
      return res.status(500).json({ error: "HubSpot integration not configured" });
    }

    try {
      // 1. Find or Create the contact first to get the ID
      let contactId: string | null = null;
      
      const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "EQ",
              value: email
            }]
          }]
        }),
      });

      const searchData = await searchResponse.json();
      
      if (searchResponse.ok && searchData.results && searchData.results.length > 0) {
        contactId = searchData.results[0].id;
      } else {
        // Create if not found
        const createResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
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
            }
          }),
        });
        const createData = await createResponse.json();
        if (createResponse.ok) {
          contactId = createData.id;
        }
      }

      if (!contactId) {
        throw new Error("Could not find or create contact in HubSpot");
      }

      // 2. Create a Task associated with this contact to trigger a notification
      const taskResponse = await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          properties: {
            hs_task_subject: `Strategy Completed: ${firstName} ${lastName}`,
            hs_task_body: `User ${firstName} ${lastName} (${email}) has completed the strategy questionnaire.\n\nKey Goals: ${strategyData.primaryGoals}\nTarget Audience: ${strategyData.targetAudience}\n\nCheck the contact record for full details.`,
            hs_task_status: "NOT_STARTED",
            hs_task_priority: "HIGH",
            hs_timestamp: new Date().toISOString()
          },
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 204 // Task to Contact
                }
              ]
            }
          ]
        }),
      });

      const taskData = await taskResponse.json();
      
      if (!taskResponse.ok) {
        console.error("HubSpot Task creation error:", taskData);
        // We don't fail the whole request if the task fails, but we log it
      }

      res.json({ success: true, contactId, taskId: taskData.id });
    } catch (error) {
      console.error("Error in strategy-complete:", error);
      res.status(500).json({ error: "Failed to process strategy completion" });
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
