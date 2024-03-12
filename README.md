# Blockchain Fundamentals

Learn how blockchains work by building one from scratch in JavaScript. Six progressive examples take you from cryptographic hashing to a simulated peer-to-peer network — no external dependencies, just Node.js.

```
  Hashing  ->  Blocks  ->  Chain  ->  Mining  ->  Transactions  ->  Network
   (01)        (02)        (03)       (04)          (05)            (06)
```

## Prerequisites

- **Node.js >= 18** (uses built-in `crypto` module)
- No `npm install` needed — zero dependencies

## Quick Start

Run examples individually:

```bash
node 01-hash.js
node 02-block.js
# ... etc
```

Or run all sequentially:

```bash
npm run all
```

Each file is self-contained and prints educational output explaining what's happening as it runs.

---

## Concepts

### 1. Cryptographic Hashing (`01-hash.js`)

A hash function takes any input and produces a fixed-size fingerprint. SHA-256 always outputs 64 hex characters (256 bits).

```
         +-----------+
 "Hi" -->| SHA-256   |--> 8f14e45f...  (always 64 chars)
         +-----------+

 "Hi!"--->| SHA-256   |--> 4b0f6830...  (completely different!)
         +-----------+
```

**Key properties:**
- **Deterministic** — same input always gives the same hash
- **One-way** — you cannot reverse a hash to find the input
- **Avalanche effect** — changing one bit completely changes the output
- **Collision-resistant** — practically impossible to find two inputs with the same hash

This is the primitive that makes everything else possible. Every block's integrity depends on its hash.

---

### 2. Block Structure (`02-block.js`)

A block is a container that bundles data with metadata:

```
+-------------------------------------------+
| Block #1                                  |
+-------------------------------------------+
| index:         1                          |
| timestamp:     2024-01-03T12:00:00Z       |
| data:          { from: "Alice",           |
|                  to: "Bob", amount: 50 }  |
| previousHash:  a1b2c3d4e5f6...            |
| hash:          7f8e9d0c1b2a...            |
+-------------------------------------------+
```

The **hash** is calculated from all other fields combined. If any field changes, the hash changes — that's how we detect tampering.

The **previousHash** field is what creates the chain. It stores the hash of the block before it, creating a link to the past.

---

### 3. The Blockchain (`03-chain.js`)

A blockchain is a linked list where each block contains the hash of the previous block:

```
+---------+     +---------+     +---------+     +---------+
| Genesis | --> | Block 1 | --> | Block 2 | --> | Block 3 |
| prev: 0 |     | prev: H0|     | prev: H1|     | prev: H2|
| hash: H0|     | hash: H1|     | hash: H2|     | hash: H3|
+---------+     +---------+     +---------+     +---------+
```

**Why it's secure — the Cascade Effect:**

If an attacker modifies Block 1's data:
1. Block 1's hash changes → no longer matches its stored hash
2. Attacker recalculates Block 1's hash → but Block 2 still stores the **old** hash
3. Attacker must recalculate Block 2's hash → but Block 3 still stores the **old** hash
4. ...and so on for every subsequent block

Changing one block requires rewriting the entire chain from that point. Proof of Work makes this computationally impossible.

---

### 4. Proof of Work — Mining (`04-proof-of-work.js`)

Without Proof of Work, recalculating the chain would be trivial. PoW makes block creation intentionally expensive.

**The puzzle:** find a `nonce` (number used once) such that the block's hash starts with N zeros.

```
Difficulty = 3  →  hash must start with "000..."

  nonce=0     →  a8f2c1...  ✗
  nonce=1     →  5b7d3e...  ✗
  nonce=2     →  91c4f8...  ✗
  ...
  nonce=4201  →  000a3b...  ✓  Found!
```

The only way to find it is brute force — keep incrementing the nonce and hashing. There's no shortcut.

| Difficulty | Leading Zeros | ~Avg Attempts | Growth     |
|------------|---------------|---------------|------------|
| 1          | `0...`        | 16            |            |
| 2          | `00...`       | 256           | x16        |
| 3          | `000...`      | 4,096         | x16        |
| 4          | `0000...`     | 65,536        | x16        |

