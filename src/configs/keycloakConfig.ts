// Keycloak config file
// Edit this file or update .env file
export const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM || 'subspace',
    'auth-server-url': process.env.KEYCLOAK_AUTH_URL || 'https://auth.subtype.space',
    resource: process.env.KEYCLOAK_RESOURCE || 'subspace-api',
    'ssl-required': 'external',
    'confidential-port': 443,
    'bearer-only': true,
  }
  