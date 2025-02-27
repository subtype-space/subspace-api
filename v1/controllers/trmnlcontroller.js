require('dotenv').config({ path: '.env' });


module.exports = async (request, response) => {
  console.log('Accessed /trmnl')

  const { token, installation_callback_url } = request.query;
  response.json({ message: `${token}, ${installation_callback_url}` });

  const data = {
    code: `${token}`,
    client_id: process.env.TRMNL_CLIENT_ID,
    client_secret: process.env.TRMNL_CLIENT_SECRET,
    grant_type: "authorization_code",
  };

  trmnl_response = await fetch(process.env.TRMNL_ACCESS_TOKEN_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const access_token_data = await trmnl_response.json();
}
