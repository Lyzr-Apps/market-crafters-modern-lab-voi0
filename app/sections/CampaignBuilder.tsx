'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiX, FiPlus, FiSend } from 'react-icons/fi'
import { cn } from '@/lib/utils'

interface BrandSettings {
  brandName: string
  tagline: string
  voiceTone: string
  industry: string
  colorNotes: string
}

interface BuilderProps {
  onGenerate: (formData: CampaignFormData) => void
  isGenerating: boolean
  brandSettings: BrandSettings
}

export interface CampaignFormData {
  objective: string
  audience: string
  industry: string
  brandVoice: string
  platforms: string[]
  keywords: string[]
  competitorUrls: string
}

const PLATFORM_OPTIONS = ['Blog', 'Instagram', 'LinkedIn', 'Twitter', 'Email', 'Ad']
const INDUSTRY_OPTIONS = ['Technology', 'Health & Wellness', 'Finance', 'E-commerce', 'Education', 'SaaS', 'Real Estate', 'Food & Beverage', 'Fashion', 'Automotive', 'Travel', 'Entertainment', 'Other']

export default function CampaignBuilder({ onGenerate, isGenerating, brandSettings }: BuilderProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    objective: '',
    audience: '',
    industry: brandSettings.industry || '',
    brandVoice: brandSettings.voiceTone || '',
    platforms: [],
    keywords: [],
    competitorUrls: '',
  })
  const [keywordInput, setKeywordInput] = useState('')

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))
  }

  const canSubmit = formData.objective.trim() && formData.audience.trim() && formData.platforms.length > 0

  if (isGenerating) {
    return (
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-wide text-foreground">Generating Campaign</h2>
              <p className="text-sm text-muted-foreground mt-1">Our AI agents are crafting your campaign content and SEO analysis...</p>
            </div>
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <div className="pt-2 flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-[hsl(36,60%,50%)] animate-pulse" />
              <span>Campaign Orchestrator is coordinating Content Writer and SEO Analyst...</span>
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-foreground">Create New Campaign</h2>
            <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Define your campaign brief and let AI generate targeted content across platforms.</p>
          </div>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Campaign Objective *</Label>
                <Textarea placeholder="Describe your campaign goals, e.g., 'Launch our new eco-friendly product line targeting environmentally conscious consumers...'" value={formData.objective} onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))} className="bg-input border-border min-h-[100px] resize-none" style={{ lineHeight: '1.65' }} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Audience *</Label>
                <Input placeholder="e.g., Health-conscious millennials aged 25-40" value={formData.audience} onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))} className="bg-input border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry</Label>
                <Select value={formData.industry} onValueChange={(v) => setFormData(prev => ({ ...prev, industry: v }))}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Brand Voice Notes</Label>
                <Textarea placeholder="Describe your brand's tone, style, and personality..." value={formData.brandVoice} onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))} className="bg-input border-border min-h-[80px] resize-none" style={{ lineHeight: '1.65' }} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Platforms *</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((p) => (
                    <button key={p} onClick={() => togglePlatform(p)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border', formData.platforms.includes(p) ? 'bg-[hsl(36,60%,31%)] border-[hsl(36,60%,31%)] text-[hsl(35,20%,95%)]' : 'bg-secondary border-border text-muted-foreground hover:border-[hsl(36,60%,31%)]')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Keywords</Label>
                <div className="flex gap-2">
                  <Input placeholder="Add a keyword" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }} className="bg-input border-border" />
                  <Button onClick={addKeyword} variant="outline" size="sm" className="border-[hsl(36,60%,31%)] text-[hsl(36,60%,50%)] hover:bg-[hsl(36,60%,31%)]/10 flex-shrink-0">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.keywords.map((kw) => (
                      <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[hsl(36,60%,31%)]/20 text-[hsl(36,60%,50%)]">
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="hover:text-foreground"><FiX className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Competitor URLs (optional)</Label>
                <Input placeholder="https://competitor.com, https://another.com" value={formData.competitorUrls} onChange={(e) => setFormData(prev => ({ ...prev, competitorUrls: e.target.value }))} className="bg-input border-border" />
              </div>

              <Button onClick={() => onGenerate(formData)} disabled={!canSubmit} className="w-full bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)] shadow-lg shadow-[hsl(36,60%,31%)]/20 disabled:opacity-50">
                <FiSend className="w-4 h-4 mr-2" />
                Generate Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
