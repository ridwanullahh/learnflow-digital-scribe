
import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  min: number
  step: number
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max, min, step, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange([Number(e.target.value)])
    }

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full slider-thumb:bg-primary slider-thumb:cursor-pointer slider-thumb:border-0 slider-thumb:shadow-md hover:slider-thumb:shadow-lg",
          "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((value[0] - min) / (max - min)) * 100}%, hsl(var(--secondary)) ${((value[0] - min) / (max - min)) * 100}%, hsl(var(--secondary)) 100%)`
        }}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
