import type { Route } from "./+types/home";
import Terminal from "../components/Terminal";
import { textos } from "../textos";

export function meta({}: Route.MetaArgs) {
  return [
    { title: textos.meta.title },
    { name: "description", content: textos.meta.description },
  ];
}

export default function Home() {
  return <Terminal />;
}
