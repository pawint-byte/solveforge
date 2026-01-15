import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  ListTodo, 
  Users, 
  Heart, 
  GraduationCap, 
  DollarSign, 
  Palette, 
  Leaf,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  CheckCircle2
} from "lucide-react";

const questions = [
  {
    question: "What topic excites you most right now?",
    options: [
      "Games & Fun",
      "Productivity & Organization",
      "Social & Communication",
      "Health & Fitness",
      "Learning & Education",
      "Money & Finance",
      "Creative Tools (art, music, writing)",
      "Environment / Sustainability"
    ]
  },
  {
    question: "What kind of users do you want to help?",
    options: [
      "Myself / personal use",
      "Friends & family",
      "Students / learners",
      "Small business owners",
      "Gamers",
      "People who want to be healthier",
      "Artists & creators",
      "Everyone (very general)"
    ]
  },
  {
    question: "Which best describes your favorite apps to use?",
    options: [
      "Colorful & playful (games, social media)",
      "Clean & minimal (todo lists, calendars)",
      "Data-heavy (trackers, analytics)",
      "Very visual (photo/video editing)",
      "AI-powered or smart features",
      "Simple & fast utility tools"
    ]
  },
  {
    question: "How much do you like working with...",
    options: [
      "Photos, videos, design",
      "Text, stories, journaling",
      "Numbers, budgets, stats",
      "Maps & location features",
      "Multiplayer / real-time interaction",
      "AI / smart suggestions"
    ]
  }
];

const categoryIcons: Record<string, typeof Gamepad2> = {
  game: Gamepad2,
  productivity: ListTodo,
  social: Users,
  health: Heart,
  education: GraduationCap,
  finance: DollarSign,
  creative: Palette,
  eco: Leaf
};

const categoryLabels: Record<string, string> = {
  game: "Games & Fun",
  productivity: "Productivity",
  social: "Social",
  health: "Health & Fitness",
  education: "Education",
  finance: "Finance",
  creative: "Creative",
  eco: "Sustainability"
};

