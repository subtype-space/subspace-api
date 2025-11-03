// Not really meant for use within the server, this is just a utility
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })
const secret = process.env.JWT_SECRET

if (!secret) {
  throw new Error('Secret is undefined! Cannot generate token')
}

const payload = {
  sub: 'morgana'
}

const token = jwt.sign(payload, secret!, { expiresIn: '1h' })

console.log('Generated JWT:', token)
