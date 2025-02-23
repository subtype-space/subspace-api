require('dotenv').config({ path: '.env' });


module.exports = (request, response) => {
    console.log('Accessed /status')

    const version = request.query.apiversion;
    response.json({message: `${version}`});
    //response.json({message: "OK!", status: 200, api_version: `${ACTIVE_VERSION}`});
}