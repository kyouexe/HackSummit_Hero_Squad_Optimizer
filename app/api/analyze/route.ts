import { type NextRequest, NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import * as fs from "fs";
import * as path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- INTERFACES (Unchanged) ---
interface Character {
  name: string;
  type: string;
  strength: number;
  agility: number;
  health: number;
  mana?: number;
  dexterity?: number;
  wisdom?: number;
}
interface Encounter {
  event_type: string;
}

// --- INITIALIZE MODELS ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const genaiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

function fileSystemLoadHandler(): tf.io.ModelArtifacts {
  const modelPath = path.join(process.cwd(), "models", "party-optimizer-model");
  const modelJson = JSON.parse(
    fs.readFileSync(path.join(modelPath, "model.json"), "utf-8")
  );
  const modelTopology = modelJson.modelTopology;
  const weightSpecs = modelJson.weightsManifest[0].weights;
  const weightsBuffer = fs.readFileSync(path.join(modelPath, "weights.bin"));
  const weightData = new Uint8Array(weightsBuffer).buffer;
  return { modelTopology, weightSpecs, weightData };
}

// --- FIX: Implement a robust, promise-based model loader ---
// This creates a promise that resolves with the loaded model or null on error.
const modelPromise: Promise<tf.LayersModel | null> = (async () => {
  try {
    const model = await tf.loadLayersModel({
      load: () => Promise.resolve(fileSystemLoadHandler()),
    });
    console.log("✅ Party Optimizer model loaded successfully!");
    return model;
  } catch (error) {
    console.error("❌ Error loading TensorFlow model:", error);
    return null; // Return null if loading fails
  }
})();

// --- DATA PREPARATION & TFJS ANALYSIS ---
function prepareDataForModel(
  party: Character[],
  encounter: Encounter
): number[] {
  const totalStrength = party.reduce(
    (sum, char) => sum + (char.strength || 0),
    0
  );
  const totalHealth = party.reduce((sum, char) => sum + (char.health || 0), 0);
  const totalAgility = party.reduce(
    (sum, char) => sum + (char.agility || 0),
    0
  );
  const totalMana = party.reduce((sum, char) => sum + (char.mana || 0), 0);
  const totalDexterity = party.reduce(
    (sum, char) => sum + (char.dexterity || 0),
    0
  );
  const totalWisdom = party.reduce((sum, char) => sum + (char.wisdom || 0), 0);
  const numMages = party.filter((c) => c.type === "Mage").length;
  const numBarbarians = party.filter((c) => c.type === "Barbarian").length;
  const numRogues = party.filter((c) => c.type === "Rogue").length;
  const numBandits = party.filter((c) => c.type === "Bandit").length;
  const isDragonFight = encounter.event_type === "Dragon Fight" ? 1 : 0;
  const isAncientTrap = encounter.event_type === "Ancient Trap" ? 1 : 0;
  const isMysticPuzzle = encounter.event_type === "Mystic Puzzle" ? 1 : 0;
  return [
    party.length,
    totalStrength,
    totalHealth,
    totalAgility,
    totalMana,
    totalDexterity,
    totalWisdom,
    numMages,
    numBarbarians,
    numRogues,
    numBandits,
    isDragonFight,
    isAncientTrap,
    isMysticPuzzle,
  ];
}
async function getTFJSAnalysis(
  party: Character[],
  encounter: Encounter
): Promise<number> {
  // Await the model promise here. This safely waits for the model to be ready.
  const model = await modelPromise;
  if (!model) {
    console.error("TensorFlow model not available. Returning default value.");
    return 50;
  }
  const inputVector = prepareDataForModel(party, encounter);
  const inputTensor = tf.tensor2d([inputVector]);
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const successChanceArray = await prediction.data();
  inputTensor.dispose();
  prediction.dispose();
  return Math.round(successChanceArray[0] * 100);
}

// --- GenAI and Fallback Logic (Unchanged) ---
async function generateTurnSpecificActions(
  character: Character,
  eventType: string
): Promise<string[]> {
  const prompt = `
    You are an expert Dungeon Master providing creative, class-specific tactical advice for a player's turn in a Dungeons & Dragons encounter.

    Player Character:
    - Name: ${character.name}
    - Class: ${character.type}
    - Stats: Strength(${character.strength}), Agility(${character.agility}), Health(${character.health}), Mana(${character.mana}), Dexterity(${character.dexterity}), Wisdom(${character.wisdom})

    Current Encounter: "${eventType}"

    Task:
    Provide a JSON array of 3 strategic actions. The actions MUST be creative and strongly reflect the character's class abilities and playstyle. For example, a Mage should get spell-based actions, a Barbarian should get rage/strength actions, and a Rogue should get stealth or skill-based actions. The first action should be the primary recommendation. Actions must be concise (under 15 words).

    Example for a Mage:
    ["Primary: Cast 'Magic Missile' on the weakest target.", "Alternative: Conjure a 'Fog Cloud' for cover.", "Defensive: Prepare a 'Shield' spell."]

    Example for a Rogue:
    ["Primary: Use 'Sneak Attack' on the distracted guard.", "Alternative: Disengage and hide in the shadows.", "Defensive: Use 'Uncanny Dodge' to halve damage."]

    Your Response (JSON array only):
    `;

  try {
    const result = await genaiModel.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const actions = JSON.parse(jsonString);
    return Array.isArray(actions)
      ? actions
      : fallbackActions(character, eventType);
  } catch (error) {
    console.error("GenAI call failed, using fallback.", error);
    return fallbackActions(character, eventType);
  }
}
function fallbackActions(character: Character, eventType: string): string[] {
  const primaryAction = getRecommendedAction(character, eventType);
  const actions = [`Primary: ${primaryAction}`];
  if (eventType === "Dragon Fight") {
    actions.push("Alternative: Use a defensive maneuver.");
  } else if (eventType === "Ancient Trap") {
    actions.push("Alternative: Search the area for triggers.");
  }
  actions.push("Default: Take the 'Dodge' action.");
  return actions;
}

async function analyzePartyVsEncounter(
  party: Character[],
  encounter: Encounter,
  currentTurnCharacterName: string
) {
  const finalSuccessChance = await getTFJSAnalysis(party, encounter);
  const weightedAnalysis = getWeightedAnalysis(
    party,
    encounter,
    finalSuccessChance
  );
  const currentCharacter = party.find(
    (char) => char.name === currentTurnCharacterName
  );
  let turnActions: string[] = [];
  if (currentCharacter) {
    turnActions = await generateTurnSpecificActions(
      currentCharacter,
      encounter.event_type
    );
  }
  return {
    party_success_chance: finalSuccessChance,
    individual_success_rates: weightedAnalysis.individual_success_rates,
    encounter_difficulty: getEncounterDifficulty(encounter.event_type),
    strategic_recommendations: weightedAnalysis.strategic_recommendations,
    current_turn_actions: turnActions,
  };
}

// --- POST Handler and other helpers (Unchanged) ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.party || !body.encounter || !body.current_turn_character) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: party, encounter, current_turn_character",
        },
        { status: 400 }
      );
    }
    const analysis = await analyzePartyVsEncounter(
      body.party,
      body.encounter,
      body.current_turn_character
    );
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Error analyzing party:", error);
    return NextResponse.json(
      { error: "Failed to analyze party composition" },
      { status: 500 }
    );
  }
}

