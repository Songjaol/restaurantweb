import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Restaurant } from "./RestaurantCard";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { MapPin, Star, X, Globe, Phone } from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RestaurantDetailProps {
  restaurant: Restaurant;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RestaurantDetail({
  restaurant,
  userName,
  isOpen,
  onClose,
}: RestaurantDetailProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogDescription>
            {restaurant.category} · {restaurant.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ✅ 이미지 */}
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            <ImageWithFallback
              src={
                restaurant.imageUrl ||
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
              }
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* ✅ 기본 정보 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{restaurant.category}</h3>
                <p className="text-gray-600 mt-1">
                  {restaurant.address || "주소 정보 없음"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-gray-700 mt-2">
              {restaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>{restaurant.phone}</span>
                </div>
              )}

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
            </div>

            {/* ✅ 지역 태그 */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{restaurant.region}</Badge>
            </div>
          </div>

          <Separator />

          {/* ✅ 리뷰 작성 */}
          <ReviewForm
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            userName={userName}
            onReviewSubmitted={handleReviewSubmitted}
          />

          <Separator />

          {/* ✅ 리뷰 목록 */}
          <ReviewList
            restaurantId={restaurant.id}
            currentUserName={userName}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
