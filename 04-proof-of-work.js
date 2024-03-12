// ============================================================
//  04 - PROOF OF WORK: Mining and Computational Puzzles
// ============================================================
//
//  Problem: Without extra protection, an attacker could just
//  recalculate the entire chain after tampering (cascade attack).
//
//  Solution: Make block creation EXPENSIVE. Require each block's
//  hash to start with N zeros (the "difficulty"). The only way
//  to achieve this is brute force — keep changing a "nonce"
//  (number used once) until the hash meets the requirement.
//
//  This is called MINING. It's intentionally slow to create
//  a block but instant to verify one.
//
//  Bitcoin adjusts difficulty so that a block takes ~10 minutes
//  to mine across the entire network.
//
//  Run: node 04-proof-of-work.js
// ============================================================

const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;          // <-- new field! the mining variable
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const content =
      this.index +
      this.timestamp +
      JSON.stringify(this.data) +
      this.previousHash +
      this.nonce;             // <-- nonce is now part of the hash input
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  // The mining loop: keep trying nonces until the hash has enough leading zeros
  mine(difficulty) {
    const target = "0".repeat(difficulty);
    const startTime = Date.now();
    let attempts = 0;

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
      attempts++;
    }

    const elapsed = Date.now() - startTime;
    return { attempts, elapsed };
  }
}

// ── Demo 1: What is a nonce? ────────────────────────────────

console.log("========================================");
console.log("  04 - PROOF OF WORK (Mining)");
console.log("========================================\n");

console.log("--- What is a Nonce? ---");
console.log("A nonce is a number that miners change to produce different hashes.\n");

const demoBlock = new Block(0, "2024-01-01", "demo", "0");

console.log("  Same block content, different nonces:\n");
for (let n = 0; n < 5; n++) {
  demoBlock.nonce = n;
  const hash = demoBlock.calculateHash();
  console.log(`  nonce=${n}  ->  ${hash}`);
}
console.log("\n  Each nonce produces a completely different hash.");
console.log("  Mining = finding the nonce that gives a hash starting with zeros.\n");

// ── Demo 2: Mining at different difficulties ────────────────

console.log("--- Mining at Different Difficulties ---");
console.log("Difficulty = number of leading zeros required in the hash.\n");

const results = [];

for (let difficulty = 1; difficulty <= 5; difficulty++) {
  const block = new Block(1, "2024-01-01", `Block mined at difficulty ${difficulty}`, "0");
  const { attempts, elapsed } = block.mine(difficulty);

  results.push({ difficulty, attempts, elapsed, hash: block.hash, nonce: block.nonce });

  const zeros = "0".repeat(difficulty);
  console.log(`  Difficulty ${difficulty}: find hash starting with "${zeros}"`);
  console.log(`    Hash:     ${block.hash}`);
  console.log(`    Nonce:    ${block.nonce}`);
  console.log(`    Attempts: ${attempts.toLocaleString()}`);
  console.log(`    Time:     ${elapsed}ms\n`);
}

// ── Summary table ───────────────────────────────────────────

console.log("--- Exponential Growth ---");
console.log("Each +1 difficulty multiplies the work by ~16 (one hex digit).\n");
console.log("  Difficulty | Attempts       | Time");
console.log("  -----------|----------------|----------");
results.forEach((r) => {
  console.log(
    `  ${String(r.difficulty).padStart(5)}      | ${String(r.attempts.toLocaleString()).padStart(14)} | ${String(r.elapsed).padStart(6)}ms`
  );
});

console.log("\n--- Why This Matters ---\n");
console.log("  To tamper with a block, an attacker must:");
console.log("    1. Change the block's data");
console.log("    2. Re-mine that block (find a valid nonce)");
console.log("    3. Re-mine EVERY subsequent block");
console.log("    4. Do all this faster than the rest of the network");
console.log("       is adding new blocks");
console.log();
console.log("  Bitcoin's current difficulty requires ~19 leading zeros.");
console.log("  The entire network (~500 EH/s) takes ~10 minutes per block.");
console.log("  A single attacker cannot outpace this.\n");
