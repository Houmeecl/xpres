import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  )
}

Card.displayName = "Card"

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
}

CardHeader.displayName = "CardHeader"

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
}

CardTitle.displayName = "CardTitle"

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props} />
  )
}

CardDescription.displayName = "CardDescription"

export function CardContent({ className, ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />
}

CardContent.displayName = "CardContent"

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  )
}

CardFooter.displayName = "CardFooter"
