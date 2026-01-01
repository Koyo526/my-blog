// app/[lang]/projects/page.tsx
// プロジェクト一覧ページ

import { setRequestLocale } from 'next-intl/server'
import { locales, type Locale } from '@/lib/i18n'
import { getAllProjects } from '@/lib/projects'
import { Container } from '@/components/common/container'
import { ProjectsList } from '@/components/projects/projects-list'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function ProjectsPage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const projects = await getAllProjects(lang as Locale)

  return (
    <Container className="py-16">
      <ProjectsList projects={projects} />
    </Container>
  )
}
