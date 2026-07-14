"use client";

import { useState } from "react";
import {
  OrbitCardStack,
  type OrbitStackItem,
} from "@/components/ui/orbit-card-stack";

const team: OrbitStackItem[] = [
  {
    name: "Mira Vale",
    role: "Creative Lead",
    description: "Shapes visual systems with restraint and edge.",
    initials: "MV",
    stat: "Identity",
    accent: "#f8d66d",
    image: "/team/mira-vale.png",
  },
  {
    name: "Noor Kade",
    role: "Product Strategy",
    description: "Turns loose ideas into crisp product moves.",
    initials: "NK",
    stat: "Roadmap",
    accent: "#78dcca",
    image: "/team/noor-kade.png",
  },
  {
    name: "Ari Chen",
    role: "Founder",
    description: "Keeps the team pointed at the same signal.",
    initials: "AC",
    stat: "Vision",
    accent: "#f3f1ea",
    image: "/team/ari-chen.png",
  },
];

export default function TeamPreview() {
  const [activeMember, setActiveMember] = useState(team[2]!);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Currently viewing
        </p>
        <h2 className="text-2xl font-semibold">{activeMember.name}</h2>
      </div>
      <div className="h-[620px] w-full">
        <OrbitCardStack
          items={team}
          defaultActiveIndex={2}
          spread={150}
          lift={40}
          onActiveChange={(item) => setActiveMember(item)}
        />
      </div>
    </section>
  );
}
