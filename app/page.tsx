"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Trash2,
  Users,
  Sword,
  Shield,
  Zap,
  Eye,
  Brain,
  Heart,
  Diamond as Dragon,
  Skull,
  Gem,
  Loader2,
  TrendingUp,
  Edit,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

// --- CUSTOM ALERT DIALOG COMPONENT ---
function CustomAlertDialog({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-2xl text-primary glow-text">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-card-foreground">{description}</p>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">
            {onConfirm ? cancelText : "OK"}
          </Button>
          {onConfirm && (
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-primary hover:bg-primary/80"
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- DATA & COMPONENTS ---
interface ClassInfo {
  name: string;
  beginnerFriendly: boolean;
  strengths: string[];
  weaknesses: string[];
  tip: string;
  baseStats: {
    strength: number;
    agility: number;
    mana: number;
    dexterity: number;
    wisdom: number;
    health: number;
  };
}
const classData: Record<string, ClassInfo> = {
  Barbarian: {
    name: "Barbarian",
    beginnerFriendly: true,
    strengths: [
      "Massive health pool",
      "High physical damage",
      "Simple to play",
    ],
    weaknesses: [
      "No magical ability",
      "Vulnerable to ranged magic",
      "Lacks utility",
    ],
    tip: "Get in close and hit things hard. You're the party's tank.",
    baseStats: {
      strength: 25,
      agility: 10,
      mana: 5,
      dexterity: 10,
      wisdom: 5,
      health: 25,
    },
  },
  Mage: {
    name: "Mage",
    beginnerFriendly: true,
    strengths: ["High-impact spells", "Excellent mana pool", "Ranged control"],
    weaknesses: [
      "Low health (fragile)",
      "Weak in close combat",
      "Reliant on mana",
    ],
    tip: "Stay at a distance and use your spells to control the battlefield.",
    baseStats: {
      strength: 5,
      agility: 10,
      mana: 25,
      dexterity: 10,
      wisdom: 25,
      health: 5,
    },
  },
  Rogue: {
    name: "Rogue",
    beginnerFriendly: false,
    strengths: [
      "High single-target damage",
      "Excels at stealth & skills",
      "High evasion",
    ],
    weaknesses: [
      "Low health",
      "Can be complex",
      "Less effective in open combat",
    ],
    tip: "Use stealth and surprise attacks. Focus on disabling traps and picking locks.",
    baseStats: {
      strength: 10,
      agility: 25,
      mana: 5,
      dexterity: 25,
      wisdom: 10,
      health: 5,
    },
  },
  Bandit: {
    name: "Bandit",
    beginnerFriendly: false,
    strengths: [
      "High speed & evasion",
      "Good critical hit chance",
      "Versatile",
    ],
    weaknesses: [
      "Moderate health",
      "Weaker defenses",
      "Lower sustained damage",
    ],
    tip: "Focus on flanking enemies and striking when they are vulnerable.",
    baseStats: {
      strength: 15,
      agility: 20,
      mana: 5,
      dexterity: 20,
      wisdom: 5,
      health: 15,
    },
  },
};
function ClassInfoCard({ info }: { info: ClassInfo }) {
  return (
    <div className="p-4 border-2 border-accent rounded-lg bg-card/80 w-full md:w-72 shadow-lg animate-in fade-in duration-500">
      <h3 className="font-fantasy text-xl font-bold text-primary glow-text">
        {info.name}
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <span className="font-semibold text-sm">Difficulty:</span>
        {info.beginnerFriendly ? (
          <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" /> Beginner Friendly
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
            <AlertTriangle className="h-4 w-4" /> Intermediate
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="font-semibold text-sm text-primary">Strengths:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-card-foreground pl-2">
          {info.strengths.map((strength) => (
            <li key={strength}>{strength}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <p className="font-semibold text-sm text-destructive">Weaknesses:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-card-foreground pl-2">
          {info.weaknesses.map((weakness) => (
            <li key={weakness}>{weakness}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 p-3 bg-secondary/10 border border-secondary/50 rounded-lg">
        <p className="text-xs italic text-secondary-foreground">
          <span className="font-bold flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Tip:
          </span>{" "}
          {info.tip}
        </p>
      </div>
    </div>
  );
}

// --- INTERFACES & TYPES ---
type CharacterClass = keyof typeof classData;
const classPortraits: Record<CharacterClass, string> = {
  Mage: "/portraits/mage.png",
  Barbarian: "/portraits/barbarian.jpg",
  Rogue: "/portraits/rogue.jpg",
  Bandit: "/portraits/bandit.jpg",
};
interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  strength: number;
  agility: number;
  mana: number;
  dexterity: number;
  wisdom: number;
  health: number;
}
interface Party {
  name: string;
  members: Character[];
}
type EventType = "Dragon Fight" | "Ancient Trap" | "Mystic Puzzle";
interface GameEvent {
  id: string;
  name: EventType;
  description: string;
  icon: React.ReactNode;
  backgroundImage: string;
  difficulty: "Easy" | "Medium" | "Hard";
}
const getDifficultyColor = (
  difficulty: "Easy" | "Medium" | "Hard" | string
) => {
  switch (difficulty) {
    case "Easy":
      return "text-green-500";
    case "Medium":
      return "text-yellow-500";
    case "Hard":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};
const D20Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 8.5V15.5L12 22L22 15.5V8.5L12 2Z" />{" "}
    <path d="M2 8.5L12 12L22 8.5" /> <path d="M12 2V12" />{" "}
    <path d="M2 15.5L7 13.75" /> <path d="M22 15.5L17 13.75" />{" "}
    <path d="M12 22L7 19.25" /> <path d="M12 22L17 19.25" />
  </svg>
);

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  const [currentSection, setCurrentSection] = useState<
    "home" | "party" | "events"
  >("home");
  const [party, setParty] = useState<Party | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const mainContent = () => {
    switch (currentSection) {
      case "party":
        return (
          <PartySection
            onBack={() => setCurrentSection("home")}
            party={party}
            setParty={setParty}
            setAlertDialog={setAlertDialog}
            onGoToEvents={() => setCurrentSection("events")}
          />
        );
      case "events":
        return (
          <EventsSection
            onBack={() => setCurrentSection("home")}
            party={party}
            setAlertDialog={setAlertDialog}
          />
        );
      default:
        return (
          <HomeSection onSetSection={(section) => setCurrentSection(section)} />
        );
    }
  };

  return (
    <>
      <CustomAlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        description={alertDialog.description}
        onConfirm={alertDialog.onConfirm}
        onClose={() =>
          setAlertDialog({ isOpen: false, title: "", description: "" })
        }
      />
      {mainContent()}
    </>
  );
}

// --- HOME SECTION ---
function HomeSection({
  onSetSection,
}: {
  onSetSection: (section: "party" | "events") => void;
}) {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const rollDice = () => {
    if (isSpinning || isRevealing) return;
    setIsSpinning(true);
    setDiceValue(null);
    setTimeout(() => {
      setIsSpinning(false);
      setIsRevealing(true);
      setTimeout(() => {
        const roll = Math.floor(Math.random() * 20) + 1;
        setDiceValue(roll);
        setIsRevealing(false);
      }, 1500);
    }, 2000);
  };

  const toggleMusic = () => {
    const newMusicPlaying = !musicPlaying;
    setMusicPlaying(newMusicPlaying);
    if (audioRef.current) {
      if (newMusicPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <audio ref={audioRef} src="/music/fantasy-theme.mp3" loop />
      <div className="absolute inset-0 opacity-10 bg-[url('/medieval-parchment-texture-with-faint-castle-illus.jpg')] bg-cover bg-center" />
      <Button
        onClick={toggleMusic}
        className="fixed bottom-6 left-6 z-50 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full p-3"
        size="icon"
      >
        {musicPlaying ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 bg-accent hover:bg-accent/80 text-accent-foreground rounded-full p-2"
            size="sm"
          >
            <HelpCircle className="h-4 w-4 mr-1" /> Learn D&D
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-card border-2 border-border">
          <DialogHeader>
            <DialogTitle className="font-fantasy text-2xl text-primary glow-text">
              Dungeons & Dragons Guide
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-card-foreground leading-relaxed max-h-[70vh] overflow-y-auto pr-6">
            <p>
              Dungeons & Dragons (D&D) is a tabletop role-playing game where
              players create characters and embark on adventures guided by a
              Dungeon Master (DM). It's a game of imagination, strategy, and
              collaborative storytelling.
            </p>
            <div>
              <h3 className="font-fantasy text-lg text-primary mb-2">
                Core Concepts
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>
                  <strong>Characters:</strong> Players create heroes with unique
                  abilities, backgrounds, and personalities.
                </li>
                <li>
                  <strong>Classes:</strong> Different character types like
                  Warriors, Mages, Rogues, and Clerics.
                </li>
                <li>
                  <strong>Stats:</strong> Numerical values representing
                  character abilities (Strength, Agility, Health, etc.).
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-fantasy text-lg text-primary mb-2">
                Why Use an Optimizer?
              </h3>
              <p>
                The Hero Squad Optimizer helps players make strategic decisions.
                By analyzing party composition and enemy threats, it suggests
                the most effective actions to maximize your chances of success.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="font-fantasy text-6xl md:text-8xl font-bold text-primary mb-8 text-center glow-text">
          Hero Squad Optimizer
        </h1>
        <div className="mb-12 text-center h-16 flex items-center justify-center">
          <div
            onClick={rollDice}
            className="relative overflow-hidden inline-flex items-center justify-center p-4 rounded-lg bg-card/50 hover:bg-card/80 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-accent shadow-lg min-w-[300px] h-full"
          >
            {isSpinning ? (
              <div className="flex items-center gap-3 text-secondary-foreground">
                <D20Icon className="h-6 w-6 animate-spin text-primary" />
                <span className="font-semibold text-lg">
                  Deciding your fate...
                </span>
              </div>
            ) : isRevealing ? (
              <>
                <Wand2 className="h-8 w-8 text-primary absolute animate-sweep" />
                <span className="font-semibold text-lg text-secondary-foreground/50">
                  Revealing...
                </span>
              </>
            ) : diceValue !== null ? (
              <p className="font-fantasy text-2xl text-primary animate-in fade-in zoom-in-50 duration-500">
                Fate has decided: {diceValue}
              </p>
            ) : (
              <div className="flex items-center gap-3 text-secondary-foreground">
                <D20Icon className="h-6 w-6" />
                <span className="font-semibold text-lg">
                  Click to discover your fate
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <Button
            onClick={() => onSetSection("party")}
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-lg border-2 border-accent shadow-lg hover:shadow-xl transition-all"
          >
            Create Party
          </Button>
          <Button
            onClick={() => onSetSection("events")}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-4 text-lg font-semibold rounded-lg border-2 border-primary shadow-lg hover:shadow-xl transition-all"
          >
            Choose Events
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- PARTY SECTION ---
function PartySection({
  onBack,
  party,
  setParty,
  setAlertDialog,
  onGoToEvents,
}: {
  onBack: () => void;
  party: Party | null;
  setParty: (party: Party | null) => void;
  setAlertDialog: (dialogState: any) => void;
  onGoToEvents: () => void;
}) {
  const [partyName, setPartyName] = useState(party?.name || "");
  const [memberCount, setMemberCount] = useState(party?.members.length || 1);
  const [characters, setCharacters] = useState<Character[]>(
    party?.members || []
  );
  const [isCreating, setIsCreating] = useState(!party);

  const createNewCharacter = (
    charClass: CharacterClass = "Mage"
  ): Character => ({
    id: Math.random().toString(36).substr(2, 9),
    name: "",
    class: charClass,
    ...classData[charClass].baseStats,
  });

  const handleMemberCountChange = (count: number) => {
    setMemberCount(count);
    const currentCharacters = [...characters];
    const newCharacters = Array.from({ length: count }, (_, i) => {
      return currentCharacters[i] || createNewCharacter();
    });
    setCharacters(newCharacters);
  };

  const updateCharacterStat = (
    index: number,
    field: keyof Character,
    value: string | number
  ) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handleCharacterClassChange = (
    index: number,
    newClass: CharacterClass
  ) => {
    const updated = [...characters];
    updated[index] = {
      ...updated[index],
      class: newClass,
      ...classData[newClass].baseStats,
    };
    setCharacters(updated);
  };

  const getTotalPoints = (character: Character): number =>
    character.strength +
    character.agility +
    character.mana +
    character.dexterity +
    character.wisdom +
    character.health;

  const isValidPointAllocation = (character: Character): boolean =>
    getTotalPoints(character) <= 80;

  const saveParty = () => {
    if (!partyName.trim()) {
      setAlertDialog({
        isOpen: true,
        title: "Party Name Required",
        description: "Please enter a name for your party.",
      });
      return;
    }
    if (characters.some((char) => !char.name.trim())) {
      setAlertDialog({
        isOpen: true,
        title: "Character Name Required",
        description: "Please make sure every character has a name.",
      });
      return;
    }
    if (characters.some((char) => !isValidPointAllocation(char))) {
      setAlertDialog({
        isOpen: true,
        title: "Invalid Point Allocation",
        description: `At least one character has exceeded the maximum of 80 points.`,
      });
      return;
    }
    setParty({ name: partyName, members: characters });
    setIsCreating(false);
  };

  const deleteParty = () => {
    setAlertDialog({
      isOpen: true,
      title: "Delete Party",
      description: "Are you sure you want to delete this party forever?",
      onConfirm: () => {
        setParty(null);
        setIsCreating(true);
        setPartyName("");
        setCharacters([]);
        setMemberCount(1);
      },
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/medieval-parchment-texture-with-faint-castle-illus.jpg')] bg-cover bg-center" />
      <div className="relative z-10 p-8">
        <Button
          onClick={onBack}
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground absolute top-8 left-8"
        >
          ← Back to Home
        </Button>
        {!isCreating && party ? (
          <div className="max-w-4xl mx-auto space-y-8 pt-16">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-fantasy text-4xl md:text-6xl text-primary glow-text">
                Party: {party.name}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                  className="border-accent text-accent-foreground hover:bg-accent/80"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Party
                </Button>
                <Button
                  onClick={deleteParty}
                  className="bg-destructive hover:bg-destructive/80"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Party
                </Button>
                <Button
                  onClick={onGoToEvents}
                  className="bg-primary hover:bg-primary/80"
                >
                  Choose Events <Sword className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            {party.members.map((member) => (
              <Card
                key={member.id}
                className="bg-card/90 backdrop-blur border-2 border-primary shadow-xl"
              >
                <CardHeader>
                  <CardTitle className="font-fantasy text-xl text-primary flex justify-between items-center">
                    <span>{member.name}</span>
                    <span className="text-sm font-sans font-medium bg-secondary/20 border border-secondary text-secondary-foreground px-3 py-1 rounded-full">
                      {member.class}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Strength",
                      value: member.strength,
                      icon: <Sword className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                      label: "Agility",
                      value: member.agility,
                      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                      label: "Mana",
                      value: member.mana,
                      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                      label: "Dexterity",
                      value: member.dexterity,
                      icon: (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      ),
                    },
                    {
                      label: "Wisdom",
                      value: member.wisdom,
                      icon: <Brain className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                      label: "Health",
                      value: member.health,
                      icon: <Heart className="h-4 w-4 text-muted-foreground" />,
                    },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center gap-2">
                      {icon} <strong>{label}:</strong> {value}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <h1 className="font-fantasy text-4xl md:text-6xl text-primary mb-8 text-center glow-text pt-16">
              {party ? "Edit Your Party" : "Create Your Party"}
            </h1>
            <div className="max-w-7xl mx-auto space-y-8">
              <Card className="bg-card/90 backdrop-blur border-2 border-accent shadow-xl">
                <CardHeader>
                  <CardTitle className="font-fantasy text-xl text-primary">
                    Party Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <Label className="font-semibold flex items-center gap-1 mb-2">
                      <Users className="h-4 w-4" /> Party Name
                    </Label>
                    <Input
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder="Name your legendary party..."
                    />
                  </div>
                  <div>
                    <Label className="font-semibold flex items-center gap-1 mb-2">
                      <Users className="h-4 w-4" /> Number of Members
                    </Label>
                    <Select
                      value={String(memberCount)}
                      onValueChange={(value) =>
                        handleMemberCountChange(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} Member{num > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              {characters.map((character, index) => (
                <Card
                  key={character.id}
                  className="bg-card/90 backdrop-blur border-2 border-primary shadow-xl"
                >
                  <CardHeader>
                    <CardTitle className="font-fantasy text-xl text-primary">
                      Character {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col xl:flex-row items-start gap-6">
                      <div className="flex-grow w-full space-y-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={classPortraits[character.class]}
                            alt={`${character.class} portrait`}
                            className="h-24 w-24 rounded-lg border-2 border-accent object-cover shadow-lg"
                          />
                          <div className="flex-grow space-y-4">
                            <div>
                              <Label className="font-semibold">Name</Label>
                              <Input
                                value={character.name}
                                onChange={(e) =>
                                  updateCharacterStat(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Character name..."
                              />
                            </div>
                            <div>
                              <Label className="font-semibold">Class</Label>
                              <Select
                                value={character.class}
                                onValueChange={(value) =>
                                  handleCharacterClassChange(
                                    index,
                                    value as CharacterClass
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(classData).map((className) => (
                                    <SelectItem
                                      key={className}
                                      value={className}
                                    >
                                      {className}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            {
                              key: "strength",
                              label: "Strength",
                              icon: <Sword className="h-4 w-4" />,
                            },
                            {
                              key: "agility",
                              label: "Agility",
                              icon: <Eye className="h-4 w-4" />,
                            },
                            {
                              key: "mana",
                              label: "Mana",
                              icon: <Zap className="h-4 w-4" />,
                            },
                            {
                              key: "dexterity",
                              label: "Dexterity",
                              icon: <Shield className="h-4 w-4" />,
                            },
                            {
                              key: "wisdom",
                              label: "Wisdom",
                              icon: <Brain className="h-4 w-4" />,
                            },
                            {
                              key: "health",
                              label: "Health",
                              icon: <Heart className="h-4 w-4" />,
                            },
                          ].map(({ key, label, icon }) => (
                            <div key={key}>
                              <Label className="font-semibold flex items-center gap-1">
                                {icon} {label}
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="80"
                                value={
                                  character[
                                    key as keyof Omit<
                                      Character,
                                      "id" | "name" | "class"
                                    >
                                  ]
                                }
                                onChange={(e) =>
                                  updateCharacterStat(
                                    index,
                                    key as keyof Character,
                                    Number.parseInt(e.target.value) || 1
                                  )
                                }
                                className={
                                  !isValidPointAllocation(character)
                                    ? "border-destructive ring-destructive"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-full xl:w-auto">
                        {classData[character.class] && (
                          <ClassInfoCard info={classData[character.class]} />
                        )}
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Points:</span>
                        <span
                          className={`font-bold ${
                            getTotalPoints(character) > 80
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {getTotalPoints(character)} / 80
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center">
                <Button
                  onClick={saveParty}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-4 text-lg font-semibold"
                >
                  {party ? "Save Changes" : "Create Party"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- EVENTS SECTION ---
function EventsSection({
  onBack,
  party,
  setAlertDialog,
}: {
  onBack: () => void;
  party: Party | null;
  setAlertDialog: (dialogState: any) => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [showAdventure, setShowAdventure] = useState(false);

  const events: GameEvent[] = [
    {
      id: "dragon-fight",
      name: "Dragon Fight",
      description: "Face the mighty Ancient Red Dragon in its volcanic lair.",
      icon: <Dragon className="h-12 w-12" />,
      backgroundImage: "/events/dragon-lair.jpeg",
      difficulty: "Hard",
    },
    {
      id: "ancient-trap",
      name: "Ancient Trap",
      description:
        "Navigate a dungeon filled with deadly traps and mechanisms.",
      icon: <Skull className="h-12 w-12" />,
      backgroundImage: "/events/dungeon-trap.jpeg",
      difficulty: "Medium",
    },
    {
      id: "mystic-puzzle",
      name: "Mystic Puzzle",
      description:
        "Solve the riddles of the Crystal Chamber to claim your prize.",
      icon: <Gem className="h-12 w-12" />,
      backgroundImage: "/events/crystal-cave.jpeg",
      difficulty: "Easy",
    },
  ];

  const handleEventSelect = (event: GameEvent) => {
    if (!party || party.members.length === 0) {
      setAlertDialog({
        isOpen: true,
        title: "Party Required",
        description: "You must create a party before starting an adventure!",
      });
      return;
    }
    setSelectedEvent(event);
    setShowAdventure(true);
  };

  if (showAdventure && selectedEvent) {
    return (
      <AdventureScreen
        event={selectedEvent}
        party={party}
        onBack={() => setShowAdventure(false)}
        setAlertDialog={setAlertDialog}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/medieval-parchment-texture-with-faint-castle-illus.jpg')] bg-cover bg-center" />
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            ← Back to Home
          </Button>
          {party && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Party</p>
              <p className="font-fantasy text-lg text-primary">{party.name}</p>
            </div>
          )}
        </div>
        <h1 className="font-fantasy text-4xl md:text-6xl text-primary mb-8 text-center glow-text">
          Choose Your Adventure
        </h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-card/90 backdrop-blur border-2 border-accent shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-primary group cursor-pointer hover:scale-105"
              onClick={() => handleEventSelect(event)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-6 bg-primary/10 rounded-full border-4 border-accent group-hover:border-primary transition-colors group-hover:bg-primary/20">
                  <div className="text-primary group-hover:text-accent transition-colors">
                    {event.icon}
                  </div>
                </div>
                <CardTitle className="font-fantasy text-2xl text-primary group-hover:glow-text transition-all">
                  {event.name}
                </CardTitle>
                <div
                  className={`text-sm font-bold ${getDifficultyColor(
                    event.difficulty
                  )}`}
                >
                  {event.difficulty}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground text-center leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
                  disabled={!party}
                >
                  Begin Adventure
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- ADVENTURE SCREEN ---
// Helper function to get the enemy name for the UI
const getEncounterEnemy = (eventName: EventType): string => {
  switch (eventName) {
    case "Dragon Fight":
      return "Ancient Red Dragon";
    case "Ancient Trap":
      return "Mechanical Guardian";
    case "Mystic Puzzle":
      return "Crystal Golem";
    default:
      return "Unknown Foe";
  }
};

function AdventureScreen({
  event,
  party,
  onBack,
  setAlertDialog,
}: {
  event: GameEvent;
  party: Party | null;
  onBack: () => void;
  setAlertDialog: (dialogState: any) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    party_success_chance: number;
    encounter_difficulty: string;
    strategic_recommendations: string[];
    current_turn_actions: string[];
    individual_success_rates: {
      character: string;
      success_rate: number;
      recommended_action: string;
    }[];
  } | null>(null);
  const [currentTurnCharacter, setCurrentTurnCharacter] = useState<string>("");

  const handleOptimizeActions = async () => {
    if (!party || !currentTurnCharacter) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const requestBody = {
        party: party.members,
        encounter: { event_type: event.name },
        current_turn_character: currentTurnCharacter,
      };
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("Server response was not ok.");
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      setAlertDialog({
        isOpen: true,
        title: "Analysis Failed",
        description: "Could not retrieve strategic analysis. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuccessColor = (rate: number): string => {
    if (rate >= 70) return "text-green-500";
    if (rate >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-1000"
        style={{ backgroundImage: `url('${event.backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background/70" />
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            ← Back to Events
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Encounter</p>
            <p className="font-fantasy text-lg text-primary">{event.name}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* --- THIS IS THE CORRECTED CARD WITH THE MISSING UI --- */}
          <Card className="bg-card/95 backdrop-blur border-2 border-accent shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-primary/10 rounded-full border-2 border-accent">
                {event.icon}
              </div>
              <CardTitle className="font-fantasy text-3xl text-primary glow-text">
                {event.name}
              </CardTitle>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {event.description}
              </p>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 p-6">
              <div className="p-4 border rounded-lg bg-background/50">
                <h3 className="font-fantasy text-xl text-primary mb-2">
                  Your Party
                </h3>
                <div className="space-y-1">
                  {party?.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="font-semibold">{member.name}</span>
                      <span className="text-muted-foreground">
                        {member.class}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-background/50">
                <h3 className="font-fantasy text-xl text-primary mb-2">
                  Encounter Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Difficulty:</span>
                    <span className={getDifficultyColor(event.difficulty)}>
                      {event.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Party Size:</span>
                    <span>{party?.members.length} heroes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Enemy:</span>
                    <span className="text-destructive">
                      {getEncounterEnemy(event.name)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 p-6 pt-0">
              <div className="w-full border-t pt-4">
                <div className="max-w-md mx-auto">
                  <Label className="text-sm font-semibold mb-2 block text-center">
                    Current Turn Character
                  </Label>
                  <Select
                    value={currentTurnCharacter}
                    onValueChange={setCurrentTurnCharacter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character for current turn" />
                    </SelectTrigger>
                    <SelectContent>
                      {party?.members.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} ({member.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleOptimizeActions}
                disabled={isAnalyzing || !currentTurnCharacter}
                className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 text-base font-semibold"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-5 w-5 mr-2" />
                )}
                Optimize Actions
              </Button>
              <p className="text-xs text-muted-foreground">
                Analyze your party's best strategy for this encounter
              </p>
            </CardFooter>
          </Card>

          {analysisResult && (
            <Card className="bg-card/95 backdrop-blur border-2 border-primary shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="font-fantasy text-2xl text-primary flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" /> AI Strategic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Predicted Party Success Chance
                  </h3>
                  <div
                    className={`text-4xl font-bold mb-2 ${getSuccessColor(
                      analysisResult.party_success_chance
                    )}`}
                  >
                    {analysisResult.party_success_chance}%
                  </div>
                  <Progress
                    value={analysisResult.party_success_chance}
                    className="w-full max-w-md mx-auto h-3"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Encounter Difficulty: {analysisResult.encounter_difficulty}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Individual Analysis
                  </h3>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {analysisResult.individual_success_rates?.map((rate) => (
                      <div
                        key={rate.character}
                        className="p-3 bg-muted/30 rounded-lg border"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">
                            {rate.character}
                          </span>
                          <span
                            className={`font-bold text-sm ${getSuccessColor(
                              rate.success_rate
                            )}`}
                          >
                            {rate.success_rate}% Success
                          </span>
                        </div>
                        <Progress value={rate.success_rate} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Recommended Action:</strong>{" "}
                          {rate.recommended_action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> Overall
                      Strategy
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.strategic_recommendations?.map(
                        (rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20"
                          >
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-primary" /> Actions for{" "}
                      {currentTurnCharacter}
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.current_turn_actions?.map(
                        (rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20"
                          >
                            <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
