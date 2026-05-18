# WorldView — Setup Guide for Windows

Follow these steps in order. Each one builds on the last.
Estimated time: 2–3 hours your first time.

---

## PHASE 1 — Install the Tools (Do This Once)

### Step 1: Install Node.js
1. Open your browser and go to: https://nodejs.org
2. Click the big green "LTS" button to download
3. Run the installer — click Next on every screen, keep all defaults
4. When done, press Windows key, type "cmd", press Enter to open Command Prompt
5. Type this and press Enter:
   node --version
6. You should see something like: v20.11.0
   If you do, Node.js is installed. ✅

### Step 2: Install VS Code
1. Go to: https://code.visualstudio.com
2. Click "Download for Windows"
3. Run the installer — on the "Select Additional Tasks" screen,
   CHECK the box that says "Add to PATH" and "Open with Code"
4. Finish the install ✅

### Step 3: Install Git
1. Go to: https://git-scm.com/download/win
2. Download and run the installer
3. Click Next on every screen — keep ALL defaults
4. When done, close and reopen Command Prompt
5. Type: git --version
6. You should see something like: git version 2.44.0 ✅

---

## PHASE 2 — Set Up the Project

### Step 4: Move the worldview folder to your Desktop
- Take the worldview folder you downloaded and move it to:
  C:\Users\YOURNAME\Desktop\worldview

### Step 5: Open the project in VS Code
1. Open Command Prompt (Windows key → type "cmd" → Enter)
2. Type these commands one at a time, pressing Enter after each:

   cd Desktop\worldview
   code .

VS Code will open with your project. ✅

### Step 6: Open the Terminal inside VS Code
1. In VS Code, click "Terminal" in the top menu
2. Click "New Terminal"
3. A panel opens at the bottom — this is your terminal

### Step 7: Install the project dependencies
In the VS Code terminal, type:

   npm install

Wait 1–2 minutes while it downloads everything.
You'll see a lot of text scroll by — that's normal. ✅

---

## PHASE 3 — Add Your API Keys

### Step 8: Get your Anthropic API key
1. Go to: https://console.anthropic.com
2. Sign up for a free account (you'll need to add a credit card — the API costs
   about $0.003 per story localization, so very cheap)
3. Click "API Keys" in the left sidebar
4. Click "Create Key" — give it a name like "worldview"
5. COPY the key — it starts with "sk-ant-..."
   WARNING: You only see it once, so copy it now!

### Step 9: Get your NewsAPI key
1. Go to: https://newsapi.org
2. Click "Get API Key" and create a free account
3. Your key appears on the dashboard — copy it

### Step 10: Add keys to your project
1. In VS Code, look at the left panel (the file explorer)
2. Click on the file called ".env.local"
3. You'll see:
   ANTHROPIC_API_KEY=paste_your_anthropic_key_here
   NEWS_API_KEY=paste_your_newsapi_key_here
4. Replace "paste_your_anthropic_key_here" with your actual Anthropic key
5. Replace "paste_your_newsapi_key_here" with your actual NewsAPI key
6. Press Ctrl+S to save

Example of what it should look like:
   ANTHROPIC_API_KEY=sk-ant-abc123yourkeyhere
   NEWS_API_KEY=a1b2c3d4yourkeyhere

---

## PHASE 4 — Test It Locally

### Step 11: Start the development server
In the VS Code terminal, type:

   npm run dev

You'll see:
   ▲ Next.js 14.2.3
   - Local: http://localhost:3000

### Step 12: Open your site
1. Open your browser
2. Go to: http://localhost:3000
3. You should see WorldView with news stories!
4. Click "🇺🇸 Make It Make Sense for Americans" on any story
5. Claude will rewrite it for a US audience in a few seconds ✅

If something looks wrong:
- "Module not found" → run: npm install
- Blank page → check VS Code terminal for red error text
- AI button does nothing → double-check your .env.local keys have no spaces

To stop the server: press Ctrl+C in the terminal

---

## PHASE 5 — Put It on GitHub

### Step 13: Create a GitHub account
1. Go to: https://github.com
2. Click "Sign up" — use your email, create a username and password

### Step 14: Create a repository
1. Click the "+" icon in the top right of GitHub
2. Click "New repository"
3. Name: worldview
4. Keep it Public
5. Do NOT check "Add a README" (you already have one)
6. Click "Create repository"

### Step 15: Upload your code
GitHub will show you commands. In your VS Code terminal, run these
(replace YOURUSERNAME with your actual GitHub username):

   git init
   git add .
   git commit -m "Initial WorldView launch"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/worldview.git
   git push -u origin main

It will ask for your GitHub username and password.
NOTE: For the password, use a Personal Access Token, not your GitHub password.
To get one: GitHub → Settings → Developer Settings → Personal Access Tokens
→ Tokens (classic) → Generate new token → check "repo" → Generate → copy it

Your code is now on GitHub ✅

---

## PHASE 6 — Deploy Live on Vercel

### Step 16: Create a Vercel account
1. Go to: https://vercel.com
2. Click "Sign Up" → choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### Step 17: Deploy your project
1. On the Vercel dashboard, click "Add New Project"
2. You'll see your "worldview" repository — click "Import"
3. Leave all settings as default
4. Click "Deploy"
5. Wait 1–2 minutes ⏳
6. You'll see confetti and a link like: worldview-yourname.vercel.app
   Click "Visit" — your site is live on the internet! ✅

### Step 18: Add your API keys to Vercel
Your .env.local file does NOT get uploaded to GitHub (that's the point).
So you need to add your keys to Vercel separately:

1. In Vercel, click your project → "Settings" tab → "Environment Variables"
2. Add the first variable:
   - Key: ANTHROPIC_API_KEY
   - Value: (paste your Anthropic key)
   - Click "Save"
3. Add the second variable:
   - Key: NEWS_API_KEY
   - Value: (paste your NewsAPI key)
   - Click "Save"

### Step 19: Redeploy with the new keys
1. Click the "Deployments" tab
2. Click the three dots "..." next to the most recent deployment
3. Click "Redeploy"
4. Wait 1 minute
5. Visit your live site — everything should work! ✅

---

## PHASE 7 — Add a Custom Domain (Optional, ~$12/year)

### Step 20: Buy a domain
1. Go to: https://namecheap.com
2. Search for something like "worldviewnews.com" or "worldviewdaily.com"
3. Add to cart and purchase (~$10–14/year)

### Step 21: Connect it to Vercel
1. In Vercel → your project → Settings → Domains
2. Type your domain name → click "Add"
3. Vercel gives you 2 DNS records to copy
4. Go to Namecheap → your domain → "Advanced DNS"
5. Add those records
6. Wait 10–30 minutes for it to go live

---

## YOU'RE LIVE! 🎉

Your WorldView site is now:
✅ Pulling real international news every 15 minutes
✅ AI-localizing stories for American readers on demand
✅ Deployed at a real URL anyone can visit
✅ Ready for Google AdSense (apply at google.com/adsense)
✅ Auto-redeploying every time you push changes to GitHub

## Next Steps
- Apply for Google AdSense: https://google.com/adsense
- Set up your newsletter: https://beehiiv.com (free up to 2,500 subscribers)
- Post daily on Threads/Twitter: share your top 3 stories every morning
- Post to Reddit: r/worldnews, r/geopolitics with your best stories

Questions? Every error message is searchable — copy it into Google
or paste it into Claude for a fix.
