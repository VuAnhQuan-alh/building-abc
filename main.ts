import SHA256 from 'crypto-js/sha256'

class Transaction {
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;

  constructor(fromAddress = "", toAddress = "", amount = 0) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  private timestamp: string;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  private nonce: number;

  constructor(
    timestamp = "05/12/2023",
    data = [new Transaction("", "", 0)],
    previousHash = ""
  ) {
    this.timestamp = timestamp;
    this.transactions = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty = 1) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  public chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 5;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("05/12/2023", [new Transaction("", "", 0)], "");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock: Block) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  minePendingTransactions(miningRewardAddress: string) {
    let block = new Block(new Date().toISOString(), this.pendingTransactions);
    block.previousHash = this.getLatestBlock().hash;
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction("", miningRewardAddress, this.miningReward),
    ];
  }

  createTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOffAddress(address: string) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    console.log("\n");
    console.log("=== balance ===");
    console.log("this.chain:", JSON.stringify(this.chain, null, 4));
    console.log("address", address);
    console.log("\n");
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

let quaCoin = new Blockchain();

quaCoin.createTransaction(new Transaction("address-one", "address-two", 56));
quaCoin.createTransaction(new Transaction("address-two", "address-one", 23));

console.log("\nStarting the miner...");
quaCoin.minePendingTransactions("quaCoin");

console.log(
  "\nBalance of quaCoin is:",
  quaCoin.getBalanceOffAddress("address-two")
);

// console.log("is valid chain?", quaCoin.isChainValid());

// quaCoin.chain[1].data = { amount: 100 };
// quaCoin.chain[1].hash = quaCoin.chain[1].calculateHash();

// console.log("is valid chain to change?", quaCoin.isChainValid());
