# subspace-api
NOTE! This repository, if viewed on GitHub, is a downstream mirror. Our active API service may not reflect changes that are shown here in a timely manner.

subspace-api is an express-based RESTful API and Model Context Protocol (MCP) server.

If you are utilizing this API provided and hosted by us, please be sure to abide by the [TOS](https://wiki.subtype.space/s/tos). Otherwise, you are free to clone and self host provided you abide by the GNU GPLv3 license, and the TOS will not pertain to you!

# Getting Started
## With Docker (preferrably compose)
### Building your own image
```
docker compose build && docker compose up -d
```
### Pulling from stable releases
```
docker compose pull && docker compose up -d
```

## Manual build
Single line start, attached
```
npm run build && npm run start
```

# Setting up your .env
| Env var | Purpose |
|---------|--------|
| PORT | Defaults to 9595. The port for the API and MCP server to listen on. |
| LOG_LEVEL | Defaults to 'info'. Set the logging level |
| ACTIVE_VERSION | Defaults to 'v1', currently not implemented fully. |
| WMATA_PRIMARY_KEY | The API key to use for obtaining WMATA status. |
| JWT_SECRET | This is the secret key that is used for encrypting and decrypting JWT tokens. |
| TZ | (Optional) Lets the container/logger format log messages with the machine's local time zone. |