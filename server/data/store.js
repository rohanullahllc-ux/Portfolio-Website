const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");
const MONGODB_URI = process.env.MONGODB_URI;

let cache = null;
let mongoCollection = null;

function seedFromFile() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

async function initStore() {
  if (!MONGODB_URI) {
    cache = seedFromFile();
    console.log("Data store: local file (server/data/db.json)");
    return;
  }

  const { MongoClient } = require("mongodb");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  mongoCollection = client.db("portfolio").collection("site");

  const existing = await mongoCollection.findOne({ _id: "main" });
  if (existing) {
    delete existing._id;
    cache = existing;
  } else {
    cache = seedFromFile();
    await mongoCollection.insertOne({ _id: "main", ...cache });
  }
  console.log("Data store: MongoDB Atlas");
}

function readDb() {
  return JSON.parse(JSON.stringify(cache));
}

function writeDb(data) {
  cache = data;
  if (mongoCollection) {
    mongoCollection.replaceOne({ _id: "main" }, { _id: "main", ...data }, { upsert: true }).catch((err) => {
      console.error("MongoDB save failed:", err.message);
    });
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  }
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

module.exports = { initStore, readDb, writeDb, nextId };
