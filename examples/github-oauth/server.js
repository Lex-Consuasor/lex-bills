require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const required = ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "SESSION_SECRET"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const app = express();
const port = Number(process.env.PORT || 3000);
const callbackUrl = process.env.GITHUB_CALLBACK_URL || `http://localhost:${port}/auth/github/callback`;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

app.get("/", (request, response) => {
  const user = request.session.githubUser;
  response.type("html").send(`
    <!doctype html>
    <html lang="en"><head><meta charset="utf-8"><title>GitHub OAuth example</title></head>
    <body>
      <main>
        <h1>GitHub OAuth example</h1>
        ${user
          ? `<p>Signed in as <strong>${escapeHtml(user.login)}</strong>.</p><p><a href="/logout">Sign out</a></p>`
          : '<p><a href="/auth/github">Continue with GitHub</a></p>'}
      </main>
    </body></html>
  `);
});

app.get("/auth/github", (request, response) => {
  const state = crypto.randomBytes(24).toString("hex");
  request.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: "read:user user:email",
    state
  });

  response.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get("/auth/github/callback", async (request, response, next) => {
  try {
    const { code, state, error } = request.query;
    if (error) return response.status(400).send("GitHub sign-in was cancelled.");
    if (!code || !state || state !== request.session.oauthState) {
      return response.status(400).send("The sign-in request could not be verified.");
    }

    delete request.session.oauthState;
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl
      })
    });
    const token = await tokenResponse.json();
    if (!token.access_token) throw new Error("GitHub did not return an access token.");

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!profileResponse.ok) throw new Error("Could not retrieve the GitHub profile.");

    request.session.githubUser = await profileResponse.json();
    response.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.redirect("/");
  });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).send("Unable to complete GitHub sign-in.");
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

app.listen(port, () => {
  console.log(`GitHub OAuth example listening on http://localhost:${port}`);
  console.log(`Callback URL: ${callbackUrl}`);
});
