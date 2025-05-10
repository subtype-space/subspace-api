import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    kauth?: {
      grant: {
        access_token: {
          content: {
            preferred_username?: string
            clientId?: string
            sub: string
            realm_access?: {
              roles?: string[]
            }
            [key: string]: any
          }
        }
      }
    }
  }
}
