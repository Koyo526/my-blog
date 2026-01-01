// components/projects/projects-list.tsx
// プロジェクト一覧コンポーネント（アニメーション付き）

'use client'

import { useTranslations } from 'next-intl'
import { ProjectCard } from './project-card'
import {
  SlideUp,
  StaggerContainerWhenVisible,
  StaggerItem,
} from '@/components/motion'
import type { Project } from '@/types/content'

type ProjectsListProps = {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const t = useTranslations('projects')

  return (
    <div className="space-y-8">
      {/* Header */}
      <SlideUp>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-foreground-muted">{t('description')}</p>
        </div>
      </SlideUp>

      {/* Projects Grid */}
      {projects.length > 0 ? (
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
      ) : (
        <p className="text-foreground-muted">No projects found.</p>
      )}
    </div>
  )
}
