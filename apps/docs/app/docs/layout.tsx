import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'

import type { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => (
  <DocsLayout 
    tree={source.pageTree}
    {...baseOptions}
  >
    {children}
  </DocsLayout>
)

export default Layout