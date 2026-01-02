// lib/about-data.ts
// About ページの経歴データ

import type { TimelineEntry, Achievement } from '@/types/about'

export const timelineData: TimelineEntry[] = [
  {
    id: 'work-1',
    type: 'work',
    title: {
      ja: 'バックエンドエンジニア',
      en: 'Backend Engineer',
    },
    organization: {
      ja: '株式会社ZOZO',
      en: 'ZOZO, Inc.',
    },
    period: {
      start: '2025.04',
    },
    description: {
      ja: '基幹システムのリプレイスに従事。マイクロサービスアーキテクチャの設計と実装。',
      en: 'Engaged in the replacement of core systems. Designed and implemented microservices architecture.',
    },
    tags: ['Java', 'Spring', 'AWS', 'Kubernetes'],
    isCurrent: true,
  },
  {
    id: 'edu-1',
    type: 'education',
    title: {
      ja: '情報科学修士',
      en: 'Master of Information Science',
    },
    organization: {
      ja: '東北大学 大学院 情報科学研究科',
      en: 'Tohoku University, Graduate School of Information Sciences',
    },
    period: {
      start: '2023.04',
      end: '2025.03',
    },
    description: {
      ja: 'モデル更新の貢献度に応じて報酬配分を行うブロックチェーンを活用した分散型連合学習',
      en: 'Decentralized Federated Learning using Blockchain with Token Allocation Based on Contribution of Model Updates',
    },
    tags: ['Machine Learning', 'Federated Learning', 'Blockchain', 'Decentralized Systems'],
  },
  {
    id: 'edu-2',
    type: 'education',
    title: {
      ja: '工学学士',
      en: 'Bachelor of Engineering',
    },
    organization: {
      ja: '秋田県立大学 システム科学技術学部',
      en: 'Akita Prefectural University, Faculty of Systems Science and Technology',
    },
    period: {
      start: '2019.04',
      end: '2023.03',
    },
    description: {
      ja: '暗号通貨システムのオフチェーンプロトコルを用いた高速化に関する検討',
      en: 'Research on acceleration using off-chain protocols for cryptocurrency systems.',
    },
    tags: ['Cryptocurrency', 'Off-chain Protocols', 'Distributed Systems'],
  },
]

export const achievements: Achievement[] = [
  {
    id: 'cert-1',
    type: 'certification',
    name: {
      ja: 'Java Silver SE 17',
      en: 'Java Silver SE 17',
    },
    issuer: {
      ja: 'Oracle',
      en: 'Oracle',
    },
    date: '2025.11',
    url: 'https://catalog-education.oracle.com/ords/certview/sharebadge?id=1139785E039572AD86BE1978B636FE907E5A8E8DEBEF7A3637BC64E1356F67DA',
  },
  {
    id: 'cert-2',
    type: 'certification',
    name: {
      ja: 'AWS Certified AI Practitioner',
      en: 'AWS Certified AI Practitioner',
    },
    issuer: {
      ja: 'Amazon Web Services',
      en: 'Amazon Web Services',
    },
    date: '2025.10',
    url: 'https://www.credly.com/badges/87dad09c-c9d3-4f05-95c7-b247457b6f80',
  },
  {
    id: 'cert-3',
    type: 'certification',
    name: {
      ja: 'AWS Certified Cloud Practitioner',
      en: 'AWS Certified Cloud Practitioner',
    },
    issuer: {
      ja: 'Amazon Web Services',
      en: 'Amazon Web Services',
    },
    date: '2024.07',
    url: 'https://www.credly.com/badges/f89a3408-51b2-4bd7-9ccf-1f7a88a31a25',
  },
]
