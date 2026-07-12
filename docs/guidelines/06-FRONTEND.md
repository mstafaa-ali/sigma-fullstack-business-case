# Phase 6: Frontend — React UI with Real-time Features

---

## Tujuan Fase

Membangun antarmuka web modern menggunakan **React (Vite + TypeScript)** yang mencakup: drag & drop upload, real-time progress tracking via SSE, toast notifications, dashboard statistik, history log, dan error report download. UI harus responsif, premium, dan memberikan experience yang intuitif.

---

## Scope Pekerjaan

1. Design system & global styles (CSS variables, dark mode ready)
2. Layout & navigation (sidebar + main content)
3. Upload page — drag & drop 3 files
4. Progress tracking — real-time SSE + progress bar
5. Toast notification system
6. Dashboard — statistik import summary
7. History log — list import sessions
8. Session detail — per-row log viewer + error download
9. Master data management pages (optional, bonus)
10. API client layer (Axios interceptors)
11. Custom hooks (useSSE, useToast, useApi)

---

## Requirement

### Prerequisite

- Phase 1 selesai (Vite dev server running)
- Phase 3-5 selesai (API endpoints tersedia)
- Backend running di port 3000, frontend di port 5173

### Design Principles

- **Premium Dark Theme**: Warna gelap utama, aksen vibrant (emerald/cyan)
- **Glassmorphism**: Cards dengan backdrop-filter blur
- **Micro-animations**: Hover effects, transitions, loading states
- **Responsive**: Mobile-first, breakpoints 768px dan 1024px
- **Accessibility**: Semantic HTML, focus states, aria-labels

---

## Struktur Folder yang Dihasilkan

