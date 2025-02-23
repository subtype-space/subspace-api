require('dotenv').config({ path: '.env' })
const express = require('express')

const server = express();
server.use(express.json());


const PORT = process.env.PORT || 9595;
const ACTIVE_VERSION = process.env.API_VERSION || "v1";



server.use('/v1/trmnl', require(`./${ACTIVE_VERSION}/routers/trmnlrouter`));


// catch all/health check
server.use('/health', require(`./${ACTIVE_VERSION}/routers/statusrouter`))
server.use('/*', require(`./${ACTIVE_VERSION}/routers/statusrouter`))


server.listen(PORT, () => {
    console.log("subspace API now listening on PORT:", PORT);
});
