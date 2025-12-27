

# 🌱 TraceBloom

### Blockchain-Powered Agricultural Supply Chain & Smart Contract Payments

TraceBloom is a **full-stack Web3 platform** that enables transparent, trustless, and verifiable agricultural supply chains.
It connects **farmers, distributors, and consumers** using **blockchain tracking, smart contract escrow payments, and real-time verification**.

---

## 🚀 Key Highlights

* 🌾 End-to-end agricultural batch tracking
* 🔗 Blockchain-verified supply chain history
* 💰 Smart-contract–based escrow payments
* 🔐 Wallet authentication & role-based access
* 📊 Real-time dashboards for all stakeholders
* ☁️ Secure cloud image uploads (Cloudinary)

---

## 🏗️ Tech Stack

### Frontend

* **React + TypeScript**
* **Tailwind CSS + shadcn/ui**
* **React Router**
* **Axios**
* **Ethers.js (Web3 integration)**
* **MetaMask / WalletConnect**

### Backend

* **Node.js + Express**
* **PostgreSQL (Neon)**
* **Prisma ORM**
* **JWT Authentication**
* **Cloudinary**
* **Ethers.js (Blockchain verification)**

### Blockchain

* **Solidity Smart Contracts**
* **Ethereum / Polygon (Testnet)**
* **Hardhat / Foundry**

---

## 👥 User Roles & Features

### 👨‍🌾 Farmer

* Create and manage crop batches
* Upload batch images & metadata
* Receive **on-chain payments directly to wallet**
* View immutable transaction history
* Build trust with verified supply chain records

---

### 🚚 Distributor

* View incoming farmer batches
* Update shipment & distribution status
* Verify consumer payments
* **Release escrowed payments on delivery**
* Maintain transparent action logs

---

### 🧑‍💼 Consumer

* Scan QR code to verify product authenticity
* View complete batch lifecycle (farm → distributor)
* Make **blockchain payments via smart contract**
* Track transaction status on blockchain
* Leave ratings & reviews

---

## 🔐 Smart Contract Payment Flow

```
Consumer → Smart Contract (Escrow)
           ↓
       Blockchain
           ↓
Distributor Confirms Delivery
           ↓
Smart Contract Releases Payment
           ↓
Farmer Wallet Receives Funds
```

### Key Benefits

* No intermediaries
* No fake payments
* No chargebacks
* Fully verifiable transactions
* Trustless escrow settlement

---

## 📜 Smart Contract Features

* Escrow-based payments per batch
* Immutable on-chain records
* Event-driven payment lifecycle
* Secure fund release mechanism
* Public payment verification

---

## 🧠 Backend Responsibilities

* Role-based authentication (JWT)
* Batch & user management
* Blockchain transaction verification
* Payment status synchronization
* Secure API endpoints
* Cloudinary media handling

---

## 🖥️ Frontend Features

* Modern, responsive UI
* Role-specific dashboards
* Wallet connection (MetaMask)
* On-chain payment initiation
* Blockchain explorer links
* Beautiful UX with proper spacing & layout

---

## 📊 Database Schema (Core Entities)

* Users (Farmer / Distributor / Consumer)
* Batches
* Distributor Actions
* Consumer Actions
* Blockchain Payments
* Reviews & Ratings

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
PORT=4000
NODE_ENV=development

RPC_URL=https://sepolia.infura.io/v3/xxxx
CONTRACT_ADDRESS=0xYourSmartContract

cloudname=xxxx
cloud_api_key=xxxx
cloud_api_secret=xxxx
CLOUDINARY_URL=cloudinary://...
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_CONTRACT_ADDRESS=0xYourSmartContract
```

---

## 🛠 Installation & Setup

### Backend

```bash
cd TraceBloom-Backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

### Frontend

```bash
cd TraceBloom-Frontend
npm install
npm run dev
```

---

## 🔗 Smart Contract Deployment

1. Deploy using Hardhat / Foundry
2. Copy contract address
3. Update environment variables
4. Use ABI in frontend & backend

---

## 🧪 Security Features

* JWT-based authentication
* Role-based authorization
* Blockchain transaction verification
* Wallet ownership validation
* Escrow-based fund handling

---

## 🌍 Use Cases

* Organic produce verification
* Fair trade marketplaces
* Supply chain transparency
* Fraud-proof agricultural commerce
* Web3-enabled farmer empowerment

---

## 📈 Future Enhancements

* Stablecoin payments (USDC)
* DAO-based dispute resolution
* QR-based on-chain verification
* Gasless transactions
* Mobile app integration
* Analytics & insights dashboard