```
frontend/src/
├── main.tsx
├── App.tsx
├── index.css                       # Global styles + CSS variables
├── api/
│   ├── client.ts                   # Axios instance + interceptors
│   ├── import.api.ts               # Import endpoints
│   ├── dashboard.api.ts            # Dashboard endpoints
│   └── master-data.api.ts          # Master data CRUD endpoints
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Main layout wrapper
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── Header.tsx              # Top header bar
│   ├── ui/
│   │   ├── Button.tsx              # Reusable button
│   │   ├── Card.tsx                # Glass card component
│   │   ├── Badge.tsx               # Status badge
│   │   ├── ProgressBar.tsx         # Animated progress bar
│   │   ├── Spinner.tsx             # Loading spinner
│   │   ├── Modal.tsx               # Modal dialog
│   │   ├── Table.tsx               # Data table
│   │   ├── EmptyState.tsx          # Empty state placeholder
│   │   └── Toast.tsx               # Toast notification
│   ├── upload/
│   │   ├── DropZone.tsx            # Drag & drop area
│   │   ├── FilePreview.tsx         # Uploaded file preview
│   │   ├── UploadProgress.tsx      # Per-file upload progress
│   │   └── UploadSummary.tsx       # Post-upload summary
│   ├── dashboard/
│   │   ├── StatsCard.tsx           # Single stat card
│   │   ├── StatsGrid.tsx           # Stats grid layout
│   │   ├── RecentImports.tsx       # Recent imports table
│   │   └── Charts.tsx              # Recharts visualizations
│   └── history/
│       ├── SessionList.tsx         # Import session list
│       ├── SessionDetail.tsx       # Session detail view
│       ├── LogViewer.tsx           # Log entries viewer
│       └── ErrorReport.tsx         # Downloadable error report
│
├── pages/
│   ├── DashboardPage.tsx           # Dashboard home
│   ├── UploadPage.tsx              # Upload wizard
│   ├── HistoryPage.tsx             # Import history
│   ├── SessionDetailPage.tsx       # Single session detail
│   └── NotFoundPage.tsx            # 404 page
│
├── hooks/
│   ├── useSSE.ts                   # Server-Sent Events hook
│   ├── useToast.ts                 # Toast notification hook
│   ├── useApi.ts                   # API call wrapper
│   ├── useFileUpload.ts            # File upload logic
│   └── useImportProgress.ts        # Combine SSE + state
│
├── types/
│   ├── import.types.ts             # Import session types
│   ├── dashboard.types.ts          # Dashboard stats types
│   └── api.types.ts                # API response types
│
└── utils/
    ├── formatters.ts               # Date, number formatters
    ├── constants.ts                # UI constants
    └── cn.ts                       # ClassName utility
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `index.css` | CSS variables, reset, global styles, animations |
| 2 | `App.tsx` | React Router setup + layout |
| 3 | `api/client.ts` | Axios instance + error interceptor |
| 4 | `api/import.api.ts` | Upload, sessions, logs, download |
| 5 | `api/dashboard.api.ts` | Stats endpoint |
| 6 | `components/layout/AppLayout.tsx` | Sidebar + main area |
| 7 | `components/layout/Sidebar.tsx` | Navigation with icons |
| 8 | `components/layout/Header.tsx` | Top bar with title |
| 9 | `components/ui/Button.tsx` | Button variants |
| 10 | `components/ui/Card.tsx` | Glassmorphism card |
| 11 | `components/ui/Badge.tsx` | Status badges |
| 12 | `components/ui/ProgressBar.tsx` | Animated progress |
| 13 | `components/ui/Spinner.tsx` | Loading spinner |
| 14 | `components/ui/Modal.tsx` | Dialog modal |
| 15 | `components/ui/Table.tsx` | Data table |
| 16 | `components/ui/Toast.tsx` | Toast system |
| 17 | `components/upload/DropZone.tsx` | Drag & drop |
| 18 | `components/upload/FilePreview.tsx` | File cards |
| 19 | `components/upload/UploadProgress.tsx` | Progress per file |
| 20 | `components/upload/UploadSummary.tsx` | Summary |
| 21 | `components/dashboard/StatsCard.tsx` | Stat card |
| 22 | `components/dashboard/StatsGrid.tsx` | Stats layout |
| 23 | `components/dashboard/RecentImports.tsx` | Recent table |
| 24 | `components/dashboard/Charts.tsx` | Charts |
| 25 | `components/history/SessionList.tsx` | History list |
| 26 | `components/history/SessionDetail.tsx` | Detail view |
| 27 | `components/history/LogViewer.tsx` | Logs |
| 28 | `components/history/ErrorReport.tsx` | Error download |
| 29 | `pages/DashboardPage.tsx` | Dashboard |
| 30 | `pages/UploadPage.tsx` | Upload |
| 31 | `pages/HistoryPage.tsx` | History |
| 32 | `pages/SessionDetailPage.tsx` | Session detail |
| 33 | `pages/NotFoundPage.tsx` | 404 |
| 34 | `hooks/useSSE.ts` | SSE hook |
| 35 | `hooks/useToast.ts` | Toast hook |
| 36 | `hooks/useApi.ts` | API hook |
| 37 | `hooks/useFileUpload.ts` | Upload hook |
| 38 | `hooks/useImportProgress.ts` | Combined hook |
| 39 | `types/*.ts` | TypeScript types |
| 40 | `utils/*.ts` | Utility functions |

---

## Penjelasan Teknis

### 1. Design System — CSS Variables

```css
/* index.css */
:root {
  /* Colors — Premium Dark Theme */
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-card: rgba(17, 24, 39, 0.7);
  --bg-card-hover: rgba(17, 24, 39, 0.9);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-color-hover: rgba(255, 255, 255, 0.15);
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --accent-primary: #10b981;      /* Emerald */
  --accent-secondary: #06b6d4;    /* Cyan */
  --accent-warning: #f59e0b;      /* Amber */
  --accent-error: #ef4444;        /* Red */
  --accent-info: #3b82f6;         /* Blue */
  
  --gradient-primary: linear-gradient(135deg, #10b981, #06b6d4);
  --gradient-accent: linear-gradient(135deg, #6366f1, #8b5cf6);
  
  /* Glass effect */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(20px);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(16, 185, 129, 0.15);
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Spacing */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}

/* Base reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes progressStripe {
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
}

.animate-fade-in {
  animation: fadeIn var(--transition-normal) ease forwards;
}

.animate-slide-in {
  animation: slideIn var(--transition-normal) ease forwards;
}
```

### 2. SSE Hook

```typescript
// hooks/useSSE.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useSSE(url: string | null, options: SSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  const connect = useCallback(() => {
    if (!url) return;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      options.onOpen?.();
    };

    es.onerror = (err) => {
      setIsConnected(false);
      options.onError?.(err);
    };

    // Listen to custom events
    ['status_change', 'progress', 'error', 'completed'].forEach(type => {
      es.addEventListener(type, (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        setLastEvent({ type, data });
        options.onMessage?.(event);
      });
    });

    es.addEventListener('close', () => {
      es.close();
      setIsConnected(false);
    });

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [url]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    setIsConnected(false);
  }, []);

  return { isConnected, lastEvent, disconnect };
}
```

### 3. File Upload Hook

```typescript
// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { importApi } from '../api/import.api';

interface UploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  sessionId: string | null;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    sessionId: null,
    error: null,
  });

  const addFiles = useCallback((newFiles: File[]) => {
    setState(prev => {
      // Validate: only Excel files
      const valid = newFiles.filter(f =>
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
      );
      
      // Max 3 files
      const combined = [...prev.files, ...valid].slice(0, 3);
      return { ...prev, files: combined, error: null };
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  const upload = useCallback(async () => {
    if (state.files.length !== 3) {
      setState(prev => ({ ...prev, error: 'Please upload exactly 3 Excel files' }));
      return;
    }

    setState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      const formData = new FormData();
      state.files.forEach(file => formData.append('files', file));

      const response = await importApi.upload(formData, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        sessionId: response.data.sessionId,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.error?.message || 'Upload failed',
      }));
    }
  }, [state.files]);

  const reset = useCallback(() => {
    setState({
      files: [],
      uploading: false,
      progress: 0,
      sessionId: null,
      error: null,
    });
  }, []);

  return { ...state, addFiles, removeFile, upload, reset };
}
```

### 4. Drop Zone Component

```typescript
// components/upload/DropZone.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  fileCount: number;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, fileCount, disabled }: DropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 3 - fileCount,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
      style={{
        border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isDragActive ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        transition: 'all var(--transition-normal)',
      }}
    >
      <input {...getInputProps()} />
      <Upload
        size={48}
        style={{
          color: isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      />
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {isDragActive ? 'Drop files here...' : 'Drag & Drop Excel Files'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Upload 3 Excel files (.xlsx) — SALES DAILY, SALES MP, SALES PRODUK
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        {fileCount}/3 files selected
      </p>
    </div>
  );
}
```

### 5. Progress Bar Component

```typescript
// components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number;       // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  variant = 'default',
  animated = true,
  size = 'md',
}: ProgressBarProps) {
  const heights = { sm: '6px', md: '10px', lg: '14px' };
  const colors = {
    default: 'var(--gradient-primary)',
    success: 'var(--accent-primary)',
    error: 'var(--accent-error)',
    warning: 'var(--accent-warning)',
  };

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
        }}>
          {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
          {showPercentage && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      <div style={{
        width: '100%',
        height: heights[size],
        background: 'var(--bg-secondary)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(value, 100)}%`,
          background: colors[variant],
          borderRadius: '999px',
          transition: 'width 0.5s ease',
          backgroundSize: animated ? '1rem 1rem' : undefined,
          backgroundImage: animated && value < 100
            ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)'
            : undefined,
          animation: animated && value < 100 ? 'progressStripe 1s linear infinite' : undefined,
        }} />
      </div>
    </div>
  );
}
```

### 6. Dashboard Stats Card

```typescript
// components/dashboard/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      transition: 'all var(--transition-normal)',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.border = '1px solid var(--border-color-hover)';
      e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = '1px solid var(--glass-border)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            {title}
          </p>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            background: color || 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {value}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: `${color || 'var(--accent-primary)'}15`,
        }}>
          <Icon size={24} style={{ color: color || 'var(--accent-primary)' }} />
        </div>
      </div>
    </div>
  );
}
```

### 7. React Router Setup

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:id" element={<SessionDetailPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 8. API Client

```typescript
// api/client.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || 'An error occurred';
    
    // Show toast for server errors
    if (error.response?.status >= 500) {
      toast.error(`Server Error: ${message}`);
    } else if (error.response?.status === 400) {
      toast.error(`Validation Error: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 9. Page Layout

Halaman utama yang harus dibuat:

| Page | Route | Fitur Utama |
|------|-------|-------------|
| Dashboard | `/dashboard` | Stats cards (total imports, success rate, total rows), recent imports table, chart |
| Upload | `/upload` | Drop zone, file preview (3 cards), upload button, progress tracker |
| History | `/history` | Paginated session list, status filter, search by date |
| Session Detail | `/history/:id` | Session info, progress timeline, log viewer, output download buttons, error report |

---

## Checklist

- [ ] CSS design system dengan variables dan animations
- [ ] Google Fonts (Inter) loaded
- [ ] Layout: sidebar navigation + main content area
- [ ] Dashboard: 4 stat cards + recent imports table
- [ ] Upload: drag & drop yang menerima 3 file Excel
- [ ] Upload: file preview cards dengan nama + size
- [ ] Upload: progress bar real-time via SSE
- [ ] Toast notifications untuk success/error
- [ ] History: paginated session list
- [ ] History: status badges (completed/failed/processing)
- [ ] Session detail: complete info + log viewer
- [ ] Session detail: download FINANCE.XLSX button
- [ ] Session detail: download MARKETING.XLSX button
- [ ] Session detail: download error log button
- [ ] SSE hook connects dan receives events
- [ ] API client dengan error interceptor
- [ ] Responsive layout (mobile + desktop)
- [ ] Loading states + empty states
- [ ] 404 page

---

## Acceptance Criteria

1. ✅ Halaman dashboard menampilkan statistik dari database
2. ✅ Drag & drop menerima exactly 3 Excel files
3. ✅ Menolak file non-Excel (PDF, images, etc.)
4. ✅ Upload progress bar bergerak secara real-time
5. ✅ Toast notification muncul saat import complete/failed
6. ✅ Progress tracking menampilkan step-by-step (validating → processing → transforming → generating)
7. ✅ History page menampilkan semua import sessions
8. ✅ Session detail menampilkan per-row logs
9. ✅ Download FINANCE.XLSX dan MARKETING.XLSX berfungsi
10. ✅ Download error report berfungsi
11. ✅ UI responsif di mobile dan desktop
12. ✅ Dark theme dengan glassmorphism terlihat premium

---

## Catatan Best Practice

1. **CSS Variables**: Jangan gunakan inline colors. Selalu referensi CSS variables agar theme consistency terjaga
2. **Component Isolation**: Setiap component harus bisa di-render secara independen. Jangan depend pada parent state
3. **Error Boundaries**: Wrap setiap page dengan React Error Boundary agar crash di satu component tidak merusak seluruh app
4. **Loading States**: SETIAP async operation harus memiliki loading state. Jangan biarkan UI "kosong" tanpa feedback
5. **Debounce**: Debounce search input dan filter agar tidak spam API call
6. **SSE Reconnection**: Implementasi auto-reconnect jika SSE connection terputus (maxRetries = 3)
7. **File Size Display**: Format file size: KB untuk < 1MB, MB untuk >= 1MB
8. **Optimistic UI**: Update UI segera setelah action, rollback jika API gagal
9. **Accessibility**: Tambahkan `role`, `aria-label`, `tabIndex` pada interactive elements
10. **Google Fonts**: Load Inter via `<link>` di `index.html`, bukan via CSS `@import` (faster load)
