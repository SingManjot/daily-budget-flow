import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { budgetOn } from "@/lib/calc";
import { toISODate } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { AppData } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Spend Tracker" },
      {
        name: "description",
        content:
          "Update your name, weekday and weekend budgets, categories, and export or reset your locally stored data.",
      },
      { property: "og:title", content: "Settings — Spend Tracker" },
      {
        property: "og:description",
        content: "Profile, budgets, categories and local data backup.",
      },
    ],
  }),
  component: Settings;
});

function Settings() {
  return null;
}
