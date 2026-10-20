import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiCheckLine,
  RiFilter3Line,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

export type FilterOption = { value: string; label: string };

type FilterFieldBase = {
  key: string;
  label: string;
};

export type SelectFilterField = FilterFieldBase & {
  type: "select";
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
};

export type MultiSelectFilterField = FilterFieldBase & {
  type: "multi-select";
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

export type TextFilterField = FilterFieldBase & {
  type: "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export type BooleanFilterField = FilterFieldBase & {
  type: "boolean";
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  trueLabel?: string;
  falseLabel?: string;
};

export type FilterField =
  | SelectFilterField
  | MultiSelectFilterField
  | TextFilterField
  | BooleanFilterField;

function isFieldActive(field: FilterField): boolean {
  switch (field.type) {
    case "text":
      return field.value.trim().length > 0;
    case "select":
      return field.value.trim().length > 0;
    case "multi-select":
      return field.value.length > 0;
    case "boolean":
      return field.value !== undefined;
  }
}

function clearField(field: FilterField) {
  switch (field.type) {
    case "text":
    case "select":
      field.onChange("");
      break;
    case "multi-select":
      field.onChange([]);
      break;
    case "boolean":
      field.onChange(undefined);
      break;
  }
}

const SEARCHABLE_THRESHOLD = 8;

export function Filters({ fields }: { fields: FilterField[] }) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(fields[0]?.key);

  const activeField =
    fields.find((field) => field.key === activeKey) ?? fields[0];
  const activeCount = fields.filter(isFieldActive).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="gap-1.5"
        render={<Button variant="outline" size="sm" />}
      >
        <RiFilter3Line className="size-4" />
        Filters
        {activeCount > 0 ? (
          <span className="ml-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-110 p-0">
        <div className="flex" style={{ minHeight: 260 }}>
          <div className="w-37.5 shrink-0 border-r border-border p-1.5">
            {fields.map((field) => {
              const active = isFieldActive(field);
              return (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => setActiveKey(field.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[3px] px-2.5 py-2 text-left text-[13px]",
                    activeKey === field.key
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <span>{field.label}</span>
                  {active ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-3">
            {activeField ? <FieldPanel field={activeField} /> : null}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <button
            type="button"
            onClick={() => fields.forEach(clearField)}
            disabled={activeCount === 0}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
          >
            Clear all
          </button>
          <span className="font-plexmono text-[10.5px] text-muted-foreground">
            {activeCount} active
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FieldPanel({ field }: { field: FilterField }) {
  const [optionSearch, setOptionSearch] = useState("");

  if (field.type === "text") {
    return (
      <Input
        autoFocus
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        placeholder={field.placeholder ?? `Search ${field.label.toLowerCase()}`}
      />
    );
  }

  if (field.type === "boolean") {
    const options: { value: boolean | undefined; label: string }[] = [
      { value: undefined, label: "Any" },
      { value: true, label: field.trueLabel ?? "Yes" },
      { value: false, label: field.falseLabel ?? "No" },
    ];
    return (
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => {
          const selected = field.value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => field.onChange(opt.value)}
              className={cn(
                "flex items-center justify-between rounded-[3px] px-2.5 py-2 text-left text-[13px]",
                selected
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground hover:bg-accent/50",
              )}
            >
              {opt.label}
              {selected ? <RiCheckLine className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  // select / multi-select share the option-list UI
  const options = field.options.filter((opt) =>
    opt.label.toLowerCase().includes(optionSearch.toLowerCase()),
  );
  const showSearch = field.options.length > SEARCHABLE_THRESHOLD;

  return (
    <div className="flex flex-col gap-2">
      {showSearch ? (
        <Input
          autoFocus
          value={optionSearch}
          onChange={(e) => setOptionSearch(e.target.value)}
          placeholder={`Search ${field.label.toLowerCase()}…`}
          className="h-8"
        />
      ) : null}

      <div className="max-h-64 overflow-y-auto">
        {options.length === 0 ? (
          <p className="px-2.5 py-2 text-[12.5px] text-muted-foreground">
            No matches.
          </p>
        ) : field.type === "select" ? (
          options.map((opt) => {
            const selected = field.value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => field.onChange(selected ? "" : opt.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[3px] px-2.5 py-2 text-left text-[13px]",
                  selected
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-accent/50",
                )}
              >
                {opt.label}
                {selected ? <RiCheckLine className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })
        ) : (
          options.map((opt) => {
            const selected = field.value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  field.onChange(
                    selected
                      ? field.value.filter((v) => v !== opt.value)
                      : [...field.value, opt.value],
                  )
                }
                className={cn(
                  "flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-[13px]",
                  selected
                    ? "text-foreground"
                    : "text-foreground hover:bg-accent/50",
                )}
              >
                {selected ? (
                  <RiCheckboxLine className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <RiCheckboxBlankLine className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {opt.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
