import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import Desktop from "../components/Desktop";
import { textos } from "../textos";
import { getNfqEvents } from "../lib/mongodb.server";

export async function loader() {
  try {
    const nfqEvents = await getNfqEvents();
    console.log(`[MongoDB] ${nfqEvents.length} eventos NFQ cargados`);
    return { nfqEvents };
  } catch (e) {
    console.error("[MongoDB] Error:", (e as Error).message);
    return { nfqEvents: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: textos.meta.title },
    { name: "description", content: textos.meta.description },
  ];
}

export default function Home() {
  const { nfqEvents } = useLoaderData<typeof loader>();
  return <Desktop nfqEvents={nfqEvents} />;
}
