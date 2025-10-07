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
  basic: `# Welcome to My Presentation

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

![bg](/images/NASA-main_image_star-forming_region_carina_nircam_final-5mb.jpeg)

# Background Image Slide

Text over background image`,

  advanced: `<!-- _class: lead -->
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

  directives: `<!-- Slide-specific directives start with underscore -->

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

![bg left](/images/keith-hardy-PP8Escz15d8-unsplash.jpg)

## Split Layout

Background image on the left,
content on the right

---

![bg fit](/images/wiki-commons-caravan-in-the-desert.jpg)

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

/* Alternative column styling */
.columns {
  display: flex;
  justify-content: space-between;
}

.columns > div {
  width: 48%;
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
          <DialogTitle>Presentation Markdown Guide</DialogTitle>
          <DialogDescription>
            Complete guide to markdown syntax and theme customization for presentations. 
            Built on <a href="https://marp.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Marp</a> - 
            learn more at <a href="https://marpit.marp.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">marpit.marp.app</a>
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
                    Start with your content directly. Use <code>---</code> to separate slides. 
                    <strong>No YAML metadata required!</strong> Themes are controlled via the theme selector in the editor panel.
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
                    Marp supports math formulas, diagrams, and advanced layouts. All themes include built-in column support.
                  </p>
                  <CodeBlock code={MARP_EXAMPLES.advanced} label="Advanced Example" />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>Slide separator:</strong> <code>---</code> creates new slides</li>
                    <li><strong>Directives:</strong> <code>&lt;!-- _property: value --&gt;</code> for slide-specific settings</li>
                    <li><strong>Background images:</strong> <code>![bg](image.jpg)</code>, <code>![bg left](image.jpg)</code>, <code>![bg fit](image.jpg)</code></li>
                    <li><strong>Columns:</strong> <code>&lt;div class="columns"&gt;</code> - built into all themes</li>
                    <li><strong>Math:</strong> <code>$inline$</code> or <code>$$block$$</code></li>
                    <li><strong>Classes:</strong> <code>&lt;!-- _class: lead --&gt;</code></li>
                    <li><strong>Themes:</strong> Use the theme selector in the editor panel</li>
                    <li><strong>No YAML required:</strong> Start writing immediately, themes are visual</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="themes" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Theme Philosophy</h3>
                  <div className="text-sm text-muted-foreground mb-3 space-y-2">
                    <p>
                      <strong>No YAML metadata required!</strong> This makes presentation development faster and more intuitive. 
                      Instead of writing configuration files, you:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Select themes visually with the theme selector button</li>
                      <li>See the current theme's CSS in the theme panel</li>
                      <li>Edit CSS directly for instant customization</li>
                      <li>Start writing content immediately without setup</li>
                    </ul>
                    <p>
                      The theme panel always shows the current theme in CSS format, making it easy to understand and modify styles on the fly.
                    </p>
                  </div>
                </div>

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
                    <li><strong>Built-in themes:</strong> Default, Space, Desert (select from theme dropdown)</li>
                    <li><strong>Custom theme URL:</strong> Enter CSS URL in the custom theme option</li>
                    <li><strong>Live CSS editing:</strong> Modify the theme panel CSS directly for instant changes</li>
                    <li><strong>Slide classes:</strong> <code>&lt;!-- _class: lead invert --&gt;</code></li>
                    <li><strong>Background colors:</strong> <code>&lt;!-- _backgroundColor: #ff0000 --&gt;</code></li>
                    <li><strong>Text colors:</strong> <code>&lt;!-- _color: white --&gt;</code></li>
                    <li><strong>Target elements:</strong> <code>section</code>, <code>section h1</code>, <code>section p</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Workflow Benefits:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li><strong>No configuration files:</strong> Start writing content immediately</li>
                    <li><strong>Visual theme selection:</strong> See themes before applying them</li>
                    <li><strong>Live CSS editing:</strong> Real-time theme customization</li>
                    <li><strong>External themes:</strong> Use CDN URLs for community themes</li>
                    <li><strong>Learn more:</strong> Visit <a href="https://marp.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">marp.app</a> for advanced features</li>
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