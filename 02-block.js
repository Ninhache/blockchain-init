// ============================================================
//  02 - BLOCK STRUCTURE: The Building Unit
// ============================================================
//
//  A block is a container that holds:
//    - index:        its position in the chain (0, 1, 2, ...)
//    - timestamp:    when it was created
//    - data:         the payload (transactions, messages, anything)
//    - previousHash: the hash of the block before it (the "link")
//    - hash:         the fingerprint of ALL the above fields combined
//
//  The hash acts as a seal — if any field changes, the hash
//  will no longer match, revealing the tampering.
//
//  Run: node 02-block.js
// ============================================================

const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const content = this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash;
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  // Pretty-print the block
  display() {
    const border = "+---------------------------------------------------+";
    console.log(border);
    console.log(`| Block #${this.index}`.padEnd(52) + "|");
    console.log(border);
    console.log(`| Timestamp:     ${this.timestamp}`.padEnd(52) + "|");
    console.log(`| Data:          ${JSON.stringify(this.data)}`.padEnd(52) + "|");
    console.log(`| Previous Hash: ${this.previousHash.substring(0, 20)}...`.padEnd(52) + "|");
    console.log(`| Hash:          ${this.hash.substring(0, 20)}...`.padEnd(52) + "|");
    console.log(border);
  }
}

// ── Demo 1: The Genesis Block ───────────────────────────────

console.log("========================================");
console.log("  02 - BLOCK STRUCTURE");
console.log("========================================\n");

console.log("--- The Genesis Block ---");
console.log('The first block in any blockchain is called the "Genesis Block".');
console.log("It has no predecessor, so its previousHash is all zeros.\n");

const genesis = new Block(0, "2009-01-03T18:15:05Z", "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks", "0000000000000000000000000000000000000000000000000000000000000000");
genesis.display();

// ── Demo 2: The Next Block ──────────────────────────────────

console.log("\n--- Adding a Second Block ---");
console.log("The second block references the genesis block's hash.\n");

const block1 = new Block(1, new Date().toISOString(), { from: "Alice", to: "Bob", amount: 50 }, genesis.hash);
block1.display();

console.log("\nNotice how Block #1's previousHash matches Block #0's hash.");
console.log("This is the LINK that forms the chain.\n");

// ── Demo 3: Tamper Detection ────────────────────────────────

console.log("--- Tamper Detection ---");
console.log("What happens if someone modifies a block's data?\n");

const originalHash = genesis.hash;
console.log(`  Original data:  "${genesis.data}"`);
console.log(`  Original hash:  ${originalHash}\n`);

// Tamper with the data
genesis.data = "TAMPERED DATA - I am a hacker!";
const tamperedHashRecalc = genesis.calculateHash();

console.log(`  Tampered data:  "${genesis.data}"`);
console.log(`  Stored hash:    ${originalHash}`);
console.log(`  Recalculated:   ${tamperedHashRecalc}`);
console.log(`  Match?          ${originalHash === tamperedHashRecalc ? "YES (no tampering)" : "NO — TAMPERING DETECTED!"}\n`);

console.log("  The stored hash no longer matches the recalculated hash.");
console.log("  This is how blockchain ensures data integrity —");
console.log("  you cannot change the past without leaving evidence.\n");
