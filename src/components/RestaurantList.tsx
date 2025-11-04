import { RestaurantCard, Restaurant } from "./RestaurantCard";
import { Mood } from "./MoodSelector";

interface RestaurantListProps {
  restaurants: Restaurant[];
  mood: Mood | null;
  userName: string;
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export function RestaurantList({ restaurants, mood, userName, onRestaurantClick }: RestaurantListProps) {
  const getMoodMessage = (mood: Mood | null) => {
    switch (mood) {
      case "happy":
        return "행복한 하루를 더욱 즐겁게 만들어줄";
      case "sad":
        return "기분을 북돋아줄 따뜻한";
      case "stressed":
        return "스트레스를 날려버릴 맛있는";
      case "tired":
        return "피로를 풀어줄 든든한";
      case "energetic":
        return "활기찬 에너지를 더해줄";
      case "romantic":
        return "로맨틱한 분위기의";
      case "casual":
        return "편안하게 즐길 수 있는";
      case "excited":
        return "신나는 경험을 선사할";
      default:
        return "맞춤형";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2>
          {userName}님을 위한 {getMoodMessage(mood)} 맛집
        </h2>
        <p className="text-gray-600">
          총 {restaurants.length}개의 추천 맛집
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>추천할 맛집이 없습니다.</p>
          <p>다른 기분을 선택해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard 
              key={`${restaurant.id}-${restaurant.name}-${restaurant.address}`} 
              restaurant={restaurant}
              onClick={() => onRestaurantClick(restaurant)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
