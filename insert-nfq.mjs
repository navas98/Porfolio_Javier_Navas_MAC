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

const client = new MongoClient(env.MONGODB_URI);

try {
  await client.connect();
  const col = client.db(env.MONGODB_DB).collection(env.MONGODB_COLLECTION_NFQ);

  const doc = {
    titulo: "",
    fecha: new Date("2026-02-23"),
    problema: "",
    solucion: "",
    aprendizaje: "",
  };

  const result = await col.insertOne(doc);
  console.log("✓ Registro insertado con ID:", result.insertedId.toString());
} catch (e) {
  console.error("✗ Error:", e.message);
} finally {
  await client.close();
}
