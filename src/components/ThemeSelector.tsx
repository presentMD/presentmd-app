import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Palette, Check, Globe } from "lucide-react";

const OFFICIAL_THEMES = [
  { name: "Default", value: "default", url: "@/themes/default.css" },
  { name: "Gaia", value: "gaia", url: "@/themes/gaia.css" },
  { name: "Uncover", value: "uncover", url: "@/themes/uncover.css" },
];

const COMMUNITY_THEMES = [
  { name: "Dracula", value: "dracula", url: "@/themes/dracula.css" },
];

const OUR_THEMES = [
  { name: "Space", value: "space", url: "@/themes/space.css" },
  { name: "Desert", value: "desert", url: "@/themes/desert.css" },
];

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const getCurrentThemeName = () => {
  const our = OUR_THEMES.find(t => t.value === currentTheme);
  if (our) return our.name;

  const official = OFFICIAL_THEMES.find(t => t.value === currentTheme);
  if (official) return official.name;

  const community = COMMUNITY_THEMES.find(t => t.value === currentTheme);
  if (community) return community.name;

    if (currentTheme.startsWith("http")) return "Custom Theme";
    return currentTheme;
  };

  const handleCustomTheme = () => {
    if (customUrl.trim()) {
      onThemeChange(customUrl.trim());
      setCustomUrl("");
      setShowCustomInput(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Theme: {getCurrentThemeName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Select Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">Our Themes</DropdownMenuLabel>
        {OUR_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="flex items-center justify-between"
          >
            <span>{theme.name}</span>
            {currentTheme === theme.value && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Official Themes</DropdownMenuLabel>
        {OFFICIAL_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="flex items-center justify-between"
          >
            <span>{theme.name}</span>
            {currentTheme === theme.value && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">Community Themes</DropdownMenuLabel>
        {COMMUNITY_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="flex items-center justify-between"
          >
            <span>{theme.name}</span>
            {currentTheme === theme.value && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setShowCustomInput(!showCustomInput)} className="gap-2">
          <Globe className="w-4 h-4" />
          Custom Theme URL
        </DropdownMenuItem>
        
        {showCustomInput && (
          <div className="p-2 space-y-2">
            <Input
              placeholder="https://..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => setShowCustomInput(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCustomTheme}>
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Syntax: <code>theme: 'https://...'</code>
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}