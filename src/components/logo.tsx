
import * as React from "react"
import { cn } from "@/lib/utils"

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-primary", className)}
        {...props}
    >
        <title>Argus Vision Logo</title>
        <path 
            d="M20,10 C27.5,10 33,20 33,20 C33,20 27.5,30 20,30 C12.5,30 7,20 7,20 C7,20 12.5,10 20,10 Z" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
            opacity="0.7"
        />
        <circle 
            cx="20" 
            cy="20" 
            r="5" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fill="currentColor"
            fillOpacity="0.3"
        />
        <circle
             cx="20" 
             cy="20" 
             r="1.5" 
             fill="currentColor"
        />
    </svg>
  )
}
