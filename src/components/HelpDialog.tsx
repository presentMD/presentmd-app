import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MARP_EXAMPLES = {
  basic: `---
title: "My Presentation"
theme: default
marp: true
paginate: true
author: "Your Name"
---

# Welcome to My Presentation

A subtitle for the title slide

---

## Slide with Content

- Bullet point 1
- Bullet point 2
- **Bold text** and *italic text*

---

### Code Examples

\`\`\`javascript
function hello() {
  console.log("Hello My Presentation!");
}
\`\`\`

---

![bg](https://example.com/image.jpg)

# Background Image Slide

Text over background image`,

  advanced: `---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://example.com/bg.jpg')
---

<!-- _class: lead -->
# Advanced Slide Features

---

<!-- _backgroundColor: aqua -->
## Custom Background Color

This slide has a custom background

---

<!-- _color: red -->
## Custom Text Color

Red text on this slide

---

## Two Column Layout

<div class="columns">
<div>

### Left Column
- Point 1
- Point 2

</div>
<div>

### Right Column
- Point A
- Point B

</div>
</div>

---

## Math Formulas

Inline math: $E = mc^2$

Block math:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

---

## Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\``,

  directives: `---
marp: true
theme: default
---

<!-- Slide-specific directives start with underscore -->

<!-- _class: lead -->
# Lead Style Slide

---

<!-- _backgroundColor: #1e3a8a -->
<!-- _color: white -->
## Blue Background Slide

White text on blue background

---

<!-- _paginate: false -->
## No Page Number

This slide won't show page numbers

---

![bg left](image.jpg)

## Split Layout

Background image on the left,
content on the right

---

![bg fit](image.jpg)

## Fitted Background

Image fits within slide bounds

---

<!-- footer: "My Footer Text" -->
## Footer Added

All following slides will have footer

---

<!-- header: "Chapter 1" -->
## Header Added

Header appears on this and following slides`
};

const THEME_EXAMPLES = {
  custom: `/* Custom Theme Example */
@import 'default';

/* @theme custom-theme */

section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Roboto', sans-serif;
  padding: 70px;
}

section h1 {
  font-size: 3em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 0.5em;
}

section h2 {
  font-size: 2.2em;
  color: #ffd700;
  border-bottom: 3px solid #ffd700;
  padding-bottom: 10px;
}

section ul {
  font-size: 1.4em;
  line-height: 1.8;
}

section code {
  background: rgba(255,255,255,0.2);
  padding: 0.3em 0.6em;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
}

section blockquote {
  border-left: 5px solid #ffd700;
  background: rgba(255,255,255,0.1);
  padding: 1em;
  margin: 1em 0;
  font-style: italic;
}`,

  variables: `/* Theme with CSS Variables */
/* @theme variable-theme */

:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --text-color: #1f2937;
  --background-color: #ffffff;
  --accent-color: #f59e0b;
}

section {
  background: var(--background-color);
  color: var(--text-color);
  font-family: 'Inter', sans-serif;
}

section h1 {
  color: var(--primary-color);
  font-size: 2.5em;
}

section h2 {
  color: var(--secondary-color);
  border-bottom: 2px solid var(--accent-color);
}

section a {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid var(--accent-color);
}

section strong {
  color: var(--secondary-color);
  font-weight: 600;
}`,

  classes: `/* Theme with Custom Classes */
/* @theme class-theme */

section {
  background: #f8fafc;
  color: #334155;
  font-family: 'Source Sans Pro', sans-serif;
}

/* Lead class for title slides */
section.lead {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: linear-gradient(45deg, #0f172a, #1e293b);
  color: white;
}

section.lead h1 {
  font-size: 4em;
  font-weight: 900;
  margin-bottom: 0.2em;
}

/* Invert class for dark slides */
section.invert {
  background: #1e293b;
  color: #f1f5f9;
}

/* Two column layout */
section .columns {
  display: flex;
  gap: 2em;
}

section .columns > div {
  flex: 1;
}

/* Highlight box */
section .highlight {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  padding: 1em;
  border-radius: 8px;
  margin: 1em 0;
}`
};

export default function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CodeBlock = ({ code, label }: { code: string; label: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, label)}
      >
        {copiedCode === label ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Marp Markdown Guide</DialogTitle>
          <DialogDescription>
            Complete guide to Marp markdown syntax and theme customization
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="syntax" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="syntax">Markdown Syntax</TabsTrigger>
            <TabsTrigger value="themes">Theme Styling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="syntax" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Presentation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every Marp presentation starts with YAML frontmatter and uses <code>---</code> to separate slides.
                  </p>
                  <CodeBlock code={MARP_EXAMPLES.basic} label="Basic Example" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Slide Directives</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use HTML comments with underscores to apply settings to individual slides.
                  </p>
                  <CodeBlock code={MARP_EXAMPLES.directives} label="Directives Example" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Advanced Features</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Marp supports math formulas, diagrams, and advanced layouts.
                  </p>
                  <CodeBlock code={MARP_EXAMPLES.advanced} label="Advanced Example" />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>Frontmatter:</strong> YAML configuration at the top</li>
                    <li><strong>Slide separator:</strong> <code>---</code> creates new slides</li>
                    <li><strong>Directives:</strong> <code>&lt;!-- _property: value --&gt;</code> for slide-specific settings</li>
                    <li><strong>Background images:</strong> <code>![bg](image.jpg)</code></li>
                    <li><strong>Split layouts:</strong> <code>![bg left](image.jpg)</code></li>
                    <li><strong>Math:</strong> <code>$inline$</code> or <code>$$block$$</code></li>
                    <li><strong>Classes:</strong> <code>&lt;!-- _class: lead --&gt;</code></li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="themes" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Custom Theme</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create custom themes using CSS. Use <code>/* @theme theme-name */</code> to define the theme name.
                  </p>
                  <CodeBlock code={THEME_EXAMPLES.custom} label="Custom Theme" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">CSS Variables Theme</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use CSS variables for maintainable and consistent theming.
                  </p>
                  <CodeBlock code={THEME_EXAMPLES.variables} label="Variables Theme" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Class-Based Theme</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define custom classes that can be applied to individual slides.
                  </p>
                  <CodeBlock code={THEME_EXAMPLES.classes} label="Classes Theme" />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Theme Usage:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>Built-in themes:</strong> <code>theme: default</code>, <code>theme: space</code>, <code>theme: desert</code></li>
                    <li><strong>Custom theme URL:</strong> <code>theme: 'https://example.com/theme.css'</code></li>
                    <li><strong>Slide classes:</strong> <code>&lt;!-- _class: lead invert --&gt;</code></li>
                    <li><strong>Background colors:</strong> <code>&lt;!-- _backgroundColor: #ff0000 --&gt;</code></li>
                    <li><strong>Text colors:</strong> <code>&lt;!-- _color: white --&gt;</code></li>
                    <li><strong>Target elements:</strong> <code>section</code>, <code>section h1</code>, <code>section p</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Custom Themes:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>Use custom CSS URLs for external themes</li>
                    <li>Find more themes on GitHub and use their CDN URLs</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}