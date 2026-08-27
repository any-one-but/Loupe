import { createFileRoute } from "@tanstack/react-router";
import { LoupeApp } from "@/components/loupe-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LoupeApp />;
}
