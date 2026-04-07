const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URI

  if (!uri) {
    console.error('MongoDB URI missing. Expected MONGO_URL (or MONGO_URI / MONGODB_URI) in backend .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('✅ MongoDB Connected')
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message)
    process.exit(1)
  }
}