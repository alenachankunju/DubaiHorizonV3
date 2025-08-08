import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Compass, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <AlertTriangle className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-5xl font-headline font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Oops! The page you're looking for doesn't seem to exist. It might have been moved or deleted.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">
            <Compass className="mr-2 h-5 w-5" /> Go to Homepage
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/destinations">
            Explore Destinations
          </Link>
        </Button>
      </div>
    </div>
  )
}
