import type { Route } from "./+types/home";
import Desktop from "../components/Desktop";
import { textos } from "../textos";

export function meta({}: Route.MetaArgs) {
  return [
    { title: textos.meta.title },
    { name: "description", content: textos.meta.description },
  ];
}

export default function Home() {
  return <Desktop />;
}
