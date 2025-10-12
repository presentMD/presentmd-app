import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertTriangle, X } from 'lucide-react';
import { useLLM } from '@/contexts/LLMContext';
import { useToast } from '@/hooks/use-toast';
import { handleLLMError } from '@/lib/errorHandler';

interface MinimalAIAssistantProps {
  currentSlideContent: string;
  onModifySlide: (modifiedContent: string) => void;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  "Improve this slide",
  "Make it more engaging",
  "Add bullet points",
  "Simplify the content",
  "Add a call-to-action",
  "Fix grammar and style"
];

export default function MinimalAIAssistant({ 
  currentSlideContent, 
  onModifySlide, 
  onClose 
}: MinimalAIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateText, isSupported, error } = useLLM();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to modify the slide.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const enhancedPrompt = `Here is a current markdown of a slide: 
${currentSlideContent}

Please suggest new markdown content for this slide based on the following ask: 
${prompt}

For easy parsing please provide in the response just clean markdown text for the new slide to replace current content`;
      
      const modifiedContent = await generateText(enhancedPrompt);
      onModifySlide(modifiedContent);
      toast({
        title: "Slide modified",
        description: "The slide has been updated with your changes.",
      });
    } catch (err) {
      handleLLMError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setPrompt(action);
  };

  if (!isSupported) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI features require WebGPU support. Please use a modern browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Textarea
            placeholder="Describe how you want to modify this slide..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
            disabled={isGenerating}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              size="sm"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Modifying...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3" />
                  Modify Slide
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={isGenerating}
                className="text-xs h-7 px-2"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
