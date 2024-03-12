// ============================================================
//  05 - TRANSACTIONS: From Data to Digital Money
// ============================================================
//
//  So far our blocks held arbitrary strings. Real blockchains
//  store TRANSACTIONS — structured transfers of value.
//
//  This example implements:
//    - A Transaction class (sender, receiver, amount)
//    - A pending transaction pool (mempool)
//    - Mining rewards (new coins created for the miner)
//    - Balance calculation by scanning the chain
//    - Spending validation (can't send more than you have)
//
//  We use an ACCOUNT-BASED model (like Ethereum) for simplicity.
//  Bitcoin uses UTXO (Unspent Transaction Outputs) — see the
//  explanation at the end.
//
//  Run: node 05-transactions.js
// ============================================================

const crypto = require("crypto");

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  toString() {
    if (this.from === null) {
      return `  [COINBASE] -> ${this.to}: +${this.amount} coins (mining reward)`;
    }
    return `  ${this.from} -> ${this.to}: ${this.amount} coins`;
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const content =
      this.index +
      this.timestamp +
      JSON.stringify(this.transactions) +
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
    this.pendingTransactions = [];
    this.miningReward = 50;
  }

  createGenesisBlock() {
    return new Block(0, "2009-01-03T18:15:05Z", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add a transaction to the pending pool (mempool)
  createTransaction(transaction) {
    if (transaction.from !== null) {
      const balance = this.getBalance(transaction.from);
      if (balance < transaction.amount) {
        console.log(`  REJECTED: ${transaction.from} has ${balance} coins but tried to send ${transaction.amount}`);
        return false;
      }
    }

    this.pendingTransactions.push(transaction);
    return true;
  }

  // Mine all pending transactions into a new block
  minePendingTransactions(minerAddress) {
    // The miner gets a reward — this is how new coins enter the system
    const rewardTx = new Transaction(null, minerAddress, this.miningReward);

    const blockTransactions = [...this.pendingTransactions, rewardTx];

    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      blockTransactions,
      this.getLatestBlock().hash
    );

    block.mine(this.difficulty);
    this.chain.push(block);

    // Clear the pool — in reality, only included transactions are removed
    this.pendingTransactions = [];
    return block;
  }

  // Calculate balance by scanning all transactions in the chain
  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address) balance -= tx.amount;
        if (tx.to === address) balance += tx.amount;
      }
    }

    return balance;
  }
}

// ── Demo ────────────────────────────────────────────────────

console.log("========================================");
console.log("  05 - TRANSACTIONS");
console.log("========================================\n");

const coin = new Blockchain();

// Step 1: Initial mining — miner gets the first coins
console.log("--- Step 1: Initial Mining ---");
console.log("  Miner mines the first block and receives 50 coins as reward.\n");
coin.minePendingTransactions("miner");

console.log("  Balances after first mining:");
console.log(`    miner:   ${coin.getBalance("miner")} coins`);
console.log(`    alice:   ${coin.getBalance("alice")} coins`);
console.log(`    bob:     ${coin.getBalance("bob")} coins\n`);

// Step 2: Miner distributes coins
console.log("--- Step 2: Creating Transactions ---");
console.log("  Miner sends coins to Alice and Bob.\n");

coin.createTransaction(new Transaction("miner", "alice", 30));
coin.createTransaction(new Transaction("miner", "bob", 15));

console.log("  Pending transactions:");
coin.pendingTransactions.forEach((tx) => console.log(tx.toString()));
console.log();

// Step 3: Mine the transaction block
console.log("--- Step 3: Mining the Transaction Block ---");
console.log("  Miner mines the block containing these transactions.\n");
coin.minePendingTransactions("miner");

console.log("  Balances after second block:");
console.log(`    miner:   ${coin.getBalance("miner")} coins  (50 - 30 - 15 + 50 reward)`);
console.log(`    alice:   ${coin.getBalance("alice")} coins`);
console.log(`    bob:     ${coin.getBalance("bob")} coins\n`);

// Step 4: Alice and Bob transact
console.log("--- Step 4: Peer-to-Peer Transfers ---");
console.log("  Alice sends 10 to Bob. Bob sends 5 to Alice.\n");

coin.createTransaction(new Transaction("alice", "bob", 10));
coin.createTransaction(new Transaction("bob", "alice", 5));
coin.minePendingTransactions("miner");

console.log("  Final balances:");
console.log(`    miner:   ${coin.getBalance("miner")} coins`);
console.log(`    alice:   ${coin.getBalance("alice")} coins  (30 - 10 + 5)`);
console.log(`    bob:     ${coin.getBalance("bob")} coins  (15 + 10 - 5)\n`);

// Step 5: Overdraft protection
console.log("--- Step 5: Spending Validation ---");
console.log("  What if Alice tries to send more than she has?\n");

const accepted = coin.createTransaction(new Transaction("alice", "bob", 9999));
console.log(`  Transaction accepted? ${accepted ? "YES" : "NO"}\n`);

// ── Sidebar: UTXO vs Account Model ─────────────────────────

console.log("--- UTXO vs Account Model ---\n");
console.log("  Our example uses an ACCOUNT model (like Ethereum):");
console.log("    - Each address has a running balance");
console.log("    - Simple to understand and implement\n");
console.log("  Bitcoin uses UTXO (Unspent Transaction Outputs):");
console.log("    - No balances — only unspent outputs from previous transactions");
console.log('    - To spend, you consume entire outputs and get "change" back');
console.log("    - More complex but better for privacy and parallel validation");
console.log();
console.log("  Example UTXO flow:");
console.log("    Alice has a 50-coin output from mining.");
console.log("    She wants to send 30 to Bob.");
console.log("    Transaction: consume the 50-output, create two new outputs:");
console.log("      -> 30 to Bob");
console.log("      -> 20 back to Alice (change)\n");
