const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "..", "english.txt");
const outputDir = path.join(__dirname, "..", "data");
const outputPath = path.join(outputDir, "words.json");

const raw = fs.readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/).map((line) => line.trim());

const batches = [];
let current = null;

const batchLineRegex = /^✅\s*第\s*(\d+)\s*批(?:（([^）]+)）)?/;
const wordRegex = /^[a-z]+$/;

for (const line of lines) {
  if (!line) continue;
  const batchMatch = line.match(batchLineRegex);
  if (batchMatch) {
    if (current) {
      batches.push(current);
    }
    const number = Number(batchMatch[1]);
    const range = batchMatch[2] ? batchMatch[2].trim() : "";
    current = {
      number,
      range,
      words: [],
      wordSet: new Set(),
    };
    continue;
  }

  if (!current) continue;

  const token = line.toLowerCase();
  if (!wordRegex.test(token)) continue;
  if (current.wordSet.has(token)) continue;
  current.wordSet.add(token);
  current.words.push(token);
}

if (current) {
  batches.push(current);
}

const normalized = batches
  .sort((a, b) => a.number - b.number)
  .map((batch) => {
    const batchId = `batch-${String(batch.number).padStart(2, "0")}`;
    const words = batch.words.map((text, index) => ({
      id: `${batchId}-${index + 1}`,
      text,
    }));
    return {
      id: batchId,
      title: `第 ${batch.number} 批`,
      range: batch.range,
      words,
    };
  });

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  outputPath,
  JSON.stringify({ batches: normalized }, null, 2),
  "utf8"
);

console.log(`Generated ${outputPath} with ${normalized.length} batches.`);
