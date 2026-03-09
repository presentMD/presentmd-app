import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Square, Eye, EyeOff, Copy, Check,
  ExternalLink, AlertCircle, Loader2, ChevronDown, ChevronUp, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { AI_PROVIDERS, type ProviderId } from '@/config/aiProviders';
import { PROVIDER_SETUP, OLLAMA_MODELS } from '@/config/aiProviderSetup';

const SLIDE_COUNT_OPTIONS = [3, 5, 7, 10, 15];

// ─── Badge colour map ─────────────────────────────────────────────────────────
const BADGE_CLASSES: Record<string, string> = {
  green:  'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

// ─── Provider card ────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  selected,
  onClick,
}: {
  provider: (typeof AI_PROVIDERS)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
        'hover:border-purple-400 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-sm'
          : 'border-input bg-background'
      )}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <span className="text-sm font-semibold leading-none">{provider.name}</span>
        <span className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0',
          BADGE_CLASSES[provider.badgeColor]
        )}>
          {provider.badge}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{provider.description}</p>
    </button>
  );
}

// ─── Unified setup guide (collapsible, works for all providers) ───────────────
function ProviderSetupGuide({
  providerId,
  noKey,
  currentModel,
  onSelectModel,
}: {
  providerId: ProviderId;
  /** True when no API key has been entered yet (triggers auto-expand) */
  noKey: boolean;
  currentModel?: string;
  onSelectModel?: (model: string) => void;
}) {
  const setup = PROVIDER_SETUP[providerId];
  const isLocal = providerId === 'ollama';

  // Auto-expand when there is no key or it's the local Ollama provider;
  // using `key={providerId}` on this component resets state on every provider switch
  const [expanded, setExpanded] = useState(() => noKey || isLocal);

  if (!setup) return null;

  // Count only non-warn steps for sequential numbering
  let stepNum = 0;

  return (
    <div className="rounded-md border border-border bg-muted/20 text-xs overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left font-medium hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Setup guide
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border">
          {/* Prerequisites */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-2.5 mb-1">
              Prerequisites
            </p>
            <p className="text-muted-foreground leading-relaxed">{setup.prereqs}</p>
          </div>

          {/* Numbered steps */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Steps
            </p>
            <ol className="space-y-2">
              {setup.steps.map((step, i) => {
                if (!step.warn) stepNum += 1;
                const num = stepNum;
                return (
                  <li
                    key={i}
                    className={cn(
                      'flex gap-2 leading-snug',
                      step.warn
                        ? 'text-amber-700 dark:text-amber-400 font-medium'
                        : 'text-foreground/80'
                    )}
                  >
                    {step.warn ? (
                      /* Warning callout — no number */
                      <span className="shrink-0 mt-0.5">⚠️</span>
                    ) : (
                      /* Step number circle */
                      <span className="shrink-0 w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground mt-0.5">
                        {num}
                      </span>
                    )}
                    <span>
                      {/* Strip leading ⚠️ from warn steps (we render it ourselves) */}
                      {step.warn ? step.text.replace(/^⚠️\s*/, '') : step.text}
                      {step.link && (
                        <>
                          {' '}
                          <a
                            href={step.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline inline-flex items-center gap-0.5 font-medium"
                          >
                            {step.link.label}
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </a>
                        </>
                      )}
                      {step.code && (
                        <>
                          {' '}
                          <code className="bg-muted border border-border px-1 py-0.5 rounded font-mono text-[11px]">
                            {step.code}
                          </code>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Ollama: popular model quick-pick */}
          {isLocal && onSelectModel && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Popular models (click to select)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OLLAMA_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded border px-2 py-1 transition-colors text-left',
                      currentModel === m.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                        : 'border-border bg-background hover:border-purple-400 hover:text-foreground text-muted-foreground'
                    )}
                  >
                    <span className="font-mono text-[11px] font-medium">{m.label}</span>
                    <span className="text-[10px] opacity-70">{m.ram}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className={cn(
            'rounded px-2.5 py-2 leading-relaxed',
            setup.pricingWarn
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50'
          )}>
            <span className="font-semibold">{setup.pricingWarn ? 'Pricing: ' : 'Pricing: '}</span>
            {setup.pricing}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
interface AIGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string) => void;
}

export function AIGenerateModal({ open, onOpenChange, onInsert }: AIGenerateModalProps) {
  const {
    providerId, setProviderId,
    apiKey, setApiKey,
    ollamaHost, setOllamaHost,
    ollamaModel, setOllamaModel,
    isGenerating, generatedContent, error,
    generate, stop, reset,
  } = useAIGenerate();

  const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;

  const [prompt, setPrompt]         = useState('');
  const [slideCount, setSlideCount] = useState(7);
  const [showKey, setShowKey]       = useState(false);
  const [localKey, setLocalKey]     = useState(apiKey);
  const [copied, setCopied]         = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  // Sync local key when provider changes
  useEffect(() => { setLocalKey(apiKey); }, [providerId, apiKey]);

  // Auto-scroll output while streaming
  useEffect(() => {
    if (outputRef.current && isGenerating) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [generatedContent, isGenerating]);

  const handleProviderChange = (id: ProviderId) => {
    setProviderId(id);
    reset();
  };

  const handleGenerate = async () => {
    if (localKey !== apiKey) setApiKey(localKey);
    reset();
    await generate(prompt, slideCount);
  };

  const handleInsert = () => {
    if (generatedContent) { onInsert(generatedContent); onOpenChange(false); }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (isGenerating) stop();
    onOpenChange(false);
  };

  const hasContent  = generatedContent.length > 0;
  const noKey       = provider.requiresKey && !(localKey || apiKey).trim();
  const keyReady    = !provider.requiresKey || (localKey || apiKey).trim().length > 0;
  const canGenerate = !isGenerating && keyReady && prompt.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl flex flex-col gap-0 p-0 overflow-hidden"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            Pick a provider, describe your presentation, and let AI write the markdown.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">

          {/* ── Provider grid ─────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {AI_PROVIDERS.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  selected={providerId === p.id}
                  onClick={() => handleProviderChange(p.id as ProviderId)}
                />
              ))}
            </div>
          </div>

          {/* ── Credentials ───────────────────────────────────────────── */}
          {provider.isLocal ? (
            /* Ollama: host + model inputs */
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ollama Host</label>
                <Input
                  value={ollamaHost}
                  onChange={(e) => setOllamaHost(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                  className="font-mono text-sm"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Pull first:{' '}
                  <code className="bg-muted px-1 rounded text-[11px]">
                    ollama pull {ollamaModel || 'llama3.2'}
                  </code>
                </p>
              </div>
              {/* Ollama setup guide (always shown, with model quick-pick) */}
              <ProviderSetupGuide
                key={providerId}
                providerId={providerId}
                noKey={false}
                currentModel={ollamaModel}
                onSelectModel={setOllamaModel}
              />
            </div>
          ) : (
            /* All other providers: API key */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{provider.keyLabel}</label>
                <a
                  href={provider.keyUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-xs text-purple-600 hover:underline"
                >
                  Get your key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={localKey}
                  onChange={(e) => { setLocalKey(e.target.value); setApiKey(e.target.value); }}
                  placeholder={provider.keyPlaceholder}
                  className="pr-10 font-mono text-sm"
                  disabled={isGenerating}
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored in your browser only — sent directly to {provider.name}, nowhere else.
              </p>

              {/* Fixed model info */}
              <p className="text-xs text-muted-foreground">
                Model:{' '}
                <code className="bg-muted px-1 rounded text-[11px]">{provider.defaultModel}</code>
              </p>

              {/* Setup guide — auto-expands when no key is saved */}
              <ProviderSetupGuide
                key={providerId}
                providerId={providerId}
                noKey={!!noKey}
              />
            </div>
          )}

          {/* ── Prompt ────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">What is your presentation about?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. The future of renewable energy — covering solar, wind, and battery storage trends for a 2026 industry conference"
              rows={3}
              disabled={isGenerating}
              className={cn(
                'w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>

          {/* ── Slide count ───────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Number of slides</label>
            <div className="flex gap-2">
              {SLIDE_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSlideCount(n)}
                  disabled={isGenerating}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                    slideCount === n
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-background text-foreground border-input hover:border-purple-400 hover:text-purple-600'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Streaming output ──────────────────────────────────────── */}
          {(isGenerating || hasContent) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  Generated Markdown
                  {isGenerating && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating…
                    </span>
                  )}
                </label>
                {hasContent && !isGenerating && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copied
                      ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                )}
              </div>
              <div
                ref={outputRef}
                className="rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap break-words"
                style={{ maxHeight: '260px', minHeight: '80px' }}
              >
                {generatedContent}
                {isGenerating && (
                  <span className="inline-block w-0.5 h-3.5 bg-purple-500 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 bg-background">
          <Button variant="ghost" onClick={handleClose} size="sm">Cancel</Button>
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <Button
                variant="outline" size="sm" onClick={stop}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleGenerate} disabled={!canGenerate} size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate
              </Button>
            )}
            {hasContent && !isGenerating && (
              <Button onClick={handleInsert} size="sm">Insert into Editor</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
