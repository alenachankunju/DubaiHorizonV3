import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const experiences = [
  {
    image: 'https://placehold.co/600x400.png',
    title: 'Burj Khalifa – At The Top',
    subtitle: '2 hrs • Observation Deck',
    price: '$35',
    hint: 'skyscraper city',
  },
  {
    image: 'https://placehold.co/600x400.png',
    title: 'Desert Safari Adventure',
    subtitle: '6 hrs • Dune Bashing & BBQ',
    price: '$55',
    hint: 'desert camel',
  },
  {
    image: 'https://placehold.co/600x400.png',
    title: 'The Dubai Mall',
    subtitle: 'Full Day • Shopping & Aquarium',
    price: 'Free Entry',
    hint: 'shopping mall',
  },
];

export default function TopExperiences() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">Top Experiences in Dubai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative h-56">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={exp.hint}
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl font-headline mb-1">{exp.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{exp.subtitle}</p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center bg-muted/20">
                <p className="text-lg font-semibold text-primary">{exp.price.startsWith('$') ? `From ${exp.price}` : exp.price}</p>
                <Button asChild>
                  <Link href="/destinations">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
