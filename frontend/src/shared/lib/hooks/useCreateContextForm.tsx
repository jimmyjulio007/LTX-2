"use client";

import { createContext, useContext } from "react";
import {
  useForm,
  type UseFormReturn,
  type DefaultValues,
  type FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

export function createFormContext<T extends FieldValues>(schema: ZodType<T>) {

  const Context = createContext<UseFormReturn<T> | null>(null);

  function FormProvider({
    value,
    children,
  }: {
    value: UseFormReturn<T>;
    children: React.ReactNode;
  }) {
    return <Context value={value}>{children}</Context>;
  }

  function useFormContext(): UseFormReturn<T> {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error("useFormContext must be used within a FormProvider");
    }
    return ctx;
  }

  function useCreateForm(options?: { defaultValues?: DefaultValues<T> }) {
    return useForm<T>({
      resolver: zodResolver(schema as never),
      defaultValues: options?.defaultValues,
    });
  }

  return { FormProvider, useFormContext, useCreateForm };
}
