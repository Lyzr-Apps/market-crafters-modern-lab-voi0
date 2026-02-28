'use client'

import { FiGrid, FiPlusCircle, FiFolder, FiSettings, FiTarget } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export type Screen = 'dashboard' | 'builder' | 'review' | 'settings'

interface SidebarProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
  activeAgentId: string | null
}

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiGrid className="w-4 h-4" /> },
  { id: 'builder', label: 'New Campaign', icon: <FiPlusCircle className="w-4 h-4" /> },
  { id: 'review', label: 'Campaign Library', icon: <FiFolder className="w-4 h-4" /> },
  { id: 'settings', label: 'Brand Settings', icon: <FiSettings className="w-4 h-4" /> },
]

const AGENTS = [
  { id: '69a2883be72641e0c6070afe', name: 'Campaign Orchestrator', role: 'Coordinates content & SEO' },
  { id: '69a28814d6fa89687c20afcd', name: 'Content Writer', role: 'Creates platform content' },
  { id: '69a2881563d7518fcdafa1de', name: 'SEO Analyst', role: 'Keyword & SEO analysis' },
  { id: '69a2883b00b22915dd81e1aa', name: 'Graphic Designer', role: 'Visual asset generation' },
  { id: '69a2883bd6fa89687c20afcf', name: 'Video Brief', role: 'Video production briefs' },
]

export default function Sidebar({ activeScreen, onNavigate, activeAgentId }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-[hsl(20,18%,12%)] bg-[hsl(20,28%,6%)]">
      <div className="px-5 py-6 border-b border-[hsl(20,18%,12%)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(36,60%,31%)] flex items-center justify-center">
            <FiTarget className="w-4 h-4 text-[hsl(35,20%,95%)]" />
          </div>
          <div>
            <h1 className="font-serif text-sm font-semibold tracking-wide text-foreground">Marketing</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Command Center</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
              activeScreen === item.id
                ? 'bg-[hsl(20,18%,12%)] text-[hsl(36,60%,50%)] font-medium'
                : 'text-[hsl(35,20%,90%)] hover:bg-[hsl(20,18%,12%)] hover:text-[hsl(36,60%,50%)]'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Agents</p>
          <div className="space-y-1.5">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  activeAgentId === agent.id ? 'bg-[hsl(36,60%,50%)] animate-pulse' : 'bg-muted-foreground/40'
                )} />
                <span className="text-[11px] text-muted-foreground truncate">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
