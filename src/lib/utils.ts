import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.log('[handleError] The error is an instance of Error and its content is: ', error.message)
    return { errorMessage: error.message }
  }
  else {
    console.log('[handleError] The error is NOT an instance of Error')
    return { errorMessage: "An error occured" }
  }
}

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL)
    return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}