import type { Metadata } from "next";
import VRWatchScreen from "@/components/player/VRWatchScreen";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Watch ${id}`, description: "HOMINSU 360-degree VR content player" };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  return <VRWatchScreen contentId={id} />;
}
