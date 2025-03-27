import * as React from "react"
import { cn } from "@/lib/utils"

const Carousel = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex", className)}
      {...props}
    />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 flex-none", className)}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn("absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md", className)}
      {...props}
    >
      <span aria-hidden>←</span>
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn("absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md", className)}
      {...props}
    >
      <span aria-hidden>→</span>
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
