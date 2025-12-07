import express from 'express';
import cron from 'node-cron';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const yourPhone = process.env.YOUR_PHONE_NUMBER;
const herPhone = process.env.HER_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Function to send SMS to both
async function sendAnniversaryReminders() {
  const now = new Date();
  const monthsSince = (now.getFullYear() - 2025) * 12 + (now.getMonth() - 7); // Aug = 7 (0-indexed)

  const message = `💕 Happy ${monthsSince} Month Anniversary! 💕\n\nIt's been ${monthsSince} beautiful months since August 18, 2025. Here's to many more! ❤️`;

  try {
    // Send to your phone
    const msg1 = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: yourPhone
    });
    console.log(`SMS sent to you: ${msg1.sid}`);

    // Send to her phone
    const msg2 = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: herPhone
    });
    console.log(`SMS sent to her: ${msg2.sid}`);

    console.log('✅ Anniversary reminders sent successfully!');
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
  }
}

// Function to send almond soak reminder (9 PM)
async function sendSoakAlmondsReminder() {
  const message = `Time to soak almonds!\n\nDon't forget to soak your almonds for tomorrow morning. Good night!`;

  try {
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: herPhone
    });
    console.log(`Soak almonds reminder sent: ${msg.sid}`);
  } catch (error) {
    console.error('❌ Error sending soak reminder:', error.message);
  }
}

// Function to send eat almonds reminder (6 AM)
async function sendEatAlmondsReminder() {
  const message = `Good morning! Time to eat your soaked almonds!\n\nStart your day healthy!`;

  try {
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: herPhone
    });
    console.log(`Eat almonds reminder sent: ${msg.sid}`);
  } catch (error) {
    console.error('❌ Error sending eat reminder:', error.message);
  }
}

// Schedule to run on the 18th of every month at 9:00 AM
// Cron format: minute hour day month day-of-week
cron.schedule('0 9 18 * *', () => {
  console.log('🎉 Running anniversary reminder...');
  sendAnniversaryReminders();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Schedule almond soak reminder - Every day at 9:00 PM
cron.schedule('0 21 * * *', () => {
  console.log('🥜 Sending soak almonds reminder...');
  sendSoakAlmondsReminder();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Schedule eat almonds reminder - Every day at 6:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('🌅 Sending eat almonds reminder...');
  sendEatAlmondsReminder();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Anniversary Reminder Service is active!',
    nextRun: 'Every 18th of the month at 9:00 AM'
  });
});

// Manual test endpoint (optional - for testing)
app.get('/test-send', async (req, res) => {
  try {
    await sendAnniversaryReminders();
    res.json({ success: true, message: 'Test SMS sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint - sends only to your number
app.get('/test-me', async (req, res) => {
  const now = new Date();
  const monthsSince = (now.getFullYear() - 2025) * 12 + (now.getMonth() - 7);
  const message = `💕 Happy ${monthsSince} Month Anniversary! 💕\n\nIt's been ${monthsSince} beautiful months since August 18, 2025. Here's to many more! ❤️`;

  try {
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: yourPhone
    });
    console.log(`Test SMS sent to you: ${msg.sid}`);
    res.json({ success: true, message: 'Test SMS sent to your number only!', sid: msg.sid });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test almond soak reminder
app.get('/test-soak', async (req, res) => {
  try {
    await sendSoakAlmondsReminder();
    res.json({ success: true, message: 'Soak almonds reminder sent to her!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test almond eat reminder
app.get('/test-eat', async (req, res) => {
  try {
    await sendEatAlmondsReminder();
    res.json({ success: true, message: 'Eat almonds reminder sent to her!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Anniversary Reminder Server running on port ${PORT}`);
  console.log(`\n📅 Scheduled Reminders:`);
  console.log(`  💕 Anniversary: 18th of every month at 9:00 AM (both)`);
  console.log(`  🥜 Soak Almonds: Every day at 9:00 PM (her only)`);
  console.log(`  🌅 Eat Almonds: Every day at 6:00 AM (her only)`);
  console.log(`\n⏰ Timezone: Asia/Kolkata`);
  console.log(`\n🧪 Test endpoints:`);
  console.log(`  /test-send - Test anniversary (both)`);
  console.log(`  /test-me - Test anniversary (you only)`);
  console.log(`  /test-soak - Test soak almonds (her only)`);
  console.log(`  /test-eat - Test eat almonds (her only)`);
});
