'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiPlusCircle, FiSearch, FiTrendingUp, FiFileText, FiBarChart2, FiCalendar, FiFolder } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'complete'
  createdAt: string
  objective: string
  audience: string
  industry: string
  platforms: string[]
  contentBlocks: any[]
  seoAnalysis: any | null
  graphics: any[]
  videoBrief: any | null
}

interface DashboardProps {
  campaigns: Campaign[]
  onNewCampaign: () => void
  onSelectCampaign: (campaign: Campaign) => void
  showSample: boolean
  onToggleSample: (v: boolean) => void
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: 's1', name: 'Q1 Product Launch - Wellness Line', status: 'active', createdAt: '2025-01-15', objective: 'Launch new wellness product line', audience: 'Health-conscious millennials', industry: 'Health & Wellness', platforms: ['Blog', 'Instagram', 'LinkedIn'], contentBlocks: [{ platform: 'Blog', title: 'Sample', body: 'Content...', word_count: 800 }], seoAnalysis: { content_score: 82 }, graphics: [], videoBrief: null },
  { id: 's2', name: 'Brand Awareness - Tech Summit 2025', status: 'complete', createdAt: '2025-01-10', objective: 'Maximize brand visibility at tech summit', audience: 'CTOs and engineering leaders', industry: 'Technology', platforms: ['LinkedIn', 'Twitter', 'Email'], contentBlocks: [{ platform: 'LinkedIn', title: 'Sample', body: 'Content...', word_count: 300 }], seoAnalysis: { content_score: 91 }, graphics: [{ file_url: '' }], videoBrief: { video_title: 'Summit Highlight Reel' } },
  { id: 's3', name: 'Holiday Sale Email Series', status: 'draft', createdAt: '2025-01-20', objective: 'Drive holiday season sales', audience: 'Existing customers aged 25-45', industry: 'E-commerce', platforms: ['Email', 'Instagram', 'Ad'], contentBlocks: [], seoAnalysis: null, graphics: [], videoBrief: null },
  { id: 's4', name: 'Sustainability Report Campaign', status: 'active', createdAt: '2025-01-18', objective: 'Promote annual sustainability report', audience: 'Investors and eco-conscious consumers', industry: 'Finance', platforms: ['Blog', 'LinkedIn', 'Twitter'], contentBlocks: [{ platform: 'Blog', title: 'Sample', body: 'Content...', word_count: 1200 }, { platform: 'LinkedIn', title: 'Sample', body: 'Content...', word_count: 250 }], seoAnalysis: { content_score: 76 }, graphics: [], videoBrief: null },
]

export default function CampaignDashboard({ campaigns, onNewCampaign, onSelectCampaign, showSample, onToggleSample }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const displayCampaigns = showSample ? SAMPLE_CAMPAIGNS : campaigns
  const filtered = displayCampaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCt = displayCampaigns.filter((c) => c.status === 'active').length
  const totalContent = displayCampaigns.reduce((sum, c) => sum + (Array.isArray(c.contentBlocks) ? c.contentBlocks.length : 0), 0)
  const avgSeo = displayCampaigns.filter((c) => c.seoAnalysis?.content_score).length > 0
    ? Math.round(displayCampaigns.filter((c) => c.seoAnalysis?.content_score).reduce((sum, c) => sum + (c.seoAnalysis?.content_score ?? 0), 0) / displayCampaigns.filter((c) => c.seoAnalysis?.content_score).length)
    : 0

  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-[hsl(36,60%,31%)] text-[hsl(35,20%,95%)]'
    if (status === 'complete') return 'bg-emerald-900/60 text-emerald-300'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-wide text-foreground">Campaign Dashboard</h2>
              <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Manage and monitor your marketing campaigns</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="sample-toggle" checked={showSample} onCheckedChange={onToggleSample} />
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground">Sample Data</Label>
              </div>
              <Button onClick={onNewCampaign} className="bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)]">
                <FiPlusCircle className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
                    <p className="text-3xl font-serif font-semibold text-foreground mt-1">{activeCt}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[hsl(36,60%,31%)]/20 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-[hsl(36,60%,50%)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Content Pieces</p>
                    <p className="text-3xl font-serif font-semibold text-foreground mt-1">{totalContent}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[hsl(36,60%,31%)]/20 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-[hsl(36,60%,50%)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg SEO Score</p>
                    <p className="text-3xl font-serif font-semibold text-foreground mt-1">{avgSeo > 0 ? avgSeo : '--'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[hsl(36,60%,31%)]/20 flex items-center justify-center">
                    <FiBarChart2 className="w-5 h-5 text-[hsl(36,60%,50%)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-input border-border" />
            </div>
            <div className="flex gap-1.5">
              {['all', 'draft', 'active', 'complete'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-md text-xs capitalize transition-colors', statusFilter === s ? 'bg-[hsl(36,60%,31%)] text-[hsl(35,20%,95%)]' : 'bg-secondary text-secondary-foreground hover:bg-muted')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="py-16 text-center">
                <FiFolder className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-foreground mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4" style={{ lineHeight: '1.65' }}>Create your first campaign to get started with AI-powered marketing content.</p>
                <Button onClick={onNewCampaign} className="bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)]">
                  <FiPlusCircle className="w-4 h-4 mr-2" />Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((campaign) => (
                <Card key={campaign.id} className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => onSelectCampaign(campaign)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-serif text-base font-medium text-foreground group-hover:text-[hsl(36,60%,50%)] transition-colors pr-2">{campaign.name}</h3>
                      <Badge className={cn('text-[10px] capitalize flex-shrink-0', statusColor(campaign.status))}>{campaign.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3" style={{ lineHeight: '1.65' }}>{campaign.objective}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(campaign.platforms) && campaign.platforms.slice(0, 3).map((p) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{p}</span>
                        ))}
                        {Array.isArray(campaign.platforms) && campaign.platforms.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">+{campaign.platforms.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <FiCalendar className="w-3 h-3" />
                        {campaign.createdAt}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