interface StatWeights {
  strength: number;
  agility: number;
  health: number;
  mana: number;
  dexterity: number;
  wisdom: number;
}
function getStatWeights(eventType: string): StatWeights {
  switch (eventType) {
    case "Dragon Fight":
      return {
        strength: 1.3,
        health: 1.2,
        agility: 1.1,
        mana: 1.1,
        dexterity: 1.0,
        wisdom: 0.9,
      };
    case "Ancient Trap":
      return {
        dexterity: 1.4,
        agility: 1.3,
        wisdom: 1.2,
        health: 1.0,
        mana: 0.9,
        strength: 0.8,
      };
    case "Mystic Puzzle":
      return {
        wisdom: 1.5,
        mana: 1.3,
        dexterity: 1.0,
        agility: 0.9,
        health: 0.8,
        strength: 0.7,
      };
    default:
      return {
        strength: 1.0,
        agility: 1.0,
        health: 1.0,
        mana: 1.0,
        dexterity: 1.0,
        wisdom: 1.0,
      };
  }
}
function getWeightedAnalysis(
  party: Character[],
  encounter: Encounter,
  partySuccessChance: number
) {
  const weights = getStatWeights(encounter.event_type);
  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  const difficultyMultiplier = getDifficultyMultiplier(encounter.event_type);
  const individualRates = party.map((character) => {
    const charTotalWeighted =
      (character.strength || 0) * weights.strength +
      (character.agility || 0) * weights.agility +
      (character.health || 0) * weights.health +
      (character.mana || 0) * weights.mana +
      (character.dexterity || 0) * weights.dexterity +
      (character.wisdom || 0) * weights.wisdom;
    const charBaseRate = charTotalWeighted / (totalWeight * 15);
    const charSuccessRate = Math.min(
      95,
      Math.max(15, 20 + charBaseRate * 75 * difficultyMultiplier)
    );
    return {
      character: character.name,
      success_rate: Math.round(charSuccessRate),
      recommended_action: getRecommendedAction(character, encounter.event_type),
    };
  });
  const recommendations = generateRecommendations(
    party,
    encounter,
    partySuccessChance
  );
  return {
    individual_success_rates: individualRates,
    strategic_recommendations: recommendations,
  };
}
function getDifficultyMultiplier(eventType: string): number {
  switch (eventType) {
    case "Dragon Fight":
      return 0.85;
    case "Ancient Trap":
      return 0.9;
    case "Mystic Puzzle":
      return 1.0;
    default:
      return 0.95;
  }
}
function getEncounterDifficulty(eventType: string): string {
  switch (eventType) {
    case "Dragon Fight":
      return "Hard";
    case "Ancient Trap":
      return "Medium";
    case "Mystic Puzzle":
      return "Easy";
    default:
      return "Unknown";
  }
}
function getRecommendedAction(character: Character, eventType: string): string {
  const stats = {
    str: character.strength,
    agi: character.agility,
    dex: character.dexterity || 0,
    wis: character.wisdom || 0,
    mana: character.mana || 0,
  };
  switch (eventType) {
    case "Dragon Fight":
      if (stats.str > 15) return "Power Attack";
      if (stats.mana > 15) return "Cast Fireball";
      if (stats.agi > 15) return "Dodge and Weave";
      return "Defensive Stance";
    case "Ancient Trap":
      if (stats.dex > 15) return "Disarm Trap";
      if (stats.wis > 15) return "Analyze Mechanism";
      if (stats.agi > 15) return "Evade Pressure Plate";
      return "Provide Lookout";
    case "Mystic Puzzle":
      if (stats.wis > 15) return "Decipher Runes";
      if (stats.mana > 15) return "Channel Insight";
      if (stats.dex > 10) return "Manipulate Artifact";
      return "Observe Patterns";
    default:
      return "Take Action";
  }
}
function generateRecommendations(
  party: Character[],
  encounter: Encounter,
  successChance: number
): string[] {
  const recs: string[] = [];
  const findBest = (stat: keyof Omit<Character, "name" | "type">) =>
    party.reduce((best, char) =>
      (char[stat] || 0) > (best[stat] || 0) ? char : best
    );
  if (successChance < 40) {
    recs.push(
      "This is a highly challenging encounter. Survival should be the top priority; focus on defensive abilities and healing."
    );
  } else if (successChance > 75) {
    recs.push(
      "Your party has a clear advantage. A coordinated, aggressive strategy should secure a swift victory."
    );
  } else {
    recs.push(
      "The odds are balanced. A smart, tactical approach combining offense and defense is crucial for success."
    );
  }
  switch (encounter.event_type) {
    case "Dragon Fight":
      const tank = findBest("health");
      recs.push(
        `Let ${tank.name} draw the dragon's attention while others attack from the flanks.`
      );
      const strongest = findBest("strength");
      recs.push(
        `${strongest.name} should focus on dealing maximum physical damage.`
      );
      break;
    case "Ancient Trap":
      const nimble = findBest("dexterity");
      recs.push(
        `${nimble.name} should take the lead to scout for and disarm any traps.`
      );
      const wiseTrap = findBest("wisdom");
      if (wiseTrap.name !== nimble.name) {
        recs.push(
          `${wiseTrap.name} can assist by spotting the trap mechanisms from a distance.`
        );
      }
      break;
    case "Mystic Puzzle":
      const wise = findBest("wisdom");
      recs.push(
        `The party should rely on ${wise.name}'s wisdom to solve the core puzzle.`
      );
      const mage = findBest("mana");
      if (mage.name !== wise.name) {
        recs.push(
          `${mage.name} could use their mana to reveal hidden clues or magical auras.`
        );
      }
      break;
  }
  return recs;
}
