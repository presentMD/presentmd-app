/**
 * DiagramRenderer — SmartArt-style diagrams from fenced markdown code blocks.
 *
 * Usage in slides:
 *
 *   ```diagram
 *   type: process   ← process | cycle | hierarchy | pyramid | columns
 *   - Step 1
 *   - Step 2
 *   - Step 3
 *   ```
 *
 * For hierarchy, leading spaces (2 per level) define parent→child relationships.
 * For columns, use `= Column Header` lines to start each column group.
 *
 * Accent colour is derived automatically from the active slide theme.
 */
import React from 'react';
import { getThemeConfig } from '@/config/themes';

// ─── Types ────────────────────────────────────────────────────────────────────
type DiagramType = 'process' | 'cycle' | 'hierarchy' | 'pyramid' | 'columns';

interface DiagramItem {
  text:     string;
  depth:    number;   // 0 = root, 1 = child, 2 = grandchild  (from leading spaces ÷ 2)
  isHeader: boolean;  // true for `= Column Title` lines
}

interface ParsedDiagram {
  type:  DiagramType;
  items: DiagramItem[];
}

interface TreeNode {
  text:     string;
  children: TreeNode[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseDiagramContent(raw: string): ParsedDiagram {
  const lines = raw.split('\n');
  let type: DiagramType = 'process';
  const items: DiagramItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('type:')) {
      type = trimmed.slice(5).trim().toLowerCase() as DiagramType;
    } else if (trimmed.startsWith('=')) {
      items.push({ text: trimmed.slice(1).trim(), depth: 0, isHeader: true });
    } else if (trimmed.startsWith('-')) {
      // Depth = leading spaces ÷ 2 (each indent level = 2 spaces)
      const leadingSpaces = line.match(/^(\s*)/)?.[1].length ?? 0;
      const depth = Math.floor(leadingSpaces / 2);
      items.push({ text: trimmed.slice(1).trim(), depth, isHeader: false });
    }
  }

  return { type, items };
}

// ─── Colour helper ────────────────────────────────────────────────────────────
/**
 * Appends a 2-digit hex alpha channel to a CSS hex colour.
 * Handles 3-digit (#rgb) and 6-digit (#rrggbb) hex values.
 * Falls back to the original string for non-hex colours.
 */
function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6)  return hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16).padStart(2, '0');
  return `#${h}${a}`;
}