Bitcoin's difficulty requires ~19 leading zeros. The entire network (~500 EH/s) takes about 10 minutes per block.

---

### 5. Transactions (`05-transactions.js`)

Real blocks don't hold arbitrary strings — they hold **transactions**.

```
  Block #2 Transactions:
  ┌────────────────────────────────────────┐
  │  miner  -> alice  : 30 coins           │
  │  miner  -> bob    : 15 coins           │
  │  [COINBASE] -> miner : 50 coins        │  ← mining reward
  └────────────────────────────────────────┘
```

**Key mechanics:**
- **Coinbase transaction** — a special transaction with no sender that creates new coins as a mining reward. This is how money enters the system.
- **Mempool** — pending transactions wait in a pool until a miner includes them in a block.
- **Balance** — calculated by scanning every transaction in the chain (account-based model, like Ethereum).

**UTXO vs Account Model:**

Our implementation uses the **account model** (simpler — track running balances per address). Bitcoin uses **UTXO** (Unspent Transaction Outputs), where there are no balances — only discrete unspent outputs that must be consumed in full:

```
Account model (Ethereum):     UTXO model (Bitcoin):
  alice: 50 coins               alice owns: [50-coin output]
  alice sends 30 to bob          alice sends 30 to bob
  alice: 20, bob: 30             creates: [30 to bob, 20 change to alice]
```

---

### 6. Network & Consensus (`06-network.js`)

A blockchain isn't one chain on one computer — it's many copies across many nodes.

```
      Paris ------- Lyon
        \           /
         \         /
          Lille---+
```

**The problem:** what if Paris and Lyon mine a block simultaneously?

```
                    ┌─ [Paris Block 2]     ← Paris's chain
  [Genesis] → [1] ─┤
                    └─ [Lyon Block 2]      ← Lyon's chain (different!)
```

This is a **fork**. The network resolves it with the **Longest Chain Rule**: whichever chain accumulates the most proof of work wins. When Paris mines Block 3 first:

```
  [Genesis] → [1] → [Paris Block 2] → [Paris Block 3]   ← WINNER
                   → [Lyon Block 2]                       ← orphaned
```

All nodes adopt Paris's chain. Lyon's orphaned block is discarded (its transactions return to the mempool for re-inclusion).

**Why this works:**
- The longest chain has the most accumulated computational work
- An attacker needs >50% of network computing power to build a longer chain (**51% attack**)
- As the network grows, this becomes economically impossible
- Miners are financially incentivized to cooperate (block rewards)

---

## How This Compares to Real Blockchains

| Feature               | This Project           | Bitcoin                    | Ethereum                     |
|-----------------------|------------------------|----------------------------|------------------------------|
| Consensus             | Longest chain (PoW)    | Longest chain (PoW)        | Proof of Stake (since 2022)  |
| Block time            | Instant                | ~10 minutes                | ~12 seconds                  |
| Difficulty adjustment | None                   | Every 2016 blocks          | Every block                  |
| Transaction model     | Account-based          | UTXO                       | Account-based                |
| Cryptography          | SHA-256                | SHA-256 + RIPEMD-160       | Keccak-256                   |
| Smart contracts       | No                     | Limited (Script)           | Yes (Solidity/EVM)           |
| Networking            | Simulated              | P2P gossip protocol        | P2P (devp2p)                 |
| Signatures            | None (trusted)         | ECDSA (secp256k1)          | ECDSA + BLS                  |

---

## Going Further

- [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf) — Satoshi Nakamoto's original 9-page paper (2008)
- [But how does bitcoin actually work?](https://www.youtube.com/watch?v=bBC-nXj3Ng4) — 3Blue1Brown visual explanation
- *Mastering Bitcoin* by Andreas Antonopoulos — the comprehensive technical reference
- *Mastering Ethereum* by Andreas Antonopoulos & Gavin Wood — for smart contract development
