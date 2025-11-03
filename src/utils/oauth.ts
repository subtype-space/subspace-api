import { jwtVerify, createRemoteJWKSet } from 'jose'

const auth_server_url = process.env.AUTH_SERVER_URL

const JWKS = createRemoteJWKSet(new URL(auth_server_url!))

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "https://auth.subtype.space/realms/subspace",
      audience: "account" // or your expected audience if customized
    })

    return payload // this will include `sub`, `azp`, `scope`, `client_id`, etc.
  } catch (err) {
    console.error("Token verification failed:", err)
    return null
  }
}
