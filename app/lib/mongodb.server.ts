import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { resolve } from "path";

// En local carga el .env; en Vercel/producción las vars ya están en process.env
dotenv.config({ path: resolve(process.cwd(), ".env"), override: false });

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está definida en .env");
  if (cachedClient) {
    try {
      await cachedClient.db("admin").command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }
  cachedClient = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await cachedClient.connect();
  return cachedClient;
}

export interface NfqEventRaw {
  id: string;
  title: string;
  category: "nfq";
  problema: string;
  solucion: string;
  aprendizaje: string;
  start: string; // ISO string
  color: string;
}

export async function getNfqEvents(): Promise<NfqEventRaw[]> {
  const client = await getClient();
  const db = process.env.MONGODB_DB ?? "portafolio";
  const col = process.env.MONGODB_COLLECTION_NFQ ?? "nfq";
  const docs = await client
    .db(db)
    .collection(col)
    .find({})
    .sort({ fecha: 1 })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.titulo as string,
    category: "nfq" as const,
    problema: doc.problema as string,
    solucion: doc.solucion as string,
    aprendizaje: doc.aprendizaje as string,
    start: new Date(doc.fecha as string | Date).toISOString(),
    color: "#c084fc",
  }));
}
