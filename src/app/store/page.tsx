import { redirect } from 'next/navigation'

/** @deprecated Usar /store/combo — redirección automática */
export default function StorePage() {
  redirect('/store/combo')
}
