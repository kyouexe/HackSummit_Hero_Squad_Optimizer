// scripts/train-model.ts

const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path");

// --- INTERFACES ---
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

// --- DATA PREPARATION ---
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

// ✅ FINAL CORRECTED VERSION of the save handler
function fileSystemSaveHandler(modelArtifacts: any) {
  const modelDir = path.resolve("./models/party-optimizer-model");
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  // This creates the complete model JSON, including the weights manifest
  const modelJson = {
    modelTopology: modelArtifacts.modelTopology,
    weightsManifest: [
      {
        paths: ["./weights.bin"],
        weights: modelArtifacts.weightSpecs,
      },
    ],
  };

  const modelJSONPath = path.join(modelDir, "model.json");
  const weightsBinPath = path.join(modelDir, "weights.bin");

  fs.writeFileSync(modelJSONPath, JSON.stringify(modelJson));

  // This logic safely handles both ArrayBuffer and SharedArrayBuffer cases from TensorFlow.js
  const weightData =
    modelArtifacts.weightData instanceof SharedArrayBuffer
      ? modelArtifacts.weightData.slice(0) // Create a standard ArrayBuffer copy
      : modelArtifacts.weightData;

  fs.writeFileSync(weightsBinPath, Buffer.from(weightData));

  return {
    modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: "JSON" },
  };
}

async function train() {
  console.log("🚀 Starting model training...");
  const dataPath = path.resolve("./data/training_dataset.json");
  const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const features = jsonData.map((log: any) =>
    prepareDataForModel(log.party, log.encounter)
  );
  const labels = jsonData.map((log: any) =>
    log.actual_outcome === "success" ? 1 : 0
  );

  const trainingData = tf.tensor2d(features);
  const outputData = tf.tensor2d(labels, [labels.length, 1]);

  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [features[0].length],
      units: 64,
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({ loss: "binaryCrossentropy", optimizer: "adam" });

  console.log("🧠 Training the model...");
  await model.fit(trainingData, outputData, {
    epochs: 200,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch: any, logs: any) => {
        if (epoch % 20 === 0) {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
        }
      },
    },
  });
  console.log("✅ Model training complete.");

  // This save call now uses the corrected handler
  await model.save({
    save: (artifacts: any) => Promise.resolve(fileSystemSaveHandler(artifacts)),
  });
  console.log(`💾 Model saved correctly.`);
}

train();
