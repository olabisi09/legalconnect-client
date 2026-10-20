// build reusable FormInput component with label, error message, and input field using React Hook Form and the existing Input component in ./ui/input.tsx.

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useFormContext, type FieldError } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

export function FormInput({ label, name, id, ...props }: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const fieldError = (errors as Record<string, FieldError | undefined>)[name];
  const inputId = id ?? name;

  return (
    <div className="space-y-1">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} {...register(name)} {...props} />
      {fieldError?.message && (
        <p className="text-xs font-medium text-destructive">
          {String(fieldError.message)}
        </p>
      )}
    </div>
  );
}
