require('dotenv').config({ path: '.env' })
const express = require('express')

const server = express();
server.use(express.json());


const PORT = process.env.PORT || 9595;
const VERSION = process.env.API_VERSION || "v1";


server.use('/', require(`./${VERSION}/routers/statusrouter`));
server.use('/status', require(`./${VERSION}/routers/statusrouter`));

server.listen(PORT, () => {
    console.log("subspace API now listening on PORT:", PORT);
});
