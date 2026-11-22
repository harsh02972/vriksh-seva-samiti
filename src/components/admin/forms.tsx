"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/admin/forms";
import { Trash } from "../icons";
import { cn } from "../ui";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const ErrorsContext = createContext<Record<string, string>>({});

export const inputClass =
  "w-full min-h-[48px] rounded-xl border-2 border-line bg-white px-3.5 py-2.5 text-[17px] text-ink outline-none transition-colors placeholder:text-[#8a978c] focus:border-brand aria-[invalid=true]:border-[#C0392B]";

/**
 * A form wired to a Server Action. Shows a green/red message after saving and the
 * error under each field. `resetOnSuccess` clears the fields after a successful save (for "add" forms).
 */
export function AdminForm({
  action,
  children,
  submitLabel = "जतन करा · Save",
  resetOnSuccess = false,
  className,
  footer,
}: {
  action: Action;
  children: ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
  footer?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
    if (state.message) messageRef.current?.focus();
  }, [state, resetOnSuccess]);

  return (
    <ErrorsContext value={state.errors ?? {}}>
      <form ref={formRef} action={formAction} className={cn("flex flex-col gap-5", className)} noValidate>
        {children}
        <div
          ref={messageRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-xl px-4 py-3 font-semibold outline-none empty:hidden",
            state.ok ? "bg-mint text-brand" : "bg-[#FBEAE5] text-[#7A2E1C]",
          )}
        >
          {state.message}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>{submitLabel}</SubmitButton>
          {footer}
        </div>
      </form>
    </ErrorsContext>
  );
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-brand px-6 text-[17px] font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      {pending ? "जतन होत आहे… · Saving…" : children}
    </button>
  );
}

export function Field({
  name,
  label,
  hint,
  children,
  className,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}) {
  const errors = useContext(ErrorsContext);
  const id = useId();
  const error = errors[name];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-semibold text-forest-900">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 text-sm font-semibold text-[#A4301F]">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { name: string; label: ReactNode; hint?: ReactNode; className?: string; required?: boolean };

export function TextInput({
  defaultValue,
  type = "text",
  placeholder,
  lang,
  inputMode,
  autoComplete,
  ...field
}: Common & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "url" | "tel" | "date" | "number" | "password";
  placeholder?: string;
  lang?: string;
  inputMode?: "numeric" | "decimal" | "tel" | "email" | "url" | "text";
  autoComplete?: string;
}) {
  return (
    <Field {...field}>
      {(p) => (
        <input
          {...p}
          name={field.name}
          type={type}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={field.required}
          lang={lang}
          inputMode={inputMode ?? (type === "number" ? "numeric" : undefined)}
          autoComplete={autoComplete ?? "off"}
          step={type === "number" ? "any" : undefined}
          className={inputClass}
        />
      )}
    </Field>
  );
}

export function TextArea({
  defaultValue,
  rows = 4,
  lang,
  placeholder,
  ...field
}: Common & { defaultValue?: string | null; rows?: number; lang?: string; placeholder?: string }) {
  return (
    <Field {...field}>
      {(p) => (
        <textarea
          {...p}
          name={field.name}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          lang={lang}
          placeholder={placeholder}
          className={cn(inputClass, "leading-relaxed")}
        />
      )}
    </Field>
  );
}

export function SelectInput({
  defaultValue,
  options,
  ...field
}: Common & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <Field {...field}>
      {(p) => (
        <select {...p} name={field.name} defaultValue={defaultValue ?? options[0]?.value} className={cn(inputClass, "pr-8")}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-line bg-white p-3.5">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-6 w-6 shrink-0 accent-brand" />
      <label htmlFor={id} className="flex flex-col">
        <span className="font-semibold text-forest-900">{label}</span>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </label>
    </div>
  );
}

/** A small form with one button that runs a Server Action after the user confirms. */
export function ConfirmButton({
  action,
  confirmText,
  children,
  variant = "danger",
  hidden,
}: {
  action: (formData: FormData) => Promise<void>;
  confirmText?: string;
  children?: ReactNode;
  variant?: "danger" | "plain";
  hidden?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <PendingButton variant={variant}>
        {children ?? (
          <>
            <Trash size={18} /> हटवा · Delete
          </>
        )}
      </PendingButton>
    </form>
  );
}

function PendingButton({ children, variant }: { children: ReactNode; variant: "danger" | "plain" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors disabled:opacity-60",
        variant === "danger"
          ? "border-[#E8B4A8] bg-white text-[#A4301F] hover:bg-[#FBEAE5]"
          : "border-line bg-white text-ink hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}
