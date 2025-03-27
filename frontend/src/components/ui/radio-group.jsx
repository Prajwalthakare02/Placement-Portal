import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      role="radiogroup"
      {...props}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label className="flex items-center gap-2">
      <input
        ref={ref}
        type="radio"
        className={cn(
          "h-4 w-4 rounded-full border-primary text-primary focus:ring-primary",
          className
        )}
        {...props}
      />
      {children}
    </label>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
