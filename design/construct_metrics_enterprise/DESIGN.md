---
name: Construct Metrics Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  canvas-bg: '#F8FAFC'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  border-strong: '#CBD5E1'
  status-normal: '#059669'
  status-normal-bg: '#ECFDF5'
  status-normal-border: '#A7F3D0'
  status-warning: '#D97706'
  status-warning-bg: '#FFFBEB'
  status-warning-border: '#FDE68A'
  status-critical: '#E11D48'
  status-critical-bg: '#FFF1F2'
  status-critical-border: '#FECDD3'
  accent-focus: '#3B82F6'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#94A3B8'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  metric-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  metric-unit:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  tabular-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1.5rem
  margin-panel: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

### Brand Personality & Core Purpose
This design system is engineered specifically for corporate construction engineering management (본사 공무팀) monitoring multi-site project schedules and billing progress. The product personality is authoritative, rigorously precise, calm, and analytically transparent. It is built to eradicate cognitive fatigue from processing dense tabular figures, complex variance indicators, and monthly cumulative values.

The visual mood conveys boardroom-level structural confidence: systematic, dependable, high-density yet breathable, and unforgiving of ambiguity. The UI prioritizes instantaneous visual triage—ensuring that delay indicators (공정차이 pp), billing progress (기성률), and anomalous site narratives surface immediately without visual clutter.

