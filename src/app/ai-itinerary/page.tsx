
"use client";

import { useState } from 'react';
import ItineraryForm from '@/components/ai/itinerary-form';
import { suggestItinerary } from '@/ai/flows/ai-itinerary-suggestions';
import type { AiItinerarySuggestionsInput, AiItinerarySuggestionsOutput } from '@/ai/flows/ai-itinerary-suggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Sparkles, CalendarDays, Copy, Sunrise, Sun, Moon, Utensils, Plane, Hotel, ShoppingBag, Beer, Landmark, Trees, FerrisWheel, Ship, TramFront, Building, MountainSnow, Briefcase } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Data structures for parsed itinerary
interface TimeBlock {
  period: string; // "Morning", "Afternoon", "Evening", "Lunch", or a general activity title
  description: string;
  icon?: React.ElementType; // Lucide icon component
}

interface ParsedDay {
  title: string; // "Day 1", "Trip Overview"
  introduction?: string; // General text for the day before specific blocks
  timeBlocks: TimeBlock[];
}

// Icon mapping function
const getPeriodIcon = (text: string): React.ElementType | undefined => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("morning")) return Sunrise;
  if (lowerText.includes("afternoon")) return Sun;
  if (lowerText.includes("evening") || lowerText.includes("night")) return Moon;
  if (lowerText.includes("breakfast") || lowerText.includes("brunch") || lowerText.includes("lunch") || lowerText.includes("dinner") || lowerText.includes("supper") || lowerText.includes("food") || lowerText.includes("restaurant")) return Utensils;
  if (lowerText.includes("airport") || lowerText.includes("flight")) return Plane;
  if (lowerText.includes("hotel") || lowerText.includes("check-in") || lowerText.includes("check in") || lowerText.includes("accommodation")) return Hotel;
  if (lowerText.includes("tour") || lowerText.includes("sightseeing") || lowerText.includes("visit")) return Landmark;
  if (lowerText.includes("museum")) return Building;
  if (lowerText.includes("shop") || lowerText.includes("mall") || lowerText.includes("market")) return ShoppingBag;
  if (lowerText.includes("bar") || lowerText.includes("club") || lowerText.includes("lounge")) return Beer;
  if (lowerText.includes("park") || lowerText.includes("garden")) return Trees;
  if (lowerText.includes("beach") || lowerText.includes("swim") || lowerText.includes("sea")) return MountainSnow; // Using MountainSnow as proxy for beach/water
  if (lowerText.includes("ferris wheel") || lowerText.includes("eye")) return FerrisWheel;
  if (lowerText.includes("cruise") || lowerText.includes("boat") || lowerText.includes("yacht") || lowerText.includes("abra")) return Ship;
  if (lowerText.includes("metro") || lowerText.includes("transport") || lowerText.includes("train") || lowerText.includes("bus") || lowerText.includes("taxi")) return TramFront;
  if (lowerText.includes("work") || lowerText.includes("meeting")) return Briefcase;
  return undefined;
};

// Helper function to parse a single day's content into time blocks
function parseIntoTimeBlocks(dayContent: string): { introduction?: string, blocks: TimeBlock[] } {
  if (!dayContent?.trim()) return { blocks: [] };

  const blocks: TimeBlock[] = [];
  const lines = dayContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let introduction = "";
  let currentBlock: TimeBlock | null = null;
  let firstBlockProcessed = false;

  const periodKeywords = ["morning", "afternoon", "evening", "night", "breakfast", "brunch", "lunch", "dinner", "supper"];

  for (const line of lines) {
    let isPeriodMarker = false;
    let period = "";

    for (const keyword of periodKeywords) {
      if (line.toLowerCase().startsWith(keyword) && (line.endsWith(":") || line.endsWith("-") || line.toLowerCase() === keyword || line.toLowerCase().startsWith(keyword + ":") || line.toLowerCase().startsWith(keyword + " -") )) {
        isPeriodMarker = true;
        period = line.match(new RegExp(`^(${keyword})`, 'i'))?.[0] || "";
        period = period.charAt(0).toUpperCase() + period.slice(1); // Capitalize
        break;
      }
    }
    
    if (isPeriodMarker) {
      if (currentBlock) { // Finalize previous block
         if (currentBlock.description.trim()) blocks.push(currentBlock);
      } else if (introduction) {
        // If there was intro content and now we hit a period marker, this is the first real block
      }
      
      currentBlock = {
        period: period,
        description: line.substring(line.indexOf(period) + period.length).replace(/^[\s:-]+/, '').trim(),
        icon: getPeriodIcon(period)
      };
      firstBlockProcessed = true;

    } else if (currentBlock) { // Append to current block's description
      currentBlock.description = (currentBlock.description ? currentBlock.description + "\n" : "") + line;
    } else if (!firstBlockProcessed) { // Content before any recognized period marker
        introduction = (introduction ? introduction + "\n" : "") + line;
    } else { // Should not happen often, but if there's content after all blocks and no new marker.
        // For safety, create a general block or append to last. Here, create new general block.
         if (currentBlock) { // Finalize previous block
            if (currentBlock.description.trim()) blocks.push(currentBlock);
         }
         currentBlock = { period: '', description: line, icon: getPeriodIcon(line) };
    }
  }

  if (currentBlock && currentBlock.description.trim()) { // Add the last processed block
    blocks.push(currentBlock);
  }
  
  // If no specific blocks found but there's intro content, put it as a single general block
  if (blocks.length === 0 && introduction.trim()) {
    blocks.push({ period: '', description: introduction.trim(), icon: getPeriodIcon(introduction.trim()) });
    introduction = ""; // Clear intro as it's now a block
  }
  
  // Ensure icons for blocks that might not have gotten one (e.g. period: '')
  blocks.forEach(block => {
    if (!block.icon) {
      block.icon = getPeriodIcon(block.period || block.description);
    }
  });

  return { introduction: introduction.trim() || undefined, blocks: blocks.filter(b => b.description.trim()) };
}


