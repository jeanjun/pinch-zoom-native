import { cn } from '@/lib/cn'

import type { HTMLAttributes } from 'react'

export const Wrapper = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={cn(
      'rounded-lg bg-black/20 p-4 border',
      props.className
    )}
  >
    {props.children}
  </div>
)