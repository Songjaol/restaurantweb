import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Phone, Globe } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string;
  x: number;
  y: number;
  region: string;
  placeUrl: string;
  imageUrl?: string; // 없으면 기본이미지 사용
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 이미지 섹션 */}
      <div className="aspect-video w-full overflow-hidden bg-gray-200">
        <ImageWithFallback
          src={
            restaurant.imageUrl ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
          }
          alt={restaurant.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* 제목 및 카테고리 */}
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{restaurant.name}</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {restaurant.category || "카테고리 정보 없음"}
        </CardDescription>
      </CardHeader>

      {/* 본문 */}
      <CardContent className="space-y-3 text-gray-700">
        {/* 주소 */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>{restaurant.address}</span>
        </div>

        {/* 전화번호 */}
        {restaurant.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-500" />
            <span>{restaurant.phone}</span>
          </div>
        )}

        {/* 카카오맵 링크 */}
        {restaurant.placeUrl && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-500" />
            <a
              href={restaurant.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              카카오맵에서 보기
            </a>
          </div>
        )}

        {/* 지역 태그 */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{restaurant.region}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
