# Monthly Anniversary SMS Reminder 💕

Automatically sends SMS reminders to you and your partner on the 18th of every month!

## Setup Instructions

### 1. Get Twilio Credentials

1. Go to [twilio.com](https://www.twilio.com/try-twilio) and sign up
2. You'll get **$15 free credit** (enough for ~500 SMS messages!)
3. From your [Twilio Console](https://console.twilio.com/):
   - Copy your **Account SID**
   - Copy your **Auth Token**
   - Get a **Twilio Phone Number** (free with trial)

### 2. Install Dependencies

```bash
cd anniversary-reminder
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your details:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   YOUR_PHONE_NUMBER=+919876543210
   HER_PHONE_NUMBER=+919876543210
   ```

   **Important:** Phone numbers must include country code!
   - India: +91
   - USA: +1
   - UK: +44

### 4. Test Locally

```bash
npm start
```

Visit `http://localhost:3000/test-send` to send a test SMS immediately!

### 5. Deploy to Cloud (Free Options)

#### Option A: Render.com (Recommended - Free Forever)

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables (from your `.env` file)
7. Click "Create Web Service"

Done! It will run 24/7 for free.

#### Option B: Railway.app

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "Deploy from GitHub repo"
4. Select your repo
5. Add environment variables
6. Deploy!

#### Option C: Fly.io

```bash
# Install flyctl
npm install -g flyctl

# Login and deploy
fly auth login
fly launch
fly secrets set TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx ...
fly deploy
```

## How It Works

- **Runs every month on the 18th at 9:00 AM** (Asia/Kolkata timezone)
- Calculates months since August 18, 2025
- Sends SMS to both phone numbers
- Completely automated - no manual intervention needed!

## Customize

### Change Time
Edit `server.js` line 42:
```javascript
// Current: 9:00 AM
cron.schedule('0 9 18 * *', ...)

// 8:00 PM example:
cron.schedule('0 20 18 * *', ...)
```

### Change Timezone
Edit `server.js` line 46:
```javascript
timezone: "America/New_York"  // or your timezone
```

### Change Message
Edit `server.js` line 23-25 to customize the SMS text!

## Monitoring

- Visit your deployed URL to check status
- Check Twilio console for SMS logs
- Server logs show when messages are sent

## Cost

- **Twilio:** $15 free credit (lasts ~2 years for monthly SMS)
- **Hosting:** Free on Render/Railway/Fly.io
- **Total:** $0 for first 2 years! 🎉

## Troubleshooting

### SMS not sending?
- Check Twilio console for errors
- Verify phone numbers have country codes
- Ensure Twilio trial is verified

### Server not running?
- Check deployment logs
- Verify environment variables are set
- Test locally first

---

Made with ❤️ for celebrating every month together!
