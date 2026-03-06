import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

const envContent = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
const env = Object.fromEntries(
  envContent.split("\n").filter(l => l.includes("=")).map(l => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

console.log("URI:", env.MONGODB_URI?.substring(0, 40) + "...");

const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  console.log("✓ Conectado");
  const docs = await client.db(env.MONGODB_DB).collection(env.MONGODB_COLLECTION_NFQ).find({}).toArray();
  console.log(`✓ Documentos: ${docs.length}`);
  if (docs[0]) console.log("Primer doc:", JSON.stringify(docs[0], null, 2));
} catch (e) {
  console.error("✗ Error:", e.message);
} finally {
  await client.close();
}
