"use client"

import React from "react"
import { useEffect, ReactNode } from "react"

type FloatingInputProps = {
  id: string
  label: string
  type?: "text" | "email" | "password" | "select"
  required?: boolean
  options?: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  forceValidate?: boolean
  rightIcon?: ReactNode
}

export default function FloatingInput({
  id,
  label,
  type = "text",
  required,
  options,
  value,
  onChange,
  forceValidate = false,
  rightIcon,
}: FloatingInputProps) {
  const isSelect = type === "select"

  const [touched, setTouched] = React.useState(false)

  // nếu forceValidate → đánh dấu đã touched
  useEffect(() => {
    if (forceValidate) setTouched(true)
  }, [forceValidate])

  const showError = required && touched && !value

  return (
    <div className="w-full">
      <div className="relative group w-full">
        {isSelect ? (
          <select
            id={id}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`peer w-full h-12 rounded-md border bg-white
              px-3 pt-4 text-[16px] text-gray-600 shadow-sm
              focus:border-2 focus:border-blue-400 focus:outline-none focus:text-gray-800 transition
              group-hover:border-gray-500
              ${showError ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          >
            <option value="" disabled hidden></option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder=" "
            className={`peer w-full h-12 rounded-md border bg-white
              px-3 pr-12 pt-4 text-[16px] text-gray-600
              focus:border-2 focus:border-blue-400 focus:outline-none focus:text-gray-800 transition
              group-hover:border-gray-500
              ${showError ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          />
        )}

        <label
          htmlFor={id}
          className={`absolute left-3 transition-all pointer-events-none
            ${value
              ? "top-1 text-xs text-gray-500"
              : "top-1/2 -translate-y-1/2 text-[15px] text-gray-500"}
            peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-gray-500`}
        >
          {label}
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
  )
}
