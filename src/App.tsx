import { useState } from "react";
import { ProfileSetup } from "./components/ProfileSetup";
import { MoodSelector, Mood } from "./components/MoodSelector";
import { RestaurantList } from "./components/RestaurantList";
import { Restaurant } from "./components/RestaurantCard";
import { RestaurantDetail } from "./components/RestaurantDetail";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Settings, Utensils, Search, MapPin } from "lucide-react";

interface UserProfile {
  name: string;
  cuisinePreferences: string[];
  priceRange: string;
  dietaryRestrictions: string[];
}

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleBackToMoodSelection = () => {
    setSelectedMood(null);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCloseDetail = () => {
    setSelectedRestaurant(null);
  };

  const handleSearch = async () => {
  if (!searchQuery.trim()) return;

  setIsLoading(true);
  setHasSearched(true);
  setRestaurants([]);

  let retryCount = 0;
  const maxRetries = 10; // 최대 10회 재시도 (약 10초)
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  try {
    while (retryCount < maxRetries) {
      const response = await fetch(
        `http://localhost:8081/restaurants?region=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        console.error("Spring 서버 요청 실패:", response.statusText);
        break;
      }

      const data = await response.json();
      console.log("서버 응답 개수:", data.length);
      console.log("ID 목록:", data.map((r: any) => r.id));
      if (Array.isArray(data) && data.length > 0) {
        // ✅ 데이터가 생기면 즉시 렌더링
        const restaurantsWithImages = data.map((r: Restaurant) => ({
          ...r,
          imageUrl:
            r.imageUrl ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        }));
        setRestaurants(restaurantsWithImages);
        setIsLoading(false);
        return; // ✅ 종료
      }

      // 🕐 데이터가 아직 없으면 1초 후 다시 시도
      retryCount++;
      await delay(1000);
    }

    // 10초 동안 데이터가 안 오면 “검색 결과 없음”
    setIsLoading(false);
    setRestaurants([]);
  } catch (error) {
    console.error("Error fetching from Spring Boot:", error);
    setIsLoading(false);
    setRestaurants([]);
  }
};


  const getFilteredRestaurants = (): Restaurant[] => {
    if (!userProfile) return restaurants;

    let filtered = restaurants;

    // Filter by cuisine preferences
    if (userProfile.cuisinePreferences.length > 0) {
      const cuisineMap: { [key: string]: string[] } = {
        korean: ["한식", "한국음식"],
        japanese: ["일식", "일본음식"],
        chinese: ["중식", "중국음식"],
        western: ["양식", "서양음식"],
        italian: ["이탈리안", "이탈리아음식"],
        dessert: ["디저트", "카페", "베이커리"],
      };

      const acceptedCuisines = userProfile.cuisinePreferences.flatMap(
        (pref) => cuisineMap[pref] || []
      );

      // More flexible filtering - if cuisine contains any of the keywords
      filtered = filtered.filter((restaurant) =>
      acceptedCuisines.some((cuisine) => 
      (restaurant.category && restaurant.category.includes(cuisine)) ||
      (cuisine && cuisine.includes(restaurant.category))
      )
      );

    }

    // Apply mood-based sorting if mood is selected
    if (selectedMood) {
      const moodCuisineMap: { [key in Mood]: string[] } = {
        happy: ["일식", "이탈리안", "디저트", "카페"],
        sad: ["한식", "양식", "디저트", "카페"],
        stressed: ["한식", "중식", "양식"],
        tired: ["한식", "중식"],
        energetic: ["이탈리안", "중식", "양식"],
        romantic: ["일식", "이탈리안"],
        casual: ["양식", "디저트", "카페"],
        excited: ["중식", "한식", "양식"],
      };

      const preferredCuisines = moodCuisineMap[selectedMood];
      
      // Sort restaurants to prioritize mood-matching cuisines
      filtered = [...filtered].sort((a, b) => {
      const aMatches = preferredCuisines.some(cuisine => a.category?.includes(cuisine));
      const bMatches = preferredCuisines.some(cuisine => b.category?.includes(cuisine));

        
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  if (!userProfile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-orange-500" />
            <h1>무드푸드</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">{userProfile.name}님</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUserProfile(null)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-orange-500" />
            <h2>어디서 맛집을 찾으시나요?</h2>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="지역을 입력하세요 (예: 강남, 홍대, 신촌)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "검색 중..." : "검색"}
            </Button>
          </div>
        </div>

        {/* Mood Selector - Optional */}
        {hasSearched && restaurants.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-4">
              <h2>오늘 기분은 어때요? (선택사항)</h2>
              <p className="text-gray-600 text-sm mt-1">
                기분에 따라 맛집을 추천해드립니다
              </p>
            </div>
            <MoodSelector
              onMoodSelect={handleMoodSelect}
              selectedMood={selectedMood}
            />
            {selectedMood && (
              <Button
                variant="outline"
                onClick={() => setSelectedMood(null)}
                className="mt-4"
              >
                기분 선택 취소
              </Button>
            )}
          </div>
        )}

        {/* Restaurant List */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">맛집을 검색하는 중...</p>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {restaurants.length === 0 
                    ? "검색 결과가 없습니다. 다른 지역을 검색해보세요."
                    : "선호도에 맞는 맛집이 없습니다. 프로필 설정을 변경해보세요."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2>
                    {selectedMood 
                      ? `${getMoodText(selectedMood)} 기분에 딱 맞는 맛집` 
                      : `${searchQuery}`}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {filteredRestaurants.length}개의 맛집을 찾았습니다
                  </p>
                </div>
                <RestaurantList
                  restaurants={filteredRestaurants}
                  mood={selectedMood}                // ✅ 추가
                  userName={userProfile.name}        // ✅ 추가
                  onRestaurantClick={handleRestaurantClick}
                />
              </>
            )}
          </div>
        )}

        {/* Welcome Message */}
        {!hasSearched && (
          <div className="text-center py-12">
            <Utensils className="w-20 h-20 text-orange-400 mx-auto mb-4" />
            <h2 className="text-gray-700 mb-2">환영합니다, {userProfile.name}님!</h2>
            <p className="text-gray-600">
              지역을 검색하여 주변 맛집을 찾아보세요
            </p>
          </div>
        )}
      </div>

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetail
          restaurant={selectedRestaurant}
          userName={userProfile.name}
          isOpen={!!selectedRestaurant}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

function getMoodText(mood: Mood): string {
  const moodTexts: { [key in Mood]: string } = {
    happy: "행복한",
    sad: "우울한",
    stressed: "스트레스 받는",
    tired: "피곤한",
    energetic: "활기찬",
    romantic: "로맨틱한",
    casual: "편안한",
    excited: "신나는",
  };
  return moodTexts[mood];
  

}


export default App;
