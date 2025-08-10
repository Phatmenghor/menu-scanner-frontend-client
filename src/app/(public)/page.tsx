import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/app/public/product-card";

export default function HomePage() {
  return (
    <div className="min-h-screen text-primary bg-gray-50">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] rounded-lg overflow-hidden">
            <Image
              src="/star-angel-carousel.png"
              alt="Star Angel Product Carousel"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                className=" bg-black/30 hover:bg-black/50 rounded-full"
              >
                {"<"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className=" bg-black/30 hover:bg-black/50 rounded-full"
              >
                {">"}
              </Button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <span className="w-2 h-2 rounded-full opacity-70"></span>
              <span className="w-2 h-2 rounded-full"></span>
              <span className="w-2 h-2 rounded-full opacity-70"></span>
              <span className="w-2 h-2 rounded-full opacity-70"></span>
            </div>
          </div>
        </section>

        {/* LICK FAMILY Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-primary-pink">
            LICK FAMILY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              imageSrc="/placeholder-uz64k.png"
              imageAlt="Best Duo Combo Set"
              title="Best Duo"
              description="Description for Best Duo"
              buttonText="Combo Set"
            />
            <ProductCard
              imageSrc="/placeholder-65spu.png"
              imageAlt="Coquette Princess Bottle"
              title="Coquette Princess"
              description="Description for Coquette Princess"
              buttonText="Coquette Princess"
            />
            <ProductCard
              imageSrc="/placeholder-6fqle.png"
              imageAlt="Duckies 1000ml Bottles"
              title="Duckies 1000ml"
              description="Description for Duckies 1000ml"
            />
          </div>
          <div className="flex justify-center mt-8">
            <Button className="bg-primary-pink hover:bg-primary-pink/90  px-8 py-3 rounded-full flex items-center gap-2">
              View All <span className="text-xl">&rarr;</span>
            </Button>
          </div>
        </section>

        {/* BEST PRODUCT Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-primary-pink">
            BEST PRODUCT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCard
              imageSrc="/best-sellers-star-charm.png"
              imageAlt="Best Sellers Star Charm"
              title="Star Charm"
              badgeText="BEST SELLERS"
            />
            <ProductCard
              imageSrc="/snow-angel-bestsellers.png"
              imageAlt="Best Sellers Snow Angel"
              title="Snow Angel"
              badgeText="BEST SELLERS"
            />
            <ProductCard
              imageSrc="/best-sellers-superstar.png"
              imageAlt="Best Sellers Superstar"
              title="Superstar"
              badgeText="BEST SELLERS"
            />
            <ProductCard
              imageSrc="/placeholder-9w6r3.png"
              imageAlt="Out of Stock Monkey"
              title="Monkey"
              badgeText="OUT OF STOCK"
              isOutOfStock={true}
            />
          </div>
        </section>
      </main>

      {/* Floating Chat Button */}
      <Button className="fixed bottom-6 right-6 bg-primary-pink hover:bg-primary-pink/90 rounded-full p-4 shadow-lg flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Chat?
      </Button>
    </div>
  );
}
