import { Card, CardContent } from "./ui/card";
import { Smile, Frown, Angry, Battery, Zap, Heart, Coffee, Sun } from "lucide-react";

export type Mood = 
  | "happy"
  | "sad"
  | "stressed"
  | "tired"
  | "energetic"
  | "romantic"
  | "casual"
  | "excited";

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

const moods = [
  { id: "happy" as Mood, label: "행복해요", icon: Smile, color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
  { id: "sad" as Mood, label: "우울해요", icon: Frown, color: "bg-blue-100 hover:bg-blue-200 border-blue-300" },
  { id: "stressed" as Mood, label: "스트레스", icon: Zap, color: "bg-red-100 hover:bg-red-200 border-red-300" },
  { id: "tired" as Mood, label: "피곤해요", icon: Battery, color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
  { id: "energetic" as Mood, label: "활기차요", icon: Sun, color: "bg-orange-100 hover:bg-orange-200 border-orange-300" },
  { id: "romantic" as Mood, label: "로맨틱", icon: Heart, color: "bg-pink-100 hover:bg-pink-200 border-pink-300" },
  { id: "casual" as Mood, label: "편안해요", icon: Coffee, color: "bg-green-100 hover:bg-green-200 border-green-300" },
  { id: "excited" as Mood, label: "신나요!", icon: Angry, color: "bg-purple-100 hover:bg-purple-200 border-purple-300" },
];

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-center">지금 기분이 어떠세요?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <Card
              key={mood.id}
              className={`cursor-pointer transition-all border-2 ${
                isSelected 
                  ? "ring-4 ring-orange-400 scale-105" 
                  : mood.color
              }`}
              onClick={() => onMoodSelect(mood.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Icon className="w-8 h-8" />
                <span className="text-center">{mood.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
