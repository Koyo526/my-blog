// components/home/featured-projects.tsx
// 注目プロジェクトセクション

'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n'
import { ProjectCard } from '@/components/projects/project-card'
import {
  SlideUpWhenVisible,
  StaggerContainerWhenVisible,
  StaggerItem,
} from '@/components/motion'
import type { Project } from '@/types/content'

type FeaturedProjectsProps = {
  projects: Project[]
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const t = useTranslations('home')

  if (projects.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <SlideUpWhenVisible>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            {t('featuredProjects.title')}
          </h2>
          <Link
            href="/projects"
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            {t('featuredProjects.viewAll')} →
          </Link>
        </div>
      </SlideUpWhenVisible>

      <StaggerContainerWhenVisible
        staggerDelay={0.1}
        className="grid gap-6 md:grid-cols-2"
      >
        {projects.map((project) => (
          <StaggerItem key={project.slug}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </StaggerContainerWhenVisible>
    </section>
  )
}
