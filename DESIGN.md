---
name: CampusOps Unified Design System
colors:
  base-bg: '#0B101B'
  card-surface: '#121827'
  elevated-surface: '#1A2234'
  border-subtle: '#1E293B'
  border-highlight: '#334155'
  
  primary-accent: '#3B82F6'
  primary-hover: '#2563EB'
  accent-glow: 'rgba(59, 130, 246, 0.25)'
  
  status-open-bg: 'rgba(239, 68, 68, 0.12)'
  status-open-text: '#F87171'
  status-open-border: 'rgba(239, 68, 68, 0.25)'
  
  status-progress-bg: 'rgba(245, 158, 11, 0.12)'
  status-progress-text: '#FBBF24'
  status-progress-border: 'rgba(245, 158, 11, 0.25)'
  
  status-resolved-bg: 'rgba(16, 185, 129, 0.12)'
  status-resolved-text: '#34D399'
  status-resolved-border: 'rgba(16, 185, 129, 0.25)'
  
  status-closed-bg: 'rgba(100, 116, 139, 0.15)'
  status-closed-text: '#94A3B8'
  status-closed-border: 'rgba(100, 116, 139, 0.25)'

  text-heading: '#FFFFFF'
  text-body: '#94A3B8'
  text-muted: '#64748B'

typography:
  font-sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  font-mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
---

# CampusOps Unified Design System Specification

## 1. Color Palette Tokens
- **Base Background**: `#0B101B` (Deep Void Slate)
- **Card Container**: `#121827` (Card Slate)
- **Elevated Surface**: `#1A2234` (Elevated Slate)
- **Border / Divider**: `#1E293B` (1px solid Subtle Slate Border)
- **Primary Accent**: `#3B82F6` (Electric Blue) | Hover: `#2563EB` | Glow: `rgba(59, 130, 246, 0.25)`

## 2. Typography Rules
- **Font Stack**: Inter for interface elements; JetBrains Mono for code/IDs (`INC-1042`).
- **Headings**: `#FFFFFF` (Pure White, font-bold)
- **Body Text**: `#94A3B8` (Slate 400)
- **Muted Text**: `#64748B` (Slate 500)

## 3. Components & Shapes
- **Cards**: `rounded-2xl` (`1rem`), `border border-[#1E293B]`, `bg-[#121827]`, `shadow-sm`
- **Inputs**: `bg-[#0B101B]`, `border border-[#1E293B]`, `rounded-xl`, `px-4 py-2.5`, `text-sm text-white`, `placeholder-[#64748B]`, `focus:border-[#3B82F6]`, `focus:ring-1 focus:ring-[#3B82F6]`
- **Primary Buttons**: `bg-[#3B82F6]` / `bg-[#2563EB]`, `hover:bg-[#3B82F6]`, `text-white text-sm font-semibold`, `px-4 py-2.5 rounded-xl`, `shadow-lg shadow-blue-600/20`
- **Secondary Buttons**: `bg-[#1E293B]`, `hover:bg-[#334155]`, `text-[#CBD5E1] text-sm font-medium`, `px-4 py-2.5 rounded-xl`, `border border-[#334155]`