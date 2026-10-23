# Deployment Guide — Intellihealth EHR dApp

Complete guide for deploying the Intellihealth blockchain EHR system to free hosting platforms.

---

## Overview

This application has 3 components:
1. **Smart Contract** — Deploy to Sepolia testnet (free, public Ethereum testnet)
2. **Frontend** — Deploy to Vercel (free tier)
3. **Backend API** — Deploy to Render (free tier)

---

## Prerequisites

- GitHub account (free)
- Vercel account (free) — https://vercel.com
- Render account (free) — https://render.com
- MongoDB Atlas account (free M0 tier) — https://www.mongodb.com/cloud/atlas
- Alchemy account (free) for Sepolia RPC — https://www.alchemy.com
- Pinata account (free) for IPFS — https://www.pinata.cloud
- MetaMask wallet with some Sepolia ETH (get from faucet)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas and sign up (free)
2. Create a new cluster:
   - Choose **M0 FREE** tier
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Cluster name: `intellihealth-db`
3. **Security Setup:**
   - Database Access → Add New Database User
   - Username: `intellihealth-api`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: `Read and write to any database`
4. **Network Access:**
   - Add IP Address → Click **"Allow Access from Anywhere"** (for demo)
   - This adds `0.0.0.0/0` (not recommended for production, but OK for demo)
5. **Get Connection String:**
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string, it looks like:
     ```
     mongodb+srv://intellihealth-api:<password>@intellihealth-db.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Save this string — you'll need it for Render deployment

---

## Step 2: Deploy Smart Contract to Sepolia

1. **Get Sepolia Testnet ETH:**
   - Go to https://sepoliafaucet.com or https://sepolia-faucet.pk910.de
   - Enter your MetaMask wallet address
   - Wait for testnet ETH to arrive (usually < 1 minute)

2. **Get Alchemy API Key:**
   - Go to https://www.alchemy.com and sign up (free)
   - Create a new app:
     - Name: `Intellihealth`
     - Chain: **Ethereum**
     - Network: **Sepolia**
   - Copy your **HTTPS** endpoint, looks like:
     ```
     https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY_HERE
     ```

3. **Configure Local Environment:**
   - Create `.env` file in project root (copy from `.env.example`):
     ```
     DEPLOYER_PRIVATE_KEY=your_metamask_private_key_here
     SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
     ```
   - **How to get your private key from MetaMask:**
     - Open MetaMask → Click 3 dots → Account Details → Export Private Key
     - Enter your password → Copy the key
     - ⚠️ **NEVER commit this file to GitHub!**

4. **Deploy:**
   ```bash
   npm run deploy:sepolia
   ```
   - Wait for deployment to complete
   - Copy the **deployed contract address** from the output
   - Save it — you'll need it for frontend configuration

---

## Step 3: Deploy Backend to Render

1. **Push Your Code to GitHub** (if not already done):
   ```bash
   git add -A
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

3. **Connect GitHub Repository:**
   - Click **"Connect account"** → Authorize Render to access your GitHub
   - Select your repository: `MiniProject-Blockchain-`

4. **Configure Service:**
   - **Name:** `intellihealth-api`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** **Free**