### Design Movement & Aesthetic Style
The design system adopts a **Corporate / Modern High-Density Analytical** style:
- **Clean Structure**: Crisp layout lines, deliberate tabular alignment, zero ornamental distractions.
- **Data-First Hierarchy**: High-contrast contrast ratios on neutral crisp slates (#F8FAFC, #FFFFFF), grounded by corporate deep navy (#0F172A) headers and navigation tiers.
- **Unambiguous Semantic Coding**: Distinctive, non-competing semantic status cues (Emerald Green for Normal, Amber for Warning, Rose Red for Inspection/Critical) that guide civil engineers and project managers to delay points within milliseconds.

## Colors

### Color Strategy & Palette Roles
The color architecture supports mission-critical enterprise workflows where clarity saves millions in liquidated damages and project slippage.

- **Primary (`#0F172A`)**: Deep Navy Slate. Serves as the high-contrast structural anchor—used for the main global navigation bar (GNB), primary titles, critical metrics values, and modal backdrops.
- **Secondary (`#1E293B`)**: Slate 800. Applied to secondary structural headings, table column headers, filter bar containers, and high-emphasis interactive states.
- **Tertiary (`#2563EB`)**: Technical Royal Blue. Dedicated exclusively to active tabs, primary call-to-actions (e.g., CSV 내보내기, 파일 업로드), interactive linkages, and the "AI에게 묻기" query highlight states.
- **Neutral (`#64748B`)**: Slate 500. Balances metadata, unit identifiers (백만원, %, pp), inactive borders, and structural framing.

### Semantic Status Tokens
Status colors must never be used purely as decoration. They denote strict threshold states calculated from variance (`실제 공정률 − 계획 공정률`):
- **정상 (Normal)**: `status-normal` (`#059669`), paired with `#ECFDF5` background and `#A7F3D0` border. Applied when schedule difference is $\ge 0\,\text{pp}$.
- **주의 (Warning)**: `status-warning` (`#D97706`), paired with `#FFFBEB` background and `#FDE68A` border. Applied when schedule difference is $>-5\,\text{pp}$ and $<0\,\text{pp}$.
- **점검 (Inspection/Critical)**: `status-critical` (`#E11D48`), paired with `#FFF1F2` background and `#FECDD3` border. Applied when schedule difference is $\le -5\,\text{pp}$.

### Contrast & Surface Hierarchy
The default mode is a luminous, high-contrast light theme:
- The base background (`canvas-bg`: `#F8FAFC`) offsets elevated surface panels (`surface-card`: `#FFFFFF`).
- Borders (`border-subtle`: `#E2E8F0`) deliver crisp separation without heavy shadows, keeping data density legible during multi-column inspection.

## Typography

### Font Selection & Numerics
The typography standardizes on **Inter** (with direct systemic fallback to Pretendard for Hangul CJK characters). Inter provides pristine typographic clarity at small sizes and supports native monospaced figures.

- **Tabular Figures Requirement**: All data grid cells, KPI cards, variance indicators, and monetary metrics must enforce `font-feature-settings: "tnum" 1, "cv05" 1`. This prevents column jitter during scanning and ensures decimal points align vertically.
- **Hierarchy Standard**:
  - `metric-display`: Large-format KPI numerals (e.g., `67.2%`, `-2.0pp`, `424,063.4`).
  - `metric-unit`: Sits adjacent to metrics to establish context (`백만원`, `%`, `pp`).
  - `tabular-data`: Used for dense construction schedules and billing values inside data tables.
  - `label-sm`: Reserved for uppercase/bold badge pills, table column headers, and breadcrumb markers.

## Layout & Spacing

### Layout Philosophy
The dashboard is optimized specifically for PC enterprise displays (target viewport 1440px to 1920px wide). It utilizes a 12-column fluid grid system bounded by a fixed maximum container width of 1800px, flanked by `margin` (24px/1.5rem) boundaries.

- **Top GNB**: Fixed 56px height header in `#0F172A` with integrated 4-tab navigation (현황 요약, 현장별 비교표, 자료 가져오기, AI에게 묻기).
- **Filter Bar Subheader**: Sticky 52px high-density utility bar spanning across all views containing dropdowns (월, 지역, 공사 유형, 개별 현장) and instant quick-export actions.
- **KPI Metrics Strip**: 4-card horizontal flex grid atop the summary view spanning `grid-cols-4`, displaying 기성률, 계획 공정률, 실제 공정률, and 공정차이(pp).
- **Inspection Ranking & Chart Tier**: A 5:7 desktop split (`col-span-5` for 점검 현장 순위 list and `col-span-7` for 계획 vs 실제 공정률 추이 / 월별 기성액 혼합 차트).

### Spacing Density
Because enterprise civil engineers must review 12+ sites across 12 months at a glance without extensive vertical scrolling:
- Grid column gutters are set to `1rem` (16px) with an optional `gutter-dense` (`0.5rem` / 8px) for compact filter groupings.
- Internal component card padding uses `space-lg` (20px) for high-level cards and `space-md` (12px) for table rows and filter dropdown triggers.

## Elevation & Depth

### Visual Hierarchy Strategy
To prevent visual distraction and maintain technical rigor, this design system rejects heavy floating drop shadows and glassmorphic blurs in favor of **Low-Contrast Outlines & Tonal Surface Layers**.

- **Level 0 (Canvas Base)**: `#F8FAFC`. The neutral ground upon which all content rests.
- **Level 1 (Card & Table Surface)**: `#FFFFFF` with a crisp 1px border (`#E2E8F0`). No shadow or an ultra-diffused micro shadow (`box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`).
- **Level 2 (Active Table Row & Accent Card Highlight)**: When an inspection site row is focused or clicked, apply an active border tint `#2563EB` and subtle background tint `#EFF6FF` to anchor the engineer's eye.
- **Level 3 (Dropdowns & Popovers)**: `#FFFFFF` surface with a crisp border `#CBD5E1` and ambient elevation (`box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`).
- **Level 4 (Modal Windows & AI Sidebar)**: Solid `#FFFFFF` container with a 1px border, bounded by an opaque navy overlay (`rgba(15, 23, 42, 0.5)`).

## Shapes

### Shape Language
This system specifies **Soft** geometry (`roundedness: 1`), conveying technical reliability, engineering discipline, and space-efficient rectangular alignment.

- **Base Radius (0.25rem / 4px)**: Applied to table cells, inner filter tags, data badges, and compact input elements.
- **Card & Modal Radius (`rounded-lg`, 0.5rem / 8px)**: Applied to KPI metric cards, data table wrappers, modal panels, and chart containers.
- **Pill Exceptions**: Badges and status pills (e.g., 정상, 주의, 점검) use a constrained 4px or full pill (9999px) strictly for compact micro-labels, keeping text legibility undisturbed.

## Components

### Global Navigation Bar (GNB)
- **Background**: `#0F172A` (Navy Deep).
- **Height**: 56px.
- **Elements**: Brand/Project Title on the left (`Construct Metrics`), Tab Navigators in the center/left, System Status/Sync Badge on the right.
- **Tabs**: `현황 요약`, `현장별 비교표`, `자료 가져오기`, `AI에게 묻기`.
- **States**: Inactive tabs render in `#94A3B8` with hover `#F8FAFC`. Active tab displays `#FFFFFF` text with a 2px bottom border in `#3B82F6` and a subtle highlight container.

### Filter Bar
- **Surface**: `#FFFFFF` with a bottom border `#E2E8F0`.
- **Controls**: Monthly Select (`2026년 9월`), Region Select (`전체 지역`), Project Type (`전체 유형`), Site Select (`전체 현장`).
- **Reset Behavior**: When Region/Type selection invalidates the active Site, the Site dropdown automatically resets to "전체 현장" with an animated micro-badge.
- **Actions**: "CSV 내보내기" primary utility button docked to the far right.

### KPI Metric Cards
- **Structure**: 4 horizontal cards displaying:
  1. 기성률 (`누적기성액 / 계약금액 × 100`, unit `%`)
  2. 계획 공정률 (`가중 계획공정률`, unit `%`)
  3. 실제 공정률 (`가중 실제공정률`, unit `%`)
  4. 공정차이 (`실제 - 계획`, unit `pp`)
- **Visuals**: Primary number rendered in `metric-display` with `tabular-data` figures. Top label in `label-sm` slate-500. Difference card changes color dynamically: Green for $\ge 0\,\text{pp}$, Amber for $<0$ & $>-5$, Rose for $\le -5\,\text{pp}$.

### Inspection Ranking List (점검 현장 순위)
- **Ordering**: Sorted strictly by schedule difference ascending (most severely delayed first; e.g., D 현장 $-10.7\,\text{pp} \rightarrow$ I 현장 $-7.6\,\text{pp} \rightarrow$ K 현장 $-5.4\,\text{pp}$). Tied differences sorted by Site ID.
- **Row Interaction**: Hover state tints row `#F1F5F9`. Clicking an item navigates immediately to `현장별 비교표`, automatically scrolls to that row, highlights the row in `#EFF6FF` with a blue border, and expands the accordion details.

### Data Table with Row Accordion
- **Header**: `#F8FAFC` background, 36px height, uppercase slate-700 typography with sort indicators.
- **Columns**: 현장 ID, 현장명, 지역, 공사유형, 계약금액(백만원), 당월기성액(백만원), 누적기성액(백만원), 기성률(%), 계획공정률(%), 실제공정률(%), 공정차이(pp), 상태.
- **Row Height**: 44px compact rows for high information throughput.
- **Accordion Expansion**: Clicking any row unfolds the detailed audit panel displaying:
  - 공사 기간 (착공일 ~ 준공일)
  - 기록된 상황 (Original field site report)
  - 계획된 대응 (Documented action plan)

### Status Badges (상태 배지)
- **정상 (Normal)**: Text `#059669`, background `#ECFDF5`, border `#A7F3D0`.
- **주의 (Warning)**: Text `#D97706`, background `#FFFBEB`, border `#FDE68A`.
- **점검 (Inspection)**: Text `#E11D48`, background `#FFF1F2`, border `#FECDD3`.
- **Formatting**: Fixed min-width 52px, text-align center, 11px bold, 4px corner radius.

### Input Fields & Select Dropdowns
- **Height**: 36px.
- **Border**: 1px solid `#CBD5E1`, background `#FFFFFF`. Focus ring: 2px solid `#2563EB` with zero offset.
- **Typography**: 13px Inter/Pretendard.

### AI Explanation Drawer ("AI에게 묻기")
- **Container**: Split side drawer or dedicated full tab with a technical card layout.
- **Context Banner**: Explicitly badges the currently active filter scope (e.g., `[기준 월: 2026-09] [대상 현장: D 현장]`).
- **Structured Response Block**: Separates "계산 근거 수치" (Calculated numbers) from "원문 기록 내용" (Field notes), preventing hallucinations and verifying that past issues are rooted in verified data.