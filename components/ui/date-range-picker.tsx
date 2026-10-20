"use client";

import { format } from "date-fns";
import { RiCalendarLine } from "@remixicon/react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export function DateRangePicker({
  value,
  onChange,
  label,
  placeholder = "Pick a date",
  maxDate,
  className,
}: {
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  label?: string;
  placeholder?: string;
  maxDate?: Date;
  className?: string;
}) {
  const [tempValue, setTempValue] = useState<DateRange | undefined>(value);

  const displayTempFrom = tempValue?.from
    ? format(tempValue?.from, "LLL dd, y")
    : "";
  const displayTempTo = tempValue?.to ? format(tempValue?.to, "LLL dd, y") : "";
  const handleApply = () => {
    onChange(tempValue);
  };

  const handleClear = () => {
    setTempValue(undefined);
    onChange(undefined);
  };
  return (
    <Field className={className ?? "w-fit"}>
      {label && <FieldLabel htmlFor="date-picker-range">{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <RiCalendarLine data-icon="inline-start" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </>
                ) : (
                  format(value.from, "LLL dd, y")
                )
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={tempValue}
            onSelect={setTempValue}
            numberOfMonths={2}
          />
          <section className="flex items-center justify-between pb-4 px-4">
            <p>
              {displayTempFrom}
              {displayTempTo && ` - ${displayTempTo}`}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </section>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
