import { CheckboxRootProps } from "@base-ui/react";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldContent, FieldError, FieldLabel } from "../ui/field";
import { Controller, useFormContext } from "react-hook-form";

interface FormCheckboxProps extends CheckboxRootProps {
  name: string;
  label: string;
}

export function FormCheckbox({ label, name, id, ...props }: FormCheckboxProps) {
  const { control } = useFormContext();

  const inputId = id ?? name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field orientation="responsive" data-invalid={fieldState.invalid}>
          <FieldContent className="flex-row! gap-2 items-center">
            <Checkbox
              id={inputId}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref} // or ref={field.ref}, depending on your component
              aria-invalid={fieldState.invalid}
              {...props}
            />
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          </FieldContent>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
