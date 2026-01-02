// lib/about-data.ts
// About ページの経歴データ

import type { TimelineEntry, Achievement } from '@/types/about'

export const timelineData: TimelineEntry[] = [
  {
    id: 'work-1',
    type: 'work',
    title: {
      ja: 'シニアフロントエンドエンジニア',
      en: 'Senior Frontend Engineer',
    },
    organization: {
      ja: '株式会社サンプル',
      en: 'Sample Inc.',
    },
    period: {
      start: '2023.04',
    },
    description: {
      ja: 'フロントエンドアーキテクチャの設計・実装をリード。React/Next.jsを使用したWebアプリケーション開発。',
      en: 'Leading frontend architecture design and implementation. Web application development using React/Next.js.',
    },
    tags: ['React', 'Next.js', 'TypeScript'],
    isCurrent: true,
  },
  {
    id: 'work-2',
    type: 'work',
    title: {
      ja: 'フロントエンドエンジニア',
      en: 'Frontend Engineer',
    },
    organization: {
      ja: '株式会社テック',
      en: 'Tech Co., Ltd.',
    },
    period: {
      start: '2021.04',
      end: '2023.03',
    },
    description: {
      ja: 'モダンなWebアプリケーションの開発に従事。UIコンポーネントライブラリの構築。',
      en: 'Engaged in modern web application development. Built UI component libraries.',
    },
    tags: ['Vue.js', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'edu-1',
    type: 'education',
    title: {
      ja: '情報工学修士',
      en: 'Master of Information Engineering',
    },
    organization: {
      ja: '東京大学 大学院',
      en: 'The University of Tokyo, Graduate School',
    },
    period: {
      start: '2019.04',
      end: '2021.03',
    },
    description: {
      ja: 'Webテクノロジーとユーザーインターフェースに関する研究。',
      en: 'Research on web technologies and user interfaces.',
    },
  },
  {
    id: 'edu-2',
    type: 'education',
    title: {
      ja: '工学学士',
      en: 'Bachelor of Engineering',
    },
    organization: {
      ja: '東京大学 工学部',
      en: 'The University of Tokyo, Faculty of Engineering',
    },
    period: {
      start: '2015.04',
      end: '2019.03',
    },
    description: {
      ja: '情報工学を専攻。プログラミングとソフトウェア開発の基礎を学ぶ。',
      en: 'Majored in Information Engineering. Learned fundamentals of programming and software development.',
    },
  },
]

export const achievements: Achievement[] = [
  {
    id: 'cert-1',
    type: 'certification',
    name: {
      ja: 'AWS認定 ソリューションアーキテクト',
      en: 'AWS Certified Solutions Architect',
    },
    issuer: {
      ja: 'Amazon Web Services',
      en: 'Amazon Web Services',
    },
    date: '2023.08',
  },
  {
    id: 'cert-2',
    type: 'certification',
    name: {
      ja: 'Google Cloud Professional',
      en: 'Google Cloud Professional',
    },
    issuer: {
      ja: 'Google Cloud',
      en: 'Google Cloud',
    },
    date: '2022.11',
  },
  {
    id: 'award-1',
    type: 'award',
    name: {
      ja: 'ハッカソン優勝',
      en: 'Hackathon Winner',
    },
    issuer: {
      ja: 'TechConf 2022',
      en: 'TechConf 2022',
    },
    date: '2022.09',
  },
]
