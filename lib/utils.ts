import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//twMerge('bg-red-500 bg-blue-500')
// Resolves to 'bg-blue-500'

//clsx('text-center', { 'bg-red-500': isError })
// Produces 'text-center bg-red-500' if isError is true, or 'text-center' if false

//cn('text-center', { 'bg-red-500': isError }, 'p-4', 'bg-blue-500')
// If isError is true: Resolves to 'text-center bg-blue-500 p-4'
// (bg-red-500 is overridden by bg-blue-500)

//Before cn
//className={`text-center ${isError ? 'bg-red-500' : ''} ${isPrimary ? 'text-white' : 'text-gray-700'}`}

//After cn
//className={cn('text-center', { 'bg-red-500': isError, 'text-white': isPrimary, 'text-gray-700': !isPrimary })}
