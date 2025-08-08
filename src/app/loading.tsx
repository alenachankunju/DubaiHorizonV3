import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
      <h1 className="text-3xl font-headline font-semibold text-primary mb-2">Loading Your Adventure...</h1>
      <p className="text-lg text-muted-foreground">Please wait while we fetch the details.</p>
    </div>
  );
}
