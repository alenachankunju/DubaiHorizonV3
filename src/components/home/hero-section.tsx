
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-[calc(100vh-4rem)] md:min-h-[500px] lg:min-h-[600px] -mt-8">
      <Image
        src="/assets/desert-horseback-ride.jpg"
        alt="Dubai Night Lights"
        fill
        style={{ objectFit: "cover" }}
        priority
        className="brightness-75"
        data-ai-hint="dubai night"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/40 p-4">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 shadow-lg">
          Discover Dubai Horizon
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl shadow-md">
          Explore iconic landmarks, thrilling adventures, and luxurious experiences in the city of dreams.
        </p>
        <Link href="/destinations">
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-xl transition-transform hover:scale-105">
            Explore Destinations
          </Button>
        </Link>
      </div>
    </section>
  );
}
