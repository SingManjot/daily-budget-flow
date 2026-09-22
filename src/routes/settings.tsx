import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { budgetOn } from "@/lib/calc";
import { toISODate } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ThemePicker } from "@/components/ThemePicker";
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
  component: Settings,
});

function Settings() {
  const {
    data,
    currency,
    updateProfile,
    setBudgets,
    addCategory,
    deleteCategory,
    replaceAll,
    resetAll,
  } = useStore();
  const today = toISODate(new Date());
  const active = budgetOn(data.budgets, today);

  const [name, setName] = useState(data.user?.name ?? "");
  const [weekday, setWeekday] = useState(String(active?.weekdayBudget ?? ""));
  const [weekend, setWeekend] = useState(String(active?.weekendBudget ?? ""));
  const [effectiveFrom, setEffectiveFrom] = useState(today.slice(0, 8) + "01");
  const [newCategory, setNewCategory] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(data.user?.name ?? "");
  }, [data.user?.name]);

  const saveBudget = () => {
    const wd = Number(weekday);
    const we = Number(weekend);
    if (!wd || !we) {
      toast.error("Enter both budgets");
      return;
    }
    setBudgets({ weekdayBudget: wd, weekendBudget: we, effectiveFrom });
    toast.success("Budgets updated for future periods");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-tracker-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (!parsed || typeof parsed !== "object" || !("expenses" in parsed)) {
        throw new Error("bad file");
      }
      replaceAll(parsed);
      toast.success("Data restored");
    } catch {
      toast.error("That file couldn't be read");
    }
  };

  return (
    <div className="px-6 pb-4 pt-8">
      <h1 className="text-[22px] font-medium">Settings</h1>

      <p className="label-mono mt-7 text-mut">Profile</p>
      <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && updateProfile({ name: name.trim() })}
            className="w-full bg-transparent text-right text-[14px] outline-none"
          />
        </Field>
        <Field label="Currency">
          <span className="text-[14px] text-mut">{currency} · Indian rupee</span>
        </Field>
      </div>

      <p className="label-mono mt-7 text-mut">Appearance</p>
      <div className="mt-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <ThemePicker />
      </div>

      <p className="label-mono mt-7 text-mut">Budget</p>
      <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <Field label="Weekday (Mon–Fri)">
          <input
            inputMode="decimal"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-24 bg-transparent text-right font-mono text-[14px] outline-none"
          />
        </Field>
        <Field label="Weekend (Sat–Sun)">
          <input
            inputMode="decimal"
            value={weekend}
            onChange={(e) => setWeekend(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-24 bg-transparent text-right font-mono text-[14px] outline-none"
          />
        </Field>
        <Field label="Applies from">
          <input
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className="bg-transparent text-right text-[13px] outline-none"
          />
        </Field>
        <button
          onClick={saveBudget}
          className="h-11 w-full rounded-xl bg-brass text-[13px] font-semibold text-background transition active:bg-brasshi"
        >
          Save budget
        </button>
        <p className="text-[11px] leading-relaxed text-mut">
          New budgets apply from the chosen date onwards. Past months keep the budgets that were
          active at the time.
        </p>
      </div>

      <p className="label-mono mt-7 text-mut">Categories</p>
      <div className="mt-3 divide-y divide-hair rounded-2xl bg-card ring-1 ring-hair">
        {data.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <CategoryIcon icon={c.icon} className="size-4 shrink-0 text-mut" />
            <span className="min-w-0 flex-1 truncate text-[14px]">{c.name}</span>
            <button
              onClick={() => deleteCategory(c.id)}
              aria-label={`Delete ${c.name}`}
              className="shrink-0 p-1 text-mut active:text-over"
            >
              <Trash2 className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-mut/70"
          />
          <button
            onClick={() => {
              if (!newCategory.trim()) return;
              addCategory(newCategory.trim());
              setNewCategory("");
            }}
            aria-label="Add category"
            className="shrink-0 rounded-lg bg-accent p-1.5 text-brasshi"
          >
            <Plus className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p className="label-mono mt-7 text-mut">Data</p>
      <div className="mt-3 space-y-2 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <button
          onClick={exportData}
          className="h-11 w-full rounded-xl bg-accent text-[13px] font-medium transition active:opacity-80"
        >
          Export data
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="h-11 w-full rounded-xl bg-accent text-[13px] font-medium transition active:opacity-80"
        >
          Import data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = "";
          }}
        />
        {confirmReset ? (
          <div className="rounded-xl bg-over/10 p-3 ring-1 ring-over/30">
            <p className="text-[12px] text-foreground">
              This permanently deletes your profile, budgets and every transaction on this device.
              Export a backup first.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  resetAll();
                  toast.success("All data cleared");
                }}
                className="h-10 flex-1 rounded-lg bg-over text-[13px] font-medium text-foreground"
              >
                Delete everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="h-10 flex-1 rounded-lg bg-card text-[13px] ring-1 ring-hair"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="h-11 w-full rounded-xl text-[13px] font-medium text-over ring-1 ring-over/30 transition active:bg-over/10"
          >
            Reset all data
          </button>
        )}
      </div>

      <p className="label-mono mt-7 text-mut">About</p>
      <div className="mt-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <p className="text-[13px]">Spend Tracker · V1</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-mut">
          Everything lives on this device. Weekday and weekend budgets are tracked separately and
          never roll over. Current plan: {formatMoney(active?.weekdayBudget ?? 0, currency)} weekday
          · {formatMoney(active?.weekendBudget ?? 0, currency)} weekend.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <span className="truncate text-[13px] text-mut">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
