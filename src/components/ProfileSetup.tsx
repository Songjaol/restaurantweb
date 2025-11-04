import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { User } from "lucide-react";

interface UserProfile {
  name: string;
  cuisinePreferences: string[];
  priceRange: string;
  dietaryRestrictions: string[];
}

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const cuisineOptions = [
  { id: "korean", label: "한식" },
  { id: "japanese", label: "일식" },
  { id: "chinese", label: "중식" },
  { id: "western", label: "양식" },
  { id: "italian", label: "이탈리안" },
  { id: "dessert", label: "디저트/카페" },
];

const dietaryOptions = [
  { id: "vegetarian", label: "채식" },
  { id: "vegan", label: "비건" },
  { id: "halal", label: "할랄" },
  { id: "gluten-free", label: "글루텐 프리" },
];

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("medium");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const handleCuisineToggle = (cuisineId: string) => {
    setCuisinePreferences((prev) =>
      prev.includes(cuisineId)
        ? prev.filter((id) => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const handleDietaryToggle = (dietaryId: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(dietaryId)
        ? prev.filter((id) => id !== dietaryId)
        : [...prev, dietaryId]
    );
  };

  const handleSubmit = () => {
    if (name && cuisinePreferences.length > 0) {
      onComplete({
        name,
        cuisinePreferences,
        priceRange,
        dietaryRestrictions,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              프로필 설정
            </CardTitle>
            <CardDescription>
              맞춤형 맛집 추천을 위해 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* 음식 선호도 */}
            <div className="space-y-3">
              <Label>선호하는 음식 종류 (복수 선택 가능)</Label>
              <div className="grid grid-cols-2 gap-3">
                {cuisineOptions.map((cuisine) => (
                  <div key={cuisine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine.id}
                      checked={cuisinePreferences.includes(cuisine.id)}
                      onCheckedChange={() => handleCuisineToggle(cuisine.id)}
                    />
                    <label
                      htmlFor={cuisine.id}
                      className="cursor-pointer select-none"
                    >
                      {cuisine.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 가격대 */}
            <div className="space-y-3">
              <Label>선호하는 가격대</Label>
              <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="cursor-pointer">
                    💰 저렴 (1만원 이하)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="cursor-pointer">
                    💰💰 보통 (1-3만원)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="cursor-pointer">
                    💰💰💰 고급 (3만원 이상)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 식단 제한 */}
            <div className="space-y-3">
              <Label>식단 제한 (선택사항)</Label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((dietary) => (
                  <div key={dietary.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={dietary.id}
                      checked={dietaryRestrictions.includes(dietary.id)}
                      onCheckedChange={() => handleDietaryToggle(dietary.id)}
                    />
                    <label
                      htmlFor={dietary.id}
                      className="cursor-pointer select-none"
                    >
                      {dietary.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name || cuisinePreferences.length === 0}
              className="w-full"
            >
              완료
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
