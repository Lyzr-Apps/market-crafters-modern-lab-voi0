'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { FiChevronDown, FiChevronUp, FiCopy, FiCheck, FiImage, FiVideo, FiDownload, FiRefreshCw, FiHash, FiTarget, FiAlertCircle } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'

interface ContentBlock {
  platform: string
  content_type: string
  title: string
  body: string
  word_count: number
  hashtags: string
}

interface Keyword {
  keyword: string
  search_volume: string
  difficulty: string
  recommendation: string
}

interface CompetitorGap {
  gap: string
  opportunity: string
}

interface SEOAnalysis {
  keywords: Keyword[]
  content_score: number
  meta_title: string
  meta_description: string
  optimization_tips: string[]
  competitor_gaps: CompetitorGap[]
}

interface GraphicAsset {
  file_url: string
  graphic_description?: string
  design_notes?: string
  platform?: string
  dimensions?: string
}

interface Scene {
  scene_number: number
  description: string
  narration: string
  visual_notes: string
  duration: string
  shot_type: string
}

interface VideoBrief {
  video_title: string
  concept_overview: string
  target_duration: string
  target_platform: string
  scenes: Scene[]
  music_suggestions: string
  format_recommendations: string
}

interface CampaignReviewProps {
  campaignName: string
  campaignSummary: string
  contentBlocks: ContentBlock[]
  seoAnalysis: SEOAnalysis | null
  graphics: GraphicAsset[]
  videoBrief: VideoBrief | null
  onGenerateGraphics: (prompt: string) => void
  onGenerateVideo: (prompt: string) => void
  isGeneratingGraphics: boolean
  isGeneratingVideo: boolean
  onUpdateContentBlock: (index: number, body: string) => void
  onExport: () => void
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm" style={{ lineHeight: '1.65' }}>{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

export default function CampaignReview({
  campaignName, campaignSummary, contentBlocks, seoAnalysis, graphics,
  videoBrief, onGenerateGraphics, onGenerateVideo, isGeneratingGraphics,
  isGeneratingVideo, onUpdateContentBlock, onExport,
}: CampaignReviewProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]))
  const [editingBlock, setEditingBlock] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [graphicPrompt, setGraphicPrompt] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')

  const safeContentBlocks = Array.isArray(contentBlocks) ? contentBlocks : []
  const safeKeywords = Array.isArray(seoAnalysis?.keywords) ? seoAnalysis.keywords : []
  const safeTips = Array.isArray(seoAnalysis?.optimization_tips) ? seoAnalysis.optimization_tips : []
  const safeGaps = Array.isArray(seoAnalysis?.competitor_gaps) ? seoAnalysis.competitor_gaps : []
  const safeGraphics = Array.isArray(graphics) ? graphics : []
  const safeScenes = Array.isArray(videoBrief?.scenes) ? videoBrief.scenes : []

  const toggleBlock = (idx: number) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const startEditing = (idx: number) => {
    setEditingBlock(idx)
    setEditText(safeContentBlocks[idx]?.body ?? '')
  }

  const saveEditing = (idx: number) => {
    onUpdateContentBlock(idx, editText)
    setEditingBlock(null)
  }

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-[hsl(36,60%,50%)]'
    return 'text-red-400'
  }

  if (safeContentBlocks.length === 0 && !seoAnalysis) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <Card className="bg-card border-border shadow-lg max-w-md w-full">
            <CardContent className="py-12 text-center">
              <FiAlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="font-serif text-lg text-foreground mb-2">No campaign selected</h3>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.65' }}>Select a campaign from the dashboard or create a new one to review its content.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-wide text-foreground">{campaignName || 'Campaign Review'}</h2>
              {campaignSummary && <p className="text-sm text-muted-foreground mt-1 max-w-2xl" style={{ lineHeight: '1.65' }}>{campaignSummary}</p>}
            </div>
            <Button onClick={onExport} variant="outline" className="border-[hsl(36,60%,31%)] text-[hsl(36,60%,50%)] hover:bg-[hsl(36,60%,31%)]/10">
              <FiDownload className="w-4 h-4 mr-2" />Export
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <h3 className="font-serif text-lg font-medium text-foreground">Content Blocks</h3>
              {safeContentBlocks.map((block, idx) => (
                <Card key={idx} className="bg-card border-border shadow-lg">
                  <button onClick={() => toggleBlock(idx)} className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[hsl(36,60%,31%)]/20 text-[hsl(36,60%,50%)] text-[10px]">{block?.platform ?? 'Unknown'}</Badge>
                      <span className="font-serif text-sm font-medium text-foreground">{block?.title ?? 'Untitled'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{block?.word_count ?? 0} words</span>
                      {expandedBlocks.has(idx) ? <FiChevronUp className="w-4 h-4 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedBlocks.has(idx) && (
                    <CardContent className="pt-0 px-4 pb-4">
                      <Separator className="mb-4" />
                      {editingBlock === idx ? (
                        <div className="space-y-3">
                          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="bg-input border-border min-h-[200px] text-sm resize-none" style={{ lineHeight: '1.65' }} />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEditing(idx)} className="bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)]">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingBlock(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-foreground/90" style={{ lineHeight: '1.65' }}>{renderMarkdown(block?.body ?? '')}</div>
                          {block?.hashtags && (
                            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                              <FiHash className="w-3 h-3 text-[hsl(36,60%,50%)]" />
                              {block.hashtags.split(/[,\s]+/).filter(Boolean).map((tag, ti) => (
                                <span key={ti} className="text-[10px] text-[hsl(36,60%,50%)]">#{tag.replace('#', '')}</span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="text-xs h-7 border-border">Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleCopy(block?.body ?? '', idx)} className="text-xs h-7 border-border">
                              {copiedIdx === idx ? <><FiCheck className="w-3 h-3 mr-1" />Copied</> : <><FiCopy className="w-3 h-3 mr-1" />Copy</>}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-serif text-lg font-medium text-foreground">SEO Analysis</h3>
              {seoAnalysis ? (
                <>
                  <Card className="bg-card border-border shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Content Score</p>
                        <span className={cn('text-2xl font-serif font-semibold', scoreColor(seoAnalysis?.content_score ?? 0))}>{seoAnalysis?.content_score ?? 0}/100</span>
                      </div>
                      <Progress value={seoAnalysis?.content_score ?? 0} className="h-2" />
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="font-serif text-sm">Meta Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Title</p>
                        <p className="text-sm text-foreground">{seoAnalysis?.meta_title ?? '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Description</p>
                        <p className="text-xs text-foreground/80" style={{ lineHeight: '1.65' }}>{seoAnalysis?.meta_description ?? '--'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {safeKeywords.length > 0 && (
                    <Card className="bg-card border-border shadow-lg">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="font-serif text-sm">Keywords</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px] h-8">Keyword</TableHead>
                              <TableHead className="text-[10px] h-8">Volume</TableHead>
                              <TableHead className="text-[10px] h-8">Diff.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {safeKeywords.map((kw, ki) => (
                              <TableRow key={ki}>
                                <TableCell className="text-xs py-2">{kw?.keyword ?? '--'}</TableCell>
                                <TableCell className="text-xs py-2">{kw?.search_volume ?? '--'}</TableCell>
                                <TableCell className="text-xs py-2"><Badge variant="outline" className="text-[10px]">{kw?.difficulty ?? '--'}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {safeTips.length > 0 && (
                    <Card className="bg-card border-border shadow-lg">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="font-serif text-sm">Optimization Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <ul className="space-y-1.5">
                          {safeTips.map((tip, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-xs text-foreground/80" style={{ lineHeight: '1.65' }}>
                              <FiTarget className="w-3 h-3 text-[hsl(36,60%,50%)] mt-0.5 flex-shrink-0" />
                              <span>{tip ?? ''}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {safeGaps.length > 0 && (
                    <Card className="bg-card border-border shadow-lg">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="font-serif text-sm">Competitor Gaps</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        {safeGaps.map((g, gi) => (
                          <div key={gi} className="p-2 rounded bg-secondary/50">
                            <p className="text-xs font-medium text-foreground">{g?.gap ?? ''}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{g?.opportunity ?? ''}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="bg-card border-border shadow-lg">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">SEO analysis not available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-foreground">Graphics</h3>
              <div className="flex items-center gap-2">
                <Textarea value={graphicPrompt} onChange={(e) => setGraphicPrompt(e.target.value)} placeholder="Describe the graphic you want..." className="bg-input border-border text-xs h-9 min-h-[36px] w-64 resize-none" />
                <Button onClick={() => onGenerateGraphics(graphicPrompt || `Create a marketing graphic for the campaign: ${campaignName}`)} disabled={isGeneratingGraphics} className="bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)] flex-shrink-0">
                  {isGeneratingGraphics ? <><FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><FiImage className="w-4 h-4 mr-2" />Generate</>}
                </Button>
              </div>
            </div>

            {isGeneratingGraphics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
              </div>
            )}

            {safeGraphics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {safeGraphics.map((g, gi) => (
                  <Card key={gi} className="bg-card border-border shadow-lg overflow-hidden">
                    {g?.file_url && (
                      <div className="aspect-square relative bg-secondary">
                        <img src={g.file_url} alt={g?.graphic_description ?? 'Generated graphic'} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      {g?.graphic_description && <p className="text-xs text-foreground/80 line-clamp-2">{g.graphic_description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {g?.platform && <Badge variant="outline" className="text-[10px]">{g.platform}</Badge>}
                        {g?.dimensions && <span className="text-[10px] text-muted-foreground">{g.dimensions}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isGeneratingGraphics && safeGraphics.length === 0 && (
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="py-8 text-center">
                  <FiImage className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No graphics generated yet. Click Generate to create visual assets.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-foreground">Video Brief</h3>
              <div className="flex items-center gap-2">
                <Textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="Describe the video concept..." className="bg-input border-border text-xs h-9 min-h-[36px] w-64 resize-none" />
                <Button onClick={() => onGenerateVideo(videoPrompt || `Create a video brief for the campaign: ${campaignName}`)} disabled={isGeneratingVideo} className="bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)] flex-shrink-0">
                  {isGeneratingVideo ? <><FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><FiVideo className="w-4 h-4 mr-2" />Generate</>}
                </Button>
              </div>
            </div>

            {isGeneratingVideo && (
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </CardContent>
              </Card>
            )}

            {videoBrief && (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-base">{videoBrief?.video_title ?? 'Video Brief'}</CardTitle>
                    <div className="flex gap-2">
                      {videoBrief?.target_platform && <Badge variant="outline" className="text-[10px]">{videoBrief.target_platform}</Badge>}
                      {videoBrief?.target_duration && <Badge variant="outline" className="text-[10px]">{videoBrief.target_duration}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videoBrief?.concept_overview && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Concept</p>
                      <div className="text-sm text-foreground/90" style={{ lineHeight: '1.65' }}>{renderMarkdown(videoBrief.concept_overview)}</div>
                    </div>
                  )}
                  {safeScenes.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Scenes</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {safeScenes.map((scene, si) => (
                          <div key={si} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[hsl(36,60%,50%)]">Scene {scene?.scene_number ?? si + 1}</span>
                              <div className="flex gap-1.5">
                                {scene?.shot_type && <Badge variant="outline" className="text-[9px]">{scene.shot_type}</Badge>}
                                {scene?.duration && <span className="text-[9px] text-muted-foreground">{scene.duration}</span>}
                              </div>
                            </div>
                            {scene?.description && <p className="text-xs text-foreground/80 mb-1" style={{ lineHeight: '1.65' }}>{scene.description}</p>}
                            {scene?.narration && <p className="text-[10px] text-muted-foreground italic mt-1" style={{ lineHeight: '1.65' }}>"{scene.narration}"</p>}
                            {scene?.visual_notes && <p className="text-[10px] text-[hsl(36,60%,50%)]/70 mt-1">{scene.visual_notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoBrief?.music_suggestions && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Music</p>
                        <p className="text-xs text-foreground/80" style={{ lineHeight: '1.65' }}>{videoBrief.music_suggestions}</p>
                      </div>
                    )}
                    {videoBrief?.format_recommendations && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Format</p>
                        <p className="text-xs text-foreground/80" style={{ lineHeight: '1.65' }}>{videoBrief.format_recommendations}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!isGeneratingVideo && !videoBrief && (
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="py-8 text-center">
                  <FiVideo className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No video brief generated yet. Click Generate to create a video production brief.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
