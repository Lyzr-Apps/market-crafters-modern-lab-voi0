'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiSave, FiCheck } from 'react-icons/fi'

export interface BrandSettingsData {
  brandName: string
  tagline: string
  voiceTone: string
  industry: string
  colorNotes: string
}

interface BrandSettingsProps {
  settings: BrandSettingsData
  onUpdate: (settings: BrandSettingsData) => void
  saved: boolean
  onSave: () => void
}

const INDUSTRIES = ['Technology', 'Health & Wellness', 'Finance', 'E-commerce', 'Education', 'SaaS', 'Real Estate', 'Food & Beverage', 'Fashion', 'Automotive', 'Travel', 'Entertainment', 'Other']

export default function BrandSettings({ settings, onUpdate, saved, onSave }: BrandSettingsProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-foreground">Brand Settings</h2>
            <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Configure your brand identity. These details are automatically included in campaign briefs.</p>
          </div>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg">Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Brand Name</Label>
                <Input placeholder="Your brand name" value={settings.brandName} onChange={(e) => onUpdate({ ...settings, brandName: e.target.value })} className="bg-input border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tagline</Label>
                <Input placeholder="Your brand's tagline or slogan" value={settings.tagline} onChange={(e) => onUpdate({ ...settings, tagline: e.target.value })} className="bg-input border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Voice & Tone</Label>
                <Textarea placeholder="Describe your brand's voice and tone, e.g., 'Professional yet approachable, using clear and concise language with a touch of warmth...'" value={settings.voiceTone} onChange={(e) => onUpdate({ ...settings, voiceTone: e.target.value })} className="bg-input border-border min-h-[100px] resize-none" style={{ lineHeight: '1.65' }} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Industry</Label>
                <Select value={settings.industry} onValueChange={(v) => onUpdate({ ...settings, industry: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Color Palette Notes</Label>
                <Textarea placeholder="Describe your brand colors, e.g., 'Primary: deep navy (#1a2b3c), Accent: warm gold (#d4a437), Background: cream (#f5f0e8)'" value={settings.colorNotes} onChange={(e) => onUpdate({ ...settings, colorNotes: e.target.value })} className="bg-input border-border min-h-[80px] resize-none" style={{ lineHeight: '1.65' }} />
              </div>

              <Button onClick={onSave} className="w-full bg-[hsl(36,60%,31%)] hover:bg-[hsl(36,60%,38%)] text-[hsl(35,20%,95%)]">
                {saved ? <><FiCheck className="w-4 h-4 mr-2" />Saved</> : <><FiSave className="w-4 h-4 mr-2" />Save Settings</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
