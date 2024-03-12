// ============================================================
//  06 - NETWORK: Decentralization and Consensus
// ============================================================
//
//  A blockchain isn't just one chain on one computer — it's
//  many copies across many nodes. This raises key questions:
//
//    - What if two nodes mine a block at the same time? (FORK)
//    - How do nodes agree on the "true" chain? (CONSENSUS)
//    - How does the network resist attacks? (SECURITY)
//
//  The answer: the LONGEST CHAIN RULE.
//  The chain with the most accumulated proof of work wins.
//  Honest nodes will always collectively outpace an attacker.
//
//  This is a simulation — no actual networking, just objects
//  calling each other's methods to demonstrate the concepts.
//
//  Run: node 06-network.js
// ============================================================

const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const content =
      this.index +
      this.timestamp +
      JSON.stringify(this.data) +
      this.previousHash +
      this.nonce;
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  mine(difficulty) {
    const target = "0".repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(0, "2009-01-03T18:15:05Z", "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      data,
      this.getLatestBlock().hash
    );
    block.mine(this.difficulty);
    this.chain.push(block);
    return block;
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  // Deep-copy the chain for broadcasting to other nodes
  cloneChain() {
    return JSON.parse(JSON.stringify(this.chain)).map((b) => {
      const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
      block.nonce = b.nonce;
      block.hash = b.hash;
      return block;
    });
  }
}

class Node {
  constructor(name) {
    this.name = name;
    this.blockchain = new Blockchain();
    this.peers = [];
  }

  connectTo(otherNode) {
    if (!this.peers.includes(otherNode)) {
      this.peers.push(otherNode);
      otherNode.peers.push(this);
    }
  }

  // Mine a new block locally
  mine(data) {
    return this.blockchain.addBlock(`[${this.name}] ${data}`);
  }

  // Broadcast own chain to all peers
  broadcast() {
    for (const peer of this.peers) {
      peer.receiveChain(this.blockchain.cloneChain(), this.name);
    }
  }

  // Receive a chain from a peer — adopt it if it's longer and valid
  receiveChain(incomingChain, senderName) {
    if (incomingChain.length > this.blockchain.chain.length) {
      // Validate the incoming chain
      const tempBlockchain = new Blockchain();
      tempBlockchain.chain = incomingChain;
      if (tempBlockchain.isValid()) {
        this.blockchain.chain = incomingChain;
        return true;
      }
    }
    return false;
  }

  // Resolve conflicts by querying all peers (longest valid chain wins)
  resolveConflicts() {
    let dominated = false;
    for (const peer of this.peers) {
      const adopted = this.receiveChain(peer.blockchain.cloneChain(), peer.name);
      if (adopted) dominated = true;
    }
    return dominated;
  }

  displayChain() {
    const blocks = this.blockchain.chain.map((b) => {
      if (b.index === 0) return "[Genesis]";
      return `[#${b.index}: ${String(b.data).substring(0, 30)}]`;
    });
    console.log(`  ${this.name} (${this.blockchain.chain.length} blocks):`);
    console.log(`    ${blocks.join(" -> ")}`);
  }
}

// ── Network Setup ───────────────────────────────────────────

console.log("========================================");
console.log("  06 - NETWORK & CONSENSUS");
console.log("========================================\n");

const paris = new Node("Paris");
const lyon = new Node("Lyon");
const lille = new Node("Lille");

paris.connectTo(lyon);
paris.connectTo(lille);
lyon.connectTo(lille);

console.log("--- Network Topology ---\n");
console.log("      Paris ------- Lyon");
console.log("        \\           /");
console.log("         \\         /");
console.log("          Lille---+\n");
console.log("  All nodes start with the same Genesis Block.\n");

// ── Demo 1: Normal Operation ────────────────────────────────

console.log("--- Demo 1: Normal Block Propagation ---\n");
console.log("  Paris mines a block and broadcasts it to the network.\n");

paris.mine("Transaction batch #1");
paris.broadcast();

paris.displayChain();
lyon.displayChain();
lille.displayChain();
console.log("\n  All nodes have the same chain. Consensus!\n");

// ── Demo 2: A Fork ──────────────────────────────────────────

console.log("--- Demo 2: Simultaneous Mining (Fork) ---\n");
console.log("  Paris and Lyon both mine a block at the same time,");
console.log("  but with different transactions. They don't broadcast yet.\n");

paris.mine("Paris-only transaction A");
lyon.mine("Lyon-only transaction B");

console.log("  Chains have DIVERGED:\n");
paris.displayChain();
lyon.displayChain();
lille.displayChain();

console.log(`\n  Paris: ${paris.blockchain.chain.length} blocks`);
console.log(`  Lyon:  ${lyon.blockchain.chain.length} blocks`);
console.log(`  Lille: ${lille.blockchain.chain.length} blocks (still behind)\n`);

// ── Demo 3: Fork Resolution ─────────────────────────────────

console.log("--- Demo 3: Fork Resolution (Longest Chain Wins) ---\n");
console.log("  Paris mines ANOTHER block, making its chain longer.\n");

paris.mine("Paris transaction C (tiebreaker)");

console.log("  Before consensus:\n");
console.log(`    Paris: ${paris.blockchain.chain.length} blocks`);
console.log(`    Lyon:  ${lyon.blockchain.chain.length} blocks`);
console.log(`    Lille: ${lille.blockchain.chain.length} blocks\n`);

console.log("  Paris broadcasts. All nodes adopt the longest valid chain.\n");
paris.broadcast();

// Lyon and Lille also resolve with all peers
lyon.resolveConflicts();
lille.resolveConflicts();

paris.displayChain();
lyon.displayChain();
lille.displayChain();

console.log(`\n  All nodes now have ${paris.blockchain.chain.length} blocks.`);
console.log("  Lyon's unique block was ORPHANED — its transaction was lost.");
console.log("  In a real network, orphaned transactions return to the mempool.\n");

// ── Explanation ─────────────────────────────────────────────

console.log("--- Why Longest Chain Works ---\n");
console.log("  1. The longest chain has the most accumulated proof of work");
console.log("  2. An attacker would need >50% of the network's computing");
console.log('     power to consistently build a longer chain ("51% attack")');
console.log("  3. As the network grows, this becomes economically impossible");
console.log("  4. Honest miners are incentivized by block rewards to");
console.log("     cooperate rather than attack\n");

console.log("--- Real Network Differences ---\n");
console.log("  Our simulation is simplified. Real blockchains also have:");
console.log("  - Actual TCP/P2P networking with peer discovery");
console.log("  - Block propagation delays (latency matters!)");
console.log("  - Mempool management for orphaned transactions");
console.log("  - Merkle trees for efficient transaction verification");
console.log("  - Light clients that verify headers without full blocks");
console.log("  - Finality guarantees (6 confirmations for Bitcoin)\n");
