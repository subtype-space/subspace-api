require('dotenv').config({ path: '.env' });

const ACTIVE_VERSION = process.env.API_VERSION || "v1";

module.exports = (request, response) => {
    console.log('Accessed /status')
    response.json({message: "OK!", status: 200, api_version: `${ACTIVE_VERSION}`});
}