// ============================================================
//  03 - BLOCKCHAIN: Linking Blocks Into an Immutable Chain
// ============================================================
//
//  A blockchain is simply a linked list of blocks where each
//  block contains the hash of the previous block.
//
//  This creates a chain of trust:
//    - Modifying block N changes its hash
//    - Block N+1 still stores the OLD hash of block N
//    - The chain is now broken — tampering is detected
//    - To hide the change, you'd need to recalculate EVERY
//      subsequent block — which is what Proof of Work prevents
//
//  Run: node 03-chain.js
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
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, "2009-01-03T18:15:05Z", "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const latest = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      latest.hash
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  // Verify the entire chain's integrity
  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Check 1: Does the block's stored hash match its content?
      if (current.hash !== current.calculateHash()) {
        return { valid: false, error: `Block ${i}: stored hash doesn't match recalculated hash` };
      }

      // Check 2: Does the block correctly reference the previous block?
      if (current.previousHash !== previous.hash) {
        return { valid: false, error: `Block ${i}: previousHash doesn't match Block ${i - 1}'s hash` };
      }
    }
    return { valid: true, error: null };
  }

  // Visual representation of the chain
  display() {
    const blocks = this.chain.map((b) => {
      const label = b.index === 0 ? "Genesis" : `Block ${b.index}`;
      return `[${label}]`;
    });
    console.log("  " + blocks.join(" --> "));
    console.log();

    this.chain.forEach((b) => {
      const label = b.index === 0 ? "Genesis" : `Block ${b.index}`;
      console.log(`  ${label}: hash=${b.hash.substring(0, 16)}... | prev=${b.previousHash.substring(0, 16)}...`);
    });
  }
}

// ── Demo 1: Build a chain ───────────────────────────────────

console.log("========================================");
console.log("  03 - BLOCKCHAIN");
console.log("========================================\n");

const myChain = new Blockchain();
myChain.addBlock("Alice sends 10 coins to Bob");
myChain.addBlock("Bob sends 5 coins to Charlie");
myChain.addBlock("Charlie sends 2 coins to Dave");

console.log("--- Building the Chain ---\n");
myChain.display();

// ── Demo 2: Validate ────────────────────────────────────────

console.log("\n--- Validation ---\n");
const result1 = myChain.isValid();
console.log(`  Chain valid? ${result1.valid ? "YES" : "NO — " + result1.error}\n`);

// ── Demo 3: Tamper with a block ─────────────────────────────

console.log("--- Tampering Attack ---");
console.log("  An attacker modifies Block 1's data...\n");

const originalData = myChain.chain[1].data;
myChain.chain[1].data = "Alice sends 1000 coins to Attacker";
console.log(`  Original: "${originalData}"`);
console.log(`  Tampered: "${myChain.chain[1].data}"\n`);

const result2 = myChain.isValid();
console.log(`  Chain valid? ${result2.valid ? "YES" : "NO"}`);
console.log(`  Error: ${result2.error}\n`);

// ── Demo 4: Naive fix — recalculate the tampered block ──────

console.log("--- Attacker Tries to Fix the Hash ---");
console.log("  The attacker recalculates Block 1's hash...\n");

myChain.chain[1].hash = myChain.chain[1].calculateHash();
console.log(`  Block 1's hash is now consistent with its data.`);

const result3 = myChain.isValid();
console.log(`  Chain valid? ${result3.valid ? "YES" : "NO"}`);
console.log(`  Error: ${result3.error}\n`);

console.log("  The chain is STILL broken! Block 2's previousHash still");
console.log("  points to Block 1's OLD hash. The attacker would need to");
console.log("  recalculate Block 2, then Block 3, then every block after.");
console.log();
console.log("  This is called the CASCADE EFFECT. Changing one block");
console.log("  requires recomputing the entire chain from that point.");
console.log("  Proof of Work (next example) makes this computationally");
console.log("  impossible in practice.\n");
