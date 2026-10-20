// build reusable FormTextarea component with label, error message, and textarea field using React Hook Form and the existing Textarea component in ./ui/textarea.tsx.

import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useFormContext, type FieldError } from "react-hook-form";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
}

export function FormTextarea({ label, name, id, ...props }: FormTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const fieldError = (errors as Record<string, FieldError | undefined>)[name];
  const textareaId = id ?? name;

  return (
    <div className="space-y-1">
      <Label htmlFor={textareaId}>{label}</Label>
      <Textarea id={textareaId} {...register(name)} {...props} />
      {fieldError?.message && (
        <p className="text-xs font-medium text-destructive">
          {String(fieldError.message)}
        </p>
      )}
    </div>
  );
}