// ─── Process ──────────────────────────────────────────────────────────────────
function ProcessDiagram({ items, accent }: { items: DiagramItem[]; accent: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-4 my-4 px-2">
      {items.map((item, i) => {
        // Progressive darkening: first step is lightest, last is full opacity
        const alpha = items.length === 1 ? 1 : 0.55 + (i / (items.length - 1)) * 0.45;
        return (
          <React.Fragment key={i}>
            <div
              className="relative flex items-center justify-center rounded-xl px-4 py-3
                         min-w-[80px] max-w-[140px] text-center shadow-sm"
              style={{ backgroundColor: withAlpha(accent, alpha) }}
            >
              {/* Step number badge */}
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full
                           text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: withAlpha(accent, Math.min(1, alpha + 0.25)) }}
              >
                {i + 1}
              </span>
              <span className="text-white text-xs font-semibold leading-snug mt-1">
                {item.text}
              </span>
            </div>

            {i < items.length - 1 && (
              <span
                className="text-2xl leading-none select-none mx-0.5"
                style={{ color: withAlpha(accent, 0.55) }}
              >
                ›
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Cycle ────────────────────────────────────────────────────────────────────
function CycleDiagram({ items, accent }: { items: DiagramItem[]; accent: string }) {
  const n = items.length;
  if (n === 0) return null;

  // ── Layout constants ───────────────────────────────────────────────────────
  const SIZE    = 300;                          // SVG viewBox side length
  const CX      = SIZE / 2;                    // centre X
  const CY      = SIZE / 2;                    // centre Y
  const RING_R  = 98;                          // ring radius (centre → circle centre)
  // Shrink circles when there are many items so they don't overlap
  const CIRC_R  = Math.min(46, RING_R * 0.45 - Math.max(0, (n - 4) * 3));

  // Angle for item i, measured clockwise from 12 o'clock
  const theta = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;

  // Radians to skip over each circle + a small gap before drawing the arc
  const arcGap = Math.asin(Math.min(CIRC_R / RING_R, 0.999)) + 0.14;

  const positions = Array.from({ length: n }, (_, i) => ({
    x: CX + RING_R * Math.cos(theta(i)),
    y: CY + RING_R * Math.sin(theta(i)),
  }));

  const arcs = Array.from({ length: n }, (_, i) => {
    const j  = (i + 1) % n;
    const a0 = theta(i);
    // Ensure the next angle is always greater (clockwise wrap for last → first)
    const a1 = j > i ? theta(j) : theta(j) + 2 * Math.PI;
    const sa = a0 + arcGap;
    const ea = a1 - arcGap;
    return {
      sx: CX + RING_R * Math.cos(sa),
      sy: CY + RING_R * Math.sin(sa),
      ex: CX + RING_R * Math.cos(ea),
      ey: CY + RING_R * Math.sin(ea),
      largeArc: ea - sa > Math.PI ? 1 : 0,
    };
  });

  // Stable marker ID scoped to this accent colour
  const markerId = `ca${accent.replace(/[^a-z0-9]/gi, '')}`;
  const arrowColor = 'rgba(155, 170, 185, 0.9)';
  const fontSize   = Math.max(9, 14 - Math.max(0, n - 3));

  return (
    <div className="my-4 flex justify-center w-full">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: '100%', maxWidth: 400, height: 'auto' }}
        aria-label="Cycle diagram"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="7" markerHeight="7"
            refX="6.5" refY="3.5"
            orient="auto"
          >
            {/* Solid filled arrowhead */}
            <path d="M0,0.5 L6.5,3.5 L0,6.5 Z" fill={arrowColor} />
          </marker>
        </defs>

        {/* Curved arcs (clockwise) */}
        {arcs.map(({ sx, sy, ex, ey, largeArc }, i) => (
          <path
            key={i}
            d={`M${sx},${sy} A${RING_R},${RING_R} 0 ${largeArc},1 ${ex},${ey}`}
            fill="none"
            stroke={arrowColor}
            strokeWidth="2.5"
            markerEnd={`url(#${markerId})`}
          />
        ))}

        {/* Circles */}
        {positions.map((pos, i) => (
          <circle key={i} cx={pos.x} cy={pos.y} r={CIRC_R} fill={accent} />
        ))}

        {/* Labels via foreignObject so text wraps naturally */}
        {positions.map((pos, i) => (
          <foreignObject
            key={i}
            x={pos.x - CIRC_R}
            y={pos.y - CIRC_R}
            width={CIRC_R * 2}
            height={CIRC_R * 2}
          >
            <div
              style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                fontSize: `${fontSize}px`,
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1.25,
                padding: '5px',
                boxSizing: 'border-box',
                wordBreak: 'break-word',
              }}
            >
              {items[i].text}
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  );
}

// ─── Hierarchy ────────────────────────────────────────────────────────────────
function buildTree(items: DiagramItem[]): TreeNode | null {
  if (items.length === 0) return null;
  const root: TreeNode = { text: items[0].text, children: [] };
  const stack: { node: TreeNode; depth: number }[] = [{ node: root, depth: items[0].depth }];

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    // Pop back to the rightful parent
    while (stack.length > 1 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].node;
    const node: TreeNode = { text: item.text, children: [] };
    parent.children.push(node);
    stack.push({ node, depth: item.depth });
  }

  return root;
}

function HierarchyNode({ node, accent, depth = 0 }: { node: TreeNode; accent: string; depth?: number }) {
  const bgAlpha = Math.max(0.48, 1 - depth * 0.18);
  const lineColor = withAlpha(accent, 0.38);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node box */}
      <div
        className="rounded-lg px-3 py-2 text-white text-xs font-semibold text-center
                   min-w-[72px] max-w-[130px] shadow-sm z-10 relative"
        style={{ backgroundColor: withAlpha(accent, bgAlpha) }}
      >
        {node.text}
      </div>

      {hasChildren && (
        <>
          {/* Vertical stem from box to horizontal connector */}
          <div className="w-px h-3" style={{ backgroundColor: lineColor }} />

          {/* Children row */}
          <div className="relative flex gap-4">
            {/* Horizontal connector spanning all children */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-px"
                style={{
                  // Centre of first child … centre of last child
                  left:  `${50 / node.children.length}%`,
                  right: `${50 / node.children.length}%`,
                  backgroundColor: lineColor,
                }}
              />
            )}

            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-3" style={{ backgroundColor: lineColor }} />
                <HierarchyNode node={child} accent={accent} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HierarchyDiagram({ items, accent }: { items: DiagramItem[]; accent: string }) {
  const tree = buildTree(items);
  if (!tree) return null;
  return (
    <div className="flex justify-center my-4 overflow-x-auto">
      <HierarchyNode node={tree} accent={accent} />
    </div>
  );
}

// ─── Pyramid ──────────────────────────────────────────────────────────────────
function PyramidDiagram({ items, accent }: { items: DiagramItem[]; accent: string }) {
  const total = items.length;
  return (
    <div className="flex flex-col items-center gap-1.5 my-4 w-full">
      {items.map((item, i) => {
        const widthPct  = Math.round(((i + 1) / total) * 100);
        const bgAlpha   = total === 1 ? 1 : 0.38 + (i / (total - 1)) * 0.62;
        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-sm
                       text-white text-xs font-semibold py-2.5 text-center shadow-sm"
            style={{
              width:           `${widthPct}%`,
              backgroundColor: withAlpha(accent, bgAlpha),
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────
function ColumnsDiagram({ items, accent }: { items: DiagramItem[]; accent: string }) {
  // Group `- items` under their preceding `= header`
  const columns: { header: string; rows: string[] }[] = [];
  let current: { header: string; rows: string[] } | null = null;

  for (const item of items) {
    if (item.isHeader) {
      current = { header: item.text, rows: [] };
      columns.push(current);
    } else if (current) {
      current.rows.push(item.text);
    }
  }

  if (columns.length === 0) return null;

  const n = Math.min(columns.length, 4);
  const gridCols = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][n];

  return (
    <div className={`grid ${gridCols} gap-3 my-4`}>
      {columns.map((col, i) => (
        <div
          key={i}
          className="flex flex-col rounded-lg overflow-hidden"
          style={{ border: `1.5px solid ${withAlpha(accent, 0.28)}` }}
        >
          {/* Column header */}
          <div
            className="text-white text-xs font-semibold text-center px-3 py-2"
            style={{ backgroundColor: accent }}
          >
            {col.header}
          </div>

          {/* Column items */}
          <div
            className="p-3 flex-1 space-y-1.5"
            style={{ backgroundColor: withAlpha(accent, 0.06) }}
          >
            {col.rows.map((row, j) => (
              <div key={j} className="flex items-start gap-1.5 text-xs">
                <span className="mt-0.5 shrink-0 leading-none" style={{ color: accent }}>●</span>
                <span>{row}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Fallback placeholders ────────────────────────────────────────────────────
function EmptyNote({ type }: { type: string }) {
  return (
    <div className="my-4 flex items-center gap-2 rounded-md border border-dashed px-4 py-3
                    text-xs text-muted-foreground">
      <span>⚠</span>
      <span>
        <strong>{type}</strong> diagram has no items.
        Add some with <code className="bg-muted px-1 rounded">- item text</code>
      </span>
    </div>
  );
}

function UnknownNote({ type }: { type: string }) {
  return (
    <div className="my-4 flex items-center gap-2 rounded-md border border-dashed px-4 py-3
                    text-xs text-muted-foreground">
      <span>⚠</span>
      <span>
        Unknown diagram type <code className="bg-muted px-1 rounded">"{type}"</code>.
        Valid types: <code className="bg-muted px-1 rounded">process</code> ·{' '}
        <code className="bg-muted px-1 rounded">cycle</code> ·{' '}
        <code className="bg-muted px-1 rounded">hierarchy</code> ·{' '}
        <code className="bg-muted px-1 rounded">pyramid</code> ·{' '}
        <code className="bg-muted px-1 rounded">columns</code>
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function DiagramRenderer({ content, theme }: { content: string; theme: string }) {
  const diagram = parseDiagramContent(content);
  const accent  = getThemeConfig(theme).accentColor;
  const nodes   = diagram.items.filter(i => !i.isHeader);

  switch (diagram.type) {
    case 'process':
      return nodes.length > 0
        ? <ProcessDiagram   items={nodes}          accent={accent} />
        : <EmptyNote type="process" />;

    case 'cycle':
      return nodes.length > 0
        ? <CycleDiagram     items={nodes}          accent={accent} />
        : <EmptyNote type="cycle" />;

    case 'hierarchy':
      return nodes.length > 0
        ? <HierarchyDiagram items={nodes}          accent={accent} />
        : <EmptyNote type="hierarchy" />;

    case 'pyramid':
      return nodes.length > 0
        ? <PyramidDiagram   items={nodes}          accent={accent} />
        : <EmptyNote type="pyramid" />;

    case 'columns':
      return diagram.items.length > 0
        ? <ColumnsDiagram   items={diagram.items}  accent={accent} />
        : <EmptyNote type="columns" />;

    default:
      return <UnknownNote type={diagram.type} />;
  }
}
