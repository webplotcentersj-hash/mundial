import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Admin',
  description: 'Panel de administración Plot Mundial.',
  path: '/admin',
  noIndex: true,
})

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
