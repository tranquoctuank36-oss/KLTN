"use client";
import React from "react";

export type FloatingInputProps = {
  id: string;
  label: string;
  as?: "input" | "select" | "textarea";
  type?: React.HTMLInputTypeAttribute; 
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  maxLength?: number;

  min?: number;
  max?: number;
  step?: number;
};

export default function FloatingInput({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  rightIcon,
  disabled = false,
  placeholder,
  as = "input",
  options = [],
  rows = 4,
  maxLength,
  min,
  max,
  step,
}: FloatingInputProps) {
  const [touched, setTouched] = React.useState(false);
  const showError = required && touched && !value;

  const baseClassCommon =
    "peer w-full rounded-md border bg-white text-[16px] text-gray-800 focus:border-2 focus:border-blue-400 focus:outline-none transition" +
    (disabled
      ? "!bg-gray-200 !text-gray-500 cursor-not-allowed"
      : "bg-white text-gray-800") +
    (showError ? " border-red-500 bg-red-50" : " border-gray-300");

  const inputSelectClass = `${baseClassCommon} h-12 px-3 pt-5 pb-2 ${
    rightIcon ? "pr-14" : ""
  }`;
  const textareaClass = `${baseClassCommon} px-3 pt-6 pb-3 min-h-[104px] resize-y ${
    rightIcon ? "pr-14" : ""
  }`;

  return (
    <div className="w-full">
      <div className="relative group w-full">
        {as === "input" && (
          <input
            id={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={inputSelectClass}
            maxLength={maxLength}
            // chỉ áp dụng cho number
            {...(type === "number"
              ? { min, max, step, inputMode: "numeric", pattern: "[0-9]*" }
              : {})}
          />
        )}

        {as === "select" && (
          <select
            id={id}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            className={`${inputSelectClass} hover:cursor-pointer pl-2`}
          >
            <option value="" disabled hidden />
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {as === "textarea" && (
          <textarea
            id={id}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={textareaClass}
          />
        )}

        <label
          htmlFor={id}
          className={`absolute left-3 transition-all pointer-events-none
            ${
              value
                ? "top-1 text-xs text-gray-500"
                : as === "textarea"
                ? "top-3 text-[15px] text-gray-500"
                : "top-1/2 -translate-y-1/2 text-[15px] text-gray-500"
            }
            peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-gray-500`}
        >
          {label} {required && <span className="text-red-500 ml-[1px]">*</span>}
        </label>

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>

      {showError && (
        <p className="text-xs text-red-500 mt-1">Please enter your details</p>
      )}
    </div>
  );
}
