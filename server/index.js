const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const apiRoutes = require("./routes/api");
const { initStore } = require("./data/store");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
    },
  })
);

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "..", "public")));

initStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Portfolio website running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize data store:", err.message);
    process.exit(1);
  });
