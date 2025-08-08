import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Clock } from 'lucide-react';

const packages = [
  {
    image: 'https://placehold.co/600x400.png',
    title: '5-Day Dubai Deluxe Tour',
    price: '$799',
    duration: '5 Nights / 6 Days',
    hint: 'dubai skyline',
  },
  {
    image: 'https://placehold.co/600x400.png',
    title: 'Family Fun Package',
    price: '$650',
    duration: '4 Nights / 5 Days',
    hint: 'family fun',
  },
  {
    image: 'https://placehold.co/600x400.png',
    title: 'Arabian Adventure Week',
    price: '$950',
    duration: '6 Nights / 7 Days',
    hint: 'desert adventure',
  },
];

export default function PopularPackages() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">Popular Packages & Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative h-56">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={pkg.hint}
                />
                 <div className="absolute bottom-0 left-0 bg-primary/80 text-primary-foreground p-2 rounded-tr-lg">
                  <p className="font-bold text-xl">{`From ${pkg.price}`}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl font-headline mb-2">{pkg.title}</CardTitle>
                <CardDescription className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {pkg.duration}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 bg-muted/20">
                <Button asChild className="w-full">
                  <Link href="/destinations">View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
