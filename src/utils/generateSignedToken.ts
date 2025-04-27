import jwt from 'jsonwebtoken';

const secret = ''; // must match your server's JWT_SECRET!
const payload = {
    sub: 'morgana',
    iat: Math.floor(Date.now() / 1000),
  };
  

const token = jwt.sign(payload, secret);

console.log("Generated JWT:", token);
