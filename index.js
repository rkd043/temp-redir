var express = require("express");
var app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

// Parse JSON bodies for POST requests
app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

// In-memory storage for redirects (replace with a database in a real application)
let redirects = {};

// POST endpoint to create a new redirect
app.post("/create", (req, res) => {
  const { url, customPath } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  // Generate a unique ID for the redirect
  const id = Math.random().toString(36).substring(7);
  // Determine the redirect URL based on customPath existence
  let redirectUrl;
  if (customPath) {
    redirectUrl = `/${customPath}/${id}`;
  } else {
    redirectUrl = `/redirect/${id}`;
  }

  // Store the redirect URL
  redirects[id] = url;
  setTimeout(() => {
    delete redirects[id];
  }, 1000 * 300);

  // Return the URL of the new redirect
  res.json({ redirectUrl });
});

// Endpoint to redirect based on ID
app.get("/:customPath?/:id", (req, res) => {
  let { customPath, id } = req.params;
  const redirectUrl = redirects[id];
  if (!redirectUrl) {
    return res.status(404).json({ error: "Redirect not found" });
  }
  if (!customPath) {
    customPath = "redirect";
  }

  res.redirect(redirectUrl);
});

// Frontend HTML and JavaScript
app.get("/", (req, res) => {
  // HTML and JavaScript combined in a template literal
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirect Creator</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            input[type="text"] {
                width: 300px;
                padding: 10px;
                font-size: 16px;
            }
            button {
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <h2>Create a Temporary Redirect</h2>
        <form id="redirectForm">
            <label for="url">Enter URL:</label>
            <input type="text" id="url" name="url" required>
            <label for="customPath">Custom Path (optional):</label>
            <input type="text" id="customPath" name="customPath">
            <button type="submit">Create Redirect</button>
        </form>
        <div id="redirectUrl"></div>

        <script>
            document.getElementById('redirectForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                const url = document.getElementById('url').value;
                const customPath = document.getElementById('customPath').value;
                
                const response = await fetch('/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url, customPath })
                });

                const data = await response.json();
                document.getElementById('redirectUrl').innerHTML = \`<p>Redirect URL: <a href="\${'https://qdlcz5-3000.csb.app'+data.redirectUrl}">\${'https://qdlcz5-3000.csb.app'+data.redirectUrl}</p>\`;
            });
        </script>
    </body>
    </html>
    `;

  res.send(html);
});

app.listen(3000, () => {
  console.log("temp-redir started!");
});
