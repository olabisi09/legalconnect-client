import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldContent, FieldError, FieldLabel } from "../ui/field";
import { SelectRootProps } from "@base-ui/react";

export function FormSelect({
  name,
  label,
  options,
  placeholder,
  ...rest
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: { label: string; value: string }[];
} & SelectRootProps<string, false>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field orientation="responsive" data-invalid={fieldState.invalid}>
          <FieldContent>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
          </FieldContent>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            {...rest}
          >
            <SelectTrigger
              id={name}
              aria-invalid={fieldState.invalid}
              className="min-w-30"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
