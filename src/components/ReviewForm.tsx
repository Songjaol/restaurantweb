import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Star, Send } from "lucide-react";

interface ReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  userName: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ restaurantId, restaurantName, userName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      setError("별점과 리뷰 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { projectId, publicAnonKey } = await import("../utils/supabase/info");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef6ca5a0/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            restaurantId,
            userName,
            rating,
            comment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Reset form
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err instanceof Error ? err.message : "리뷰 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>리뷰 작성</CardTitle>
        <CardDescription>{restaurantName}에 대한 리뷰를 남겨주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <Label>별점</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">리뷰 내용</Label>
          <Textarea
            id="comment"
            placeholder="음식, 서비스, 분위기 등에 대한 솔직한 후기를 남겨주세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? "제출 중..." : "리뷰 작성"}
        </Button>
      </CardContent>
    </Card>
  );
}
