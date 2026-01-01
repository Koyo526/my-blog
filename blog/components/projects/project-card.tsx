// components/projects/project-card.tsx
// プロジェクトカード

import Link from 'next/link'
import type { Project } from '@/types/content'

type Props = {
  project: Project
}

export function ProjectCard({ project }: Props) {
  const { slug, locale, frontmatter } = project

  return (
    <article className="group">
      <Link
        href={`/${locale}/projects/${slug}/`}
        className="block p-6 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-hover transition-all focus-ring"
      >
        <div className="space-y-3">
          {/* Name */}
          <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
            {frontmatter.name}
          </h3>

          {/* Summary */}
          <p className="text-foreground-muted line-clamp-2">
            {frontmatter.summary}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {frontmatter.tech.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded-full bg-background-secondary text-foreground-muted"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 pt-2">
            {frontmatter.github && (
              <span className="text-sm text-foreground-muted">GitHub</span>
            )}
            {frontmatter.url && (
              <span className="text-sm text-foreground-muted">Demo</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
