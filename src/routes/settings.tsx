import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { budgetOn } from "@/lib/calc";
import { toISODate } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryIcon";
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
    <div className="px-5 pb-4 pt-8">
      <h1 className="title-large">Settings</h1>

      <p className="label-section mt-8 pl-1 text-mut">Profile</p>
      <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && updateProfile({ name: name.trim() })}
            className="w-full bg-transparent text-right text-[16px] outline-none"
          />
        </Field>
        <Field label="Currency">
          <span className="text-[15px] text-mut">{currency} · Indian rupee</span>
        </Field>
      </div>

      <p className="label-section mt-8 pl-1 text-mut">Appearance</p>
      <div className="mt-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <ThemePicker />
      </div>

      <p className="label-section mt-8 pl-1 text-mut">Budget</p>
      <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <Field label="Weekday (Mon–Fri)">
          <input
            inputMode="decimal"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-28 bg-transparent text-right text-[16px] font-semibold outline-none"
          />
        </Field>
        <Field label="Weekend (Sat–Sun)">
          <input
            inputMode="decimal"
            value={weekend}
            onChange={(e) => setWeekend(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-28 bg-transparent text-right text-[16px] font-semibold outline-none"
          />
        </Field>
        <Field label="Applies from">
          <input
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className="bg-transparent text-right text-[16px] outline-none"
          />
        </Field>
        <button
          onClick={saveBudget}
          className="pressable h-[50px] w-full rounded-full bg-brass text-[17px] font-semibold text-background active:bg-brasshi"
        >
          Save budget
        </button>
        <p className="text-[12px] leading-relaxed text-mut">
          New budgets apply from the chosen date onwards. Past months keep the budgets that were
          active at the time.
        </p>
      </div>

      <p className="label-section mt-8 pl-1 text-mut">Categories</p>
      <div className="mt-3 divide-y divide-hair rounded-2xl bg-card ring-1 ring-hair">
        {data.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <CategoryBadge icon={c.icon} />
            <span className="min-w-0 flex-1 truncate text-[15px]">{c.name}</span>
            <button
              onClick={() => deleteCategory(c.id)}
              aria-label={`Delete ${c.name}`}
              className="grid size-10 shrink-0 place-items-center rounded-full text-mut active:bg-accent active:text-over"
            >
              <Trash2 className="size-[18px]" strokeWidth={1.6} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-mut/70"
          />
          <button
            onClick={() => {
              if (!newCategory.trim()) return;
              addCategory(newCategory.trim());
              setNewCategory("");
            }}
            aria-label="Add category"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brass/15 text-brasshi active:bg-brass/25"
          >
            <Plus className="size-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <p className="label-section mt-8 pl-1 text-mut">Data</p>
      <div className="mt-3 space-y-2 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <button
          onClick={exportData}
          className="pressable h-12 w-full rounded-xl bg-accent text-[15px] font-medium"
        >
          Export data
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="pressable h-12 w-full rounded-xl bg-accent text-[15px] font-medium"
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
            <p className="text-[13px] leading-relaxed text-foreground">
              This permanently deletes your profile, budgets and every transaction on this device.
              Export a backup first.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  resetAll();
                  toast.success("All data cleared");
                }}
                className="h-11 flex-1 rounded-xl bg-over text-[15px] font-semibold text-white"
              >
                Delete everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="h-11 flex-1 rounded-xl bg-card text-[15px] ring-1 ring-hair"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="pressable h-12 w-full rounded-xl text-[15px] font-medium text-over ring-1 ring-over/30 active:bg-over/10"
          >
            Reset all data
          </button>
        )}
      </div>

      <p className="label-section mt-8 pl-1 text-mut">About</p>
      <div className="mt-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
        <p className="text-[15px] font-medium">Spend Tracker · V1</p>
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
      <span className="truncate text-[15px] text-mut">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
