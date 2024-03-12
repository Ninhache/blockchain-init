// ============================================================
//  01 - CRYPTOGRAPHIC HASHING: The Foundation of Blockchain
// ============================================================
//
//  A hash function takes ANY input and produces a fixed-size
//  "fingerprint". Blockchains use SHA-256 (Secure Hash Algorithm)
//  which always outputs 256 bits = 64 hexadecimal characters.
//
//  Properties that make it useful for blockchains:
//    1. Deterministic   — same input always gives same output
//    2. One-way         — you cannot reverse a hash to find the input
//    3. Avalanche effect — a tiny change in input completely changes the output
//    4. Collision-resistant — practically impossible to find two inputs with same hash
//
//  Run: node 01-hash.js
// ============================================================

const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// ── Demo 1: What does a hash look like? ─────────────────────

console.log("========================================");
console.log("  01 - CRYPTOGRAPHIC HASHING");
console.log("========================================\n");

const input1 = "Hello, Blockchain!";
const hash1 = sha256(input1);

console.log("--- What is a hash? ---");
console.log(`Input:   "${input1}"`);
console.log(`SHA-256: ${hash1}`);
console.log(`Length:  ${hash1.length} hex characters = 256 bits\n`);

// ── Demo 2: The Avalanche Effect ────────────────────────────
//  Change a single character and the entire hash changes.

const input2 = "Hello, Blockchain";  // removed the "!"
const hash2 = sha256(input2);

console.log("--- The Avalanche Effect ---");
console.log("Changing just ONE character completely changes the hash:\n");
console.log(`  "${input1}" -> ${hash1}`);
console.log(`  "${input2}"  -> ${hash2}`);

// Count how many hex characters differ
let diffCount = 0;
for (let i = 0; i < hash1.length; i++) {
  if (hash1[i] !== hash2[i]) diffCount++;
}
console.log(`\n  Characters that differ: ${diffCount} out of ${hash1.length} (${Math.round(diffCount / hash1.length * 100)}%)\n`);

// ── Demo 3: Determinism ─────────────────────────────────────

console.log("--- Determinism ---");
console.log("Hashing the same input always gives the same result:\n");

const hashA = sha256("blockchain");
const hashB = sha256("blockchain");
const hashC = sha256("blockchain");

console.log(`  hash("blockchain") = ${hashA}`);
console.log(`  hash("blockchain") = ${hashB}`);
console.log(`  hash("blockchain") = ${hashC}`);
console.log(`  All identical? ${hashA === hashB && hashB === hashC ? "YES" : "NO"}\n`);

// ── Demo 4: Fixed-size output ───────────────────────────────

console.log("--- Fixed-Size Output ---");
console.log("No matter the input size, SHA-256 always outputs 64 hex chars:\n");

const examples = [
  "a",
  "Hello, Blockchain!",
  "The quick brown fox jumps over the lazy dog. ".repeat(10),
  "42",
];

const labels = ["1 char", "18 chars", "460 chars", "2 chars (number)"];

examples.forEach((input, i) => {
  const hash = sha256(input);
  console.log(`  [${labels[i].padEnd(18)}] -> ${hash}`);
});

console.log(`\n  All outputs are exactly ${sha256("test").length} characters long.`);
console.log("\n  This is why hashes are perfect as block fingerprints —");
console.log("  compact, unique, and impossible to forge.\n");
