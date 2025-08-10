import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description?: string;
  buttonText?: string;
  badgeText?: string;
  isOutOfStock?: boolean;
}

export function ProductCard({
  imageSrc,
  imageAlt,
  title,
  description,
  buttonText,
  badgeText,
  isOutOfStock = false,
}: ProductCardProps) {
  return (
    <div className="relative bg-white text-primary rounded-lg shadow-md overflow-hidden group">
      {badgeText && (
        <span
          className={`absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full z-10 ${
            isOutOfStock ? "bg-red-500" : "bg-primary-pink"
          }`}
        >
          {badgeText}
        </span>
      )}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={imageAlt}
        width={300}
        height={300}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
        {buttonText && (
          <Button className="mt-4 bg-primary-pink hover:bg-primary-pink/90 text-white rounded-full px-6 py-2">
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