5. **Add Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these 3 variables:
   
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `ADMIN_ADDRESS` | Your MetaMask admin wallet address (lowercase) |
   | `ALLOWED_ORIGIN` | `https://your-app-name.vercel.app` (we'll get this in Step 4) |

   **Note:** For `ALLOWED_ORIGIN`, you can use `*` temporarily, then update it after deploying the frontend.

6. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://intellihealth-api.onrender.com`
   - **⚠️ Important:** Free tier sleeps after 15 min of inactivity. First request takes ~30 seconds to wake up.

---

## Step 4: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import GitHub Repository:**
   - Click **"Import"** on your `MiniProject-Blockchain-` repository
   - If not visible, click **"Adjust GitHub App Permissions"**

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` ← **IMPORTANT!**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables:**
   Click **"Environment Variables"** and add these:
   
   | Name | Value |
   |------|-------|
   | `VITE_PINATA_JWT` | Your Pinata JWT token from https://app.pinata.cloud/keys |
   | `VITE_PINATA_GATEWAY` | `https://gateway.pinata.cloud/ipfs/` |
   | `VITE_CHAIN_ID` | `11155111` (Sepolia) |
   | `VITE_CONTRACT_ADDRESS` | The contract address from Step 2 |
   | `VITE_API_URL` | Your Render backend URL from Step 3 |

5. **Update `contract.json`:**
   Before deploying, manually update `frontend/src/contract.json`:
   - Change the `address` field to your deployed Sepolia contract address
   - Commit and push this change:
     ```bash
     git add frontend/src/contract.json
     git commit -m "Update contract address for Sepolia deployment"
     git push origin main
     ```

6. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete (~2 minutes)
   - Copy your frontend URL: `https://your-app-name.vercel.app`

7. **Update Render Backend ALLOWED_ORIGIN:**
   - Go back to Render dashboard
   - Select your `intellihealth-api` service
   - Environment → Edit `ALLOWED_ORIGIN`
   - Set to your Vercel URL: `https://your-app-name.vercel.app`
   - Save (this will redeploy the backend)

---

## Step 5: Test Your Deployment

1. **Open Your Vercel URL** in a browser with MetaMask installed

2. **Connect MetaMask to Sepolia:**
   - MetaMask → Network dropdown → Sepolia test network
   - Make sure you have some Sepolia ETH

3. **Test Admin Flow:**
   - Connect with your admin wallet (the one you deployed the contract with)
   - You should auto-redirect to `/sys-panel-9f3a`
   - Register a doctor (use a different MetaMask account address)
   - Register a patient (use another MetaMask account address)

4. **Test Doctor Flow:**
   - Disconnect wallet → Connect with the doctor account
   - Switch to doctor account in MetaMask
   - Refresh the page → Should redirect to `/doctor`
   - Create a test EHR for a patient (if they granted you Creator access)

5. **Test Patient Flow:**
   - Disconnect → Connect with patient account
   - Should redirect to `/patient`
   - View your health records
   - Grant doctor access
   - Book an appointment

---

## Troubleshooting

### Frontend shows "Contract not found"
- Check `VITE_CONTRACT_ADDRESS` in Vercel env vars matches your deployed address
- Check `frontend/src/contract.json` has the correct address
- Redeploy: `git push` → Vercel auto-deploys

### Backend API calls fail with CORS error
- Check `ALLOWED_ORIGIN` in Render matches your exact Vercel URL (no trailing slash)
- Wait for Render to finish redeploying after changing env vars

### MetaMask transactions fail
- Make sure you're on Sepolia network
- Check you have Sepolia ETH (get from faucet)
- Check `VITE_CHAIN_ID=11155111` is set correctly

### IPFS upload fails
- Check your Pinata JWT is valid: https://app.pinata.cloud/keys
- Free tier has rate limits (100 pins/month)
- Check browser console for specific error message

### Backend shows "MongoDB not connected"
- Check your `MONGODB_URI` is correct (password replaced)
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check your cluster is not paused (Atlas pauses inactive free clusters)

### Admin route not working
- Admin is the wallet that deployed the contract
- Go directly to: `https://your-app.vercel.app/sys-panel-9f3a`
- Check browser console for contract call errors

---

## Cost Breakdown

All services used are **100% FREE** for this demo:

| Service | Free Tier Limits |
|---------|------------------|
| **Vercel** | 100 GB bandwidth/month, unlimited projects |
| **Render** | 750 hours/month (1 service running 24/7), sleeps after 15min inactive |
| **MongoDB Atlas** | M0 cluster: 512 MB storage, shared RAM |
| **Alchemy** | 300M compute units/month (plenty for a demo) |
| **Pinata** | 1 GB storage, 100 pins/month |
| **Sepolia ETH** | Free from faucets |

**Total monthly cost:** $0 USD

---

## Production Considerations

Before using this for real medical data:

⚠️ **CRITICAL SECURITY ISSUES TO FIX:**

1. **Backend Auth:** Replace header-trust with MetaMask signature verification
2. **Encryption Keys:** Derive per-user keys from wallet signatures, remove hardcoded defaults
3. **Network Access:** Restrict MongoDB Atlas to specific Render IP (not `0.0.0.0/0`)
4. **HTTPS Only:** Ensure all API calls use HTTPS
5. **Rate Limiting:** Implement stricter rate limits (current: 100 req/15min)
6. **Input Validation:** Add Joi/Zod schema validation on all backend routes
7. **Audit Logging:** Add comprehensive audit trail for all data access
8. **HIPAA Compliance:** Consult legal team, implement BAA with all service providers

---

## Useful Links

- **Sepolia Faucet:** https://sepoliafaucet.com
- **Sepolia Explorer:** https://sepolia.etherscan.io
- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas

---

## Questions?

Check the main `README.md` for architecture details and local development setup.
