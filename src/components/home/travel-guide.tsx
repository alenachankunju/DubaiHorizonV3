import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Shirt, Coins } from 'lucide-react';
import Link from 'next/link';

const guides = [
  {
    icon: <Thermometer className="w-8 h-8 text-primary" />,
    title: 'Best Time to Visit Dubai',
    description: 'Learn about Dubai’s climate to plan your trip during the most pleasant weather.',
  },
  {
    icon: <Shirt className="w-8 h-8 text-primary" />,
    title: 'Local Etiquette & Dress Code',
    description: 'Understand the cultural norms to ensure a respectful and smooth experience.',
  },
  {
    icon: <Coins className="w-8 h-8 text-primary" />,
    title: 'Top Free Things To Do',
    description: 'Discover amazing attractions and activities that won’t cost you a dirham.',
  },
];

export default function TravelGuide() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">Dubai Travel Guide & Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex-row items-center gap-4">
                {guide.icon}
                <CardTitle className="font-headline text-xl">{guide.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{guide.description}</p>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" asChild>
                  <Link href="#">Read More</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
