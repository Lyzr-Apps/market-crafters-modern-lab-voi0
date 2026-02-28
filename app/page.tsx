'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import Sidebar from './sections/Sidebar'
import CampaignDashboard from './sections/CampaignDashboard'
import CampaignBuilder from './sections/CampaignBuilder'
import CampaignReview from './sections/CampaignReview'
import BrandSettingsSection from './sections/BrandSettings'
import type { Screen } from './sections/Sidebar'
import type { Campaign } from './sections/CampaignDashboard'
import type { CampaignFormData } from './sections/CampaignBuilder'
import type { BrandSettingsData } from './sections/BrandSettings'

const AGENT_IDS = {
  orchestrator: '69a2883be72641e0c6070afe',
  graphicDesigner: '69a2883b00b22915dd81e1aa',
  videoBrief: '69a2883bd6fa89687c20afcf',
}

const LS_CAMPAIGNS = 'mcc_campaigns'
const LS_BRAND = 'mcc_brand_settings'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function loadCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_CAMPAIGNS)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {}
  return []
}

function saveCampaigns(campaigns: Campaign[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_CAMPAIGNS, JSON.stringify(campaigns)) } catch {}
}

function loadBrandSettings(): BrandSettingsData {
  const defaults: BrandSettingsData = { brandName: '', tagline: '', voiceTone: '', industry: '', colorNotes: '' }
  if (typeof window === 'undefined') return defaults
  try {
    const raw = localStorage.getItem(LS_BRAND)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {}
  return defaults
}

function saveBrandSettings(settings: BrandSettingsData) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_BRAND, JSON.stringify(settings)) } catch {}
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [brandSettings, setBrandSettings] = useState<BrandSettingsData>({ brandName: '', tagline: '', voiceTone: '', industry: '', colorNotes: '' })
  const [brandSaved, setBrandSaved] = useState(false)
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false)
  const [isGeneratingGraphics, setIsGeneratingGraphics] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    setCampaigns(loadCampaigns())
    setBrandSettings(loadBrandSettings())
  }, [])

  const updateCampaign = useCallback((updated: Campaign) => {
    setCampaigns(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c)
      saveCampaigns(next)
      return next
    })
    setActiveCampaign(updated)
  }, [])

  const handleGenerateCampaign = useCallback(async (formData: CampaignFormData) => {
    setIsGeneratingCampaign(true)
    setActiveAgentId(AGENT_IDS.orchestrator)
    setScreen('builder')
    setStatusMsg('')

    const brandCtx = brandSettings.brandName
      ? `\nBrand: ${brandSettings.brandName}. Tagline: ${brandSettings.tagline}. Voice: ${brandSettings.voiceTone}. Colors: ${brandSettings.colorNotes}.`
      : ''

    const message = `Create a comprehensive marketing campaign with the following brief:
Objective: ${formData.objective}
Target Audience: ${formData.audience}
Industry: ${formData.industry}
Brand Voice: ${formData.brandVoice}
Platforms: ${formData.platforms.join(', ')}
Keywords: ${formData.keywords.join(', ')}
${formData.competitorUrls ? `Competitor URLs: ${formData.competitorUrls}` : ''}${brandCtx}

Please generate content blocks for each platform and provide SEO analysis including keywords, content score, meta tags, optimization tips, and competitor gaps.`

    try {
      const result = await callAIAgent(message, AGENT_IDS.orchestrator)
      if (result.success) {
        const raw = result?.response?.result || result?.response
        const parsed = parseLLMJson(raw)

        const contentBlocks = Array.isArray(parsed?.content_blocks) ? parsed.content_blocks : []
        const seoAnalysis = parsed?.seo_analysis ?? null

        const newCampaign: Campaign = {
          id: Date.now().toString(),
          name: parsed?.campaign_title ?? formData.objective.slice(0, 50),
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          objective: formData.objective,
          audience: formData.audience,
          industry: formData.industry,
          platforms: formData.platforms,
          contentBlocks,
          seoAnalysis,
          graphics: [],
          videoBrief: null,
        }

        setCampaigns(prev => {
          const next = [newCampaign, ...prev]
          saveCampaigns(next)
          return next
        })
        setActiveCampaign(newCampaign)
        setScreen('review')
        setStatusMsg('Campaign generated successfully')
      } else {
        setStatusMsg(`Error: ${result?.error ?? 'Failed to generate campaign'}`)
        setScreen('builder')
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message ?? 'Unexpected error'}`)
      setScreen('builder')
    } finally {
      setIsGeneratingCampaign(false)
      setActiveAgentId(null)
    }
  }, [brandSettings])

  const handleGenerateGraphics = useCallback(async (prompt: string) => {
    if (!activeCampaign) return
    setIsGeneratingGraphics(true)
    setActiveAgentId(AGENT_IDS.graphicDesigner)
    setStatusMsg('')

    try {
      const result = await callAIAgent(prompt, AGENT_IDS.graphicDesigner)
      if (result.success) {
        const files = Array.isArray(result?.module_outputs?.artifact_files) ? result.module_outputs.artifact_files : []
        const raw = result?.response?.result || result?.response
        const parsed = parseLLMJson(raw)

        const newGraphics = files.map((f: any) => ({
          file_url: f?.file_url ?? '',
          graphic_description: parsed?.graphic_description ?? '',
          design_notes: parsed?.design_notes ?? '',
          platform: parsed?.platform ?? '',
          dimensions: parsed?.dimensions ?? '',
        }))

        const updated = {
          ...activeCampaign,
          graphics: [...(Array.isArray(activeCampaign.graphics) ? activeCampaign.graphics : []), ...newGraphics],
        }
        updateCampaign(updated)
        setStatusMsg('Graphics generated successfully')
      } else {
        setStatusMsg(`Error: ${result?.error ?? 'Failed to generate graphics'}`)
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message ?? 'Unexpected error'}`)
    } finally {
      setIsGeneratingGraphics(false)
      setActiveAgentId(null)
    }
  }, [activeCampaign, updateCampaign])

  const handleGenerateVideo = useCallback(async (prompt: string) => {
    if (!activeCampaign) return
    setIsGeneratingVideo(true)
    setActiveAgentId(AGENT_IDS.videoBrief)
    setStatusMsg('')

    try {
      const result = await callAIAgent(prompt, AGENT_IDS.videoBrief)
      if (result.success) {
        const raw = result?.response?.result || result?.response
        const parsed = parseLLMJson(raw)

        const brief = {
          video_title: parsed?.video_title ?? 'Untitled Video',
          concept_overview: parsed?.concept_overview ?? '',
          target_duration: parsed?.target_duration ?? '',
          target_platform: parsed?.target_platform ?? '',
          scenes: Array.isArray(parsed?.scenes) ? parsed.scenes : [],
          music_suggestions: parsed?.music_suggestions ?? '',
          format_recommendations: parsed?.format_recommendations ?? '',
        }

        const updated = { ...activeCampaign, videoBrief: brief }
        updateCampaign(updated)
        setStatusMsg('Video brief generated successfully')
      } else {
        setStatusMsg(`Error: ${result?.error ?? 'Failed to generate video brief'}`)
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message ?? 'Unexpected error'}`)
    } finally {
      setIsGeneratingVideo(false)
      setActiveAgentId(null)
    }
  }, [activeCampaign, updateCampaign])

  const handleSelectCampaign = useCallback((campaign: Campaign) => {
    setActiveCampaign(campaign)
    setScreen('review')
  }, [])

  const handleUpdateContentBlock = useCallback((index: number, body: string) => {
    if (!activeCampaign) return
    const blocks = Array.isArray(activeCampaign.contentBlocks) ? [...activeCampaign.contentBlocks] : []
    if (blocks[index]) {
      blocks[index] = { ...blocks[index], body, word_count: body.split(/\s+/).filter(Boolean).length }
    }
    const updated = { ...activeCampaign, contentBlocks: blocks }
    updateCampaign(updated)
  }, [activeCampaign, updateCampaign])

  const handleExport = useCallback(() => {
    if (!activeCampaign) return
    const json = JSON.stringify(activeCampaign, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(activeCampaign.name ?? 'campaign').replace(/\s+/g, '_')}_campaign.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeCampaign])

  const handleSaveBrand = useCallback(() => {
    saveBrandSettings(brandSettings)
    setBrandSaved(true)
    setTimeout(() => setBrandSaved(false), 2000)
  }, [brandSettings])

  return (
    <ErrorBoundary>
      <div className="dark min-h-screen bg-background text-foreground flex">
        <Sidebar activeScreen={screen} onNavigate={setScreen} activeAgentId={activeAgentId} />

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {statusMsg && (
            <div className={`px-4 py-2 text-xs text-center flex-shrink-0 ${statusMsg.startsWith('Error') ? 'bg-destructive/20 text-red-300' : 'bg-[hsl(36,60%,31%)]/20 text-[hsl(36,60%,50%)]'}`}>
              {statusMsg}
              <button onClick={() => setStatusMsg('')} className="ml-3 underline text-[10px]">dismiss</button>
            </div>
          )}

          {screen === 'dashboard' && (
            <CampaignDashboard
              campaigns={campaigns}
              onNewCampaign={() => setScreen('builder')}
              onSelectCampaign={handleSelectCampaign}
              showSample={showSample}
              onToggleSample={setShowSample}
            />
          )}

          {screen === 'builder' && (
            <CampaignBuilder
              onGenerate={handleGenerateCampaign}
              isGenerating={isGeneratingCampaign}
              brandSettings={brandSettings}
            />
          )}

          {screen === 'review' && (
            <CampaignReview
              campaignName={activeCampaign?.name ?? ''}
              campaignSummary={(activeCampaign as any)?.campaignSummary ?? ''}
              contentBlocks={Array.isArray(activeCampaign?.contentBlocks) ? activeCampaign.contentBlocks : []}
              seoAnalysis={activeCampaign?.seoAnalysis ?? null}
              graphics={Array.isArray(activeCampaign?.graphics) ? activeCampaign.graphics : []}
              videoBrief={activeCampaign?.videoBrief ?? null}
              onGenerateGraphics={handleGenerateGraphics}
              onGenerateVideo={handleGenerateVideo}
              isGeneratingGraphics={isGeneratingGraphics}
              isGeneratingVideo={isGeneratingVideo}
              onUpdateContentBlock={handleUpdateContentBlock}
              onExport={handleExport}
            />
          )}

          {screen === 'settings' && (
            <BrandSettingsSection
              settings={brandSettings}
              onUpdate={setBrandSettings}
              saved={brandSaved}
              onSave={handleSaveBrand}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