const appIdeas: Record<string, string[]> = {
  game: [
    "A simple endless runner game with cute characters",
    "Trivia battle game with friends (multiplayer)",
    "Daily mini-puzzle game that teaches a new fact"
  ],
  productivity: [
    "Smart habit tracker with reminders & streaks",
    "Minimalist to-do list with AI-suggested priorities",
    "Focus timer (Pomodoro) with mood logging"
  ],
  social: [
    "Anonymous compliment sender for friends",
    "Group event planner with polls & calendar sync",
    "Local hobby meetup finder"
  ],
  health: [
    "Water & step tracker with fun animations",
    "Mood journal + simple CBT prompts",
    "Quick 5-minute workout randomizer"
  ],
  education: [
    "Flashcard app for any subject (with spaced repetition)",
    "Language phrase-of-the-day with pronunciation",
    "Math puzzle generator for kids"
  ],
  finance: [
    "Expense splitter for roommates/trips",
    "Simple budget visualizer with pie charts",
    "Savings goal tracker with progress bars"
  ],
  creative: [
    "Random prompt generator for writers/artists",
    "Mood-based playlist + doodle canvas",
    "Collaborative story builder"
  ],
  eco: [
    "Carbon footprint calculator for daily habits",
    "Local recycling guide + points system",
    "Plant care reminder & growth journal"
  ]
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handleStartOver = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setQuizComplete(false);
  };

  const calculateResults = () => {
    const categories: Record<string, number> = {
      game: 0,
      productivity: 0,
      social: 0,
      health: 0,
      education: 0,
      finance: 0,
      creative: 0,
      eco: 0
    };

    // Exact match of original Streamlit scoring logic - OR conditions per category
    if (answers[0]?.includes("Games") || answers[1]?.includes("Gamers") || answers[2]?.includes("playful")) {
      categories.game += 2;
    }
    if (answers[0]?.includes("Productivity") || answers[0]?.includes("Organization") || answers[2]?.includes("todo")) {
      categories.productivity += 2;
    }
    if (answers[0]?.includes("Social") || answers[0]?.includes("Communication") || answers[3]?.includes("multiplayer")) {
      categories.social += 2;
    }
    if (answers[0]?.includes("Health") || answers[0]?.includes("Fitness") || answers[1]?.includes("healthier")) {
      categories.health += 2;
    }
    if (answers[0]?.includes("Learning") || answers[0]?.includes("Education") || answers[1]?.includes("learners")) {
      categories.education += 2;
    }
    if (answers[0]?.includes("Money") || answers[0]?.includes("Finance") || answers[3]?.includes("budgets")) {
      categories.finance += 2;
    }
    if (answers[0]?.includes("Creative") || answers[0]?.includes("art") || answers[2]?.includes("visual")) {
      categories.creative += 2;
    }
    if (answers[0]?.includes("Environment") || answers[0]?.includes("Sustainability")) {
      categories.eco += 2;
    }

    // AI bonus - adds 1 to all categories (exact match of original)
    if (answers[3]?.includes("AI") || answers[2]?.includes("smart")) {
      Object.keys(categories).forEach(k => categories[k] += 1);
    }

    const sorted = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    return sorted;
  };

  const getIdeas = (topCategories: [string, number][]) => {
    const ideas: string[] = [];
    topCategories.forEach(([cat]) => {
      if (appIdeas[cat]) {
        ideas.push(...appIdeas[cat]);
      }
    });
    return shuffleArray(ideas).slice(0, 6);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (quizComplete) {
    const topCategories = calculateResults();
    const ideas = getIdeas(topCategories);

    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" data-testid="text-results-title">
                Quiz Complete!
              </h1>
              <p className="text-muted-foreground text-lg" data-testid="text-results-subtitle">
                Here's what you might love building...
              </p>
            </div>

            <Card className="mb-8 rounded-2xl shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" data-testid="text-interests-header">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Your Top Interests
                </h2>
                <div className="space-y-4">
                  {topCategories.map(([cat, score], index) => {
                    const Icon = categoryIcons[cat] || Sparkles;
                    return (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                        data-testid={`interest-${cat}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-lg" data-testid={`text-interest-name-${cat}`}>{categoryLabels[cat]}</span>
                        </div>
                        <Badge variant="secondary" className="text-sm" data-testid={`badge-score-${cat}`}>
                          {score} points
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 rounded-2xl shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" data-testid="text-ideas-header">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Suggested App Ideas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/30"
                      data-testid={`idea-${index}`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed" data-testid={`text-idea-${index}`}>{idea}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-xl p-4 mb-8 text-center">
              <p className="text-muted-foreground text-sm" data-testid="text-hint-mvp">
                These are starting points — pick one that excites you most and start small (MVP)!
              </p>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleStartOver}
                className="gap-2"
                data-testid="button-start-over"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" data-testid="text-quiz-title">
            App Idea Generator Quiz
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto" data-testid="text-quiz-description">
            Take this short quiz to discover what kind of app you might enjoy building!
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 sm:p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span data-testid="text-question-progress">Question {currentQuestion + 1} of {questions.length}</span>
                <span data-testid="text-progress-percent">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" data-testid="progress-bar" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl sm:text-2xl font-semibold mb-8" data-testid="text-current-question">
                  {question.question}
                </h2>

                <RadioGroup
                  value={selectedOption || ""}
                  onValueChange={setSelectedOption}
                  className="flex flex-col gap-4"
                  data-testid="radio-group-options"
                >
                  {question.options.map((option, index) => (
                    <motion.div
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center gap-4 w-full min-h-[60px] px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-150 hover-elevate active-elevate-2 ${
                          selectedOption === option
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                        data-testid={`label-option-${index}`}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          data-testid={`radio-option-${index}`}
                          className="flex-shrink-0"
                        />
                        <span className="font-medium" data-testid={`text-option-${index}`}>{option}</span>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-end items-center">
              {selectedOption === null && (
                <p className="text-sm text-muted-foreground sm:mr-auto" data-testid="text-select-hint">
                  Please select an option to continue
                </p>
              )}
              <Button
                size="lg"
                disabled={selectedOption === null}
                onClick={handleNext}
                className="gap-2 min-w-[200px] w-full sm:w-auto"
                data-testid="button-next"
              >
                {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
