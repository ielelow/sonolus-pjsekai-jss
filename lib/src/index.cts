import { DatabaseEngineItem } from '@sonolus/core'

export { susToUSC } from './sus/convert.cjs'
export { uscToLevelData } from './usc/convert.cjs'
export * from './usc/index.cjs'

export const version = '1.0.0'

export const databaseEngineItem = {
    name: 'prosekaR',
    version: 13,
    title: {
        en: 'ProSeka R',
        ja: 'プロセカ R',
        ko: '프로세카 R',
        zhs: '世界计划 R',
        zht: '世界計劃 R',
    },
    subtitle: {
        en: 'ProSekai Rush',
        ja: 'プロセカ ラッシュ',
        ko: '프로세카 러쉬',
        zhs: '世界计划 匆忙',
        zht: '世界計劃 匆忙',
    },
    author: {
        en: 'Burrito#1000, Hyeon2#7895',
    },
    description: {
        en: [
            'A recreation of Project Sekai: Colorful Stage! engine in Sonolus.',
            `Version: ${version}`,
            '',
            'Forked from the pjsekai engine by Burrito#1000.',
            'https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine',
            '',
            'Github:',
            'https://github.com/hyeon2006/sonolus-pjsekai-js'
        ].join('\n'),
        ko: [   
            '프로젝트 세카이: 컬러풀 스테이지! 엔진을 Sonolus로 재현했습니다.',
            `버전: ${version}`,
            '',
            'Burrito#1000의 pjsekai 엔진에서 포크되었습니다.',
            'https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine',
            '',
            '깃허브:',
            'https://github.com/hyeon2006/sonolus-pjsekai-js'
        ].join('\n'),
    },
} as const satisfies Partial<DatabaseEngineItem>