// Main parsing function for the entire itinerary text
function parseItineraryStructure(itineraryText: string | undefined | null): ParsedDay[] {
  if (!itineraryText?.trim()) return [];

  const parsedDaysResult: ParsedDay[] = [];
  const daySplitRegex = /(Day\s+\d+\s*[:-]?\s*)/gi;
  const dayParts = itineraryText.split(daySplitRegex);

  let overallIntroContent = "";
  if (dayParts.length > 0 && !dayParts[0].match(daySplitRegex)) {
    overallIntroContent = dayParts.shift()?.trim() || "";
  }

  if (overallIntroContent) {
    const { introduction, blocks } = parseIntoTimeBlocks(overallIntroContent);
    parsedDaysResult.push({ title: "Trip Overview", introduction, timeBlocks: blocks });
  }

  for (let i = 0; i < dayParts.length; i += 2) {
    const titleCandidate = dayParts[i]?.trim();
    const contentCandidate = dayParts[i + 1]?.trim();

    if (titleCandidate) {
      const cleanedTitle = titleCandidate.replace(/\s*[:\-\s]*$/, '');
      const { introduction, blocks } = parseIntoTimeBlocks(contentCandidate || "");
      parsedDaysResult.push({ title: cleanedTitle, introduction, timeBlocks: blocks });
    }
  }
  
  if (parsedDaysResult.length === 0 && itineraryText.trim()) {
    const { introduction, blocks } = parseIntoTimeBlocks(itineraryText);
    return [{ title: "Your Itinerary Plan", introduction, timeBlocks: blocks }];
  }

  return parsedDaysResult;
}


export default function AiItineraryPage() {
  const [itinerary, setItinerary] = useState<AiItinerarySuggestionsOutput | null>(null);
  const [parsedDays, setParsedDays] = useState<ParsedDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: AiItinerarySuggestionsInput) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setParsedDays([]); 

    try {
      const result = await suggestItinerary(data);
      setItinerary(result);
      if (result?.itinerary) {
        setParsedDays(parseItineraryStructure(result.itinerary));
      } else {
        setParsedDays([]);
      }
    } catch (err) {
      console.error("Error generating itinerary:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
      setParsedDays([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (itinerary?.itinerary) {
      navigator.clipboard.writeText(itinerary.itinerary)
        .then(() => {
          toast({
            title: "Itinerary Copied!",
            description: "The travel plan has been copied to your clipboard.",
            duration: 3000,
          });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy the itinerary. Please try again.",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold mb-2">AI Itinerary Planner</h1>
        <p className="text-muted-foreground text-lg">
          Let our AI craft a personalized Dubai itinerary just for you!
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            Tell Us About Your Dream Trip
          </CardTitle>
          <CardDescription>
            Provide your interests, trip duration, and budget, and our AI will suggest a plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItineraryForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Generating Itinerary</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Your Itinerary...</CardTitle>
            <CardDescription>Our AI is hard at work. This might take a moment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-8 w-1/2 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {itinerary && !isLoading && parsedDays.length > 0 && (
        <Card className="shadow-lg bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-2xl font-headline text-primary">Your Personalized Dubai Itinerary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Itinerary
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={parsedDays[0]?.title}>
              {parsedDays.map((day, index) => (
                <AccordionItem value={day.title || `day-${index}`} key={index} className="border-b-border last:border-b-0">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline text-primary hover:bg-primary/10 rounded-md px-4 py-3 text-left">
                    <div className="flex items-center">
                      <CalendarDays className="w-5 h-5 mr-3 text-accent flex-shrink-0" />
                      <span>{day.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-4 space-y-4">
                    {day.introduction && (
                       <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 whitespace-pre-line pb-2 mb-2 border-b border-border/50">
                          {day.introduction}
                       </div>
                    )}
                    {day.timeBlocks.map((block, blockIndex) => (
                      <div key={blockIndex} className="pl-2">
                        {(block.period || block.icon) && (
                           <h4 className="text-md font-semibold text-foreground/90 mb-1 flex items-center">
                            {block.icon && <block.icon className="w-5 h-5 mr-2 text-accent flex-shrink-0" />}
                            {block.period}
                          </h4>
                        )}
                        <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 whitespace-pre-line ml-1">
                          {block.description}
                        </div>
                      </div>
                    ))}
                     {/* Fallback if no intro and no blocks but day exists */}
                    {!day.introduction && day.timeBlocks.length === 0 && (
                       <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 whitespace-pre-line">
                          No specific activities listed for this section.
                       </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {itinerary && !isLoading && parsedDays.length === 0 && (
         <Card className="shadow-lg bg-card border-border">
          <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-2xl font-headline text-primary">Your Personalized Dubai Itinerary</CardTitle>
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary w-full sm:w-auto"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Itinerary
                  </Button>
              </div>
          </CardHeader>
          <CardContent>
             <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 whitespace-pre-line">
                {itinerary.itinerary} {/* Fallback for completely unparsable itinerary */}
              </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}


    