import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Star, ThumbsUp, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
}

interface ReviewListProps {
  restaurantId: string;
  currentUserName: string;
  refreshTrigger: number;
}

export function ReviewList({ restaurantId, currentUserName, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  const fetchReviews = async () => {
    try {
      const { projectId, publicAnonKey } = await import("../utils/supabase/info");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef6ca5a0/reviews/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);

      // Check which reviews the current user has liked
      const likedSet = new Set<string>();
      for (const review of data.reviews || []) {
        const likeResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ef6ca5a0/reviews/${review.id}/liked/${currentUserName}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        const likeData = await likeResponse.json();
        if (likeData.liked) {
          likedSet.add(review.id);
        }
      }
      setLikedReviews(likedSet);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, refreshTrigger]);

  const handleLikeToggle = async (reviewId: string) => {
    try {
      const { projectId, publicAnonKey } = await import("../utils/supabase/info");
      const isLiked = likedReviews.has(reviewId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef6ca5a0/reviews/${reviewId}/like`,
        {
          method: isLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userName: currentUserName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();

      // Update local state
      setLikedReviews((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(reviewId);
        } else {
          newSet.add(reviewId);
        }
        return newSet;
      });

      // Update review likes count
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, likes: data.likes } : review
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        리뷰를 불러오는 중...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>아직 리뷰가 없습니다.</p>
        <p>첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3>리뷰 ({reviews.length})</h3>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">{review.comment}</p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={likedReviews.has(review.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLikeToggle(review.id)}
                  disabled={review.userName === currentUserName}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  도움됨 {review.likes > 0 && `(${review.likes})`}
                </Button>
                {review.userName === currentUserName && (
                  <span className="text-gray-400">내 리뷰</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
