module.exports = async (request, response) => {
  console.log('Accessed /trmnl')
  const TRMNL_CLIENT_ID = process.env.TRMNL_CLIENT_ID || "null-client"
  const TRMNL_CLIENT_SECRET = process.env.TRMNL_CLIENT_SECRET

  const { code, installation_callback_url } = request.query;

  if (!code) {
    console.error("Entity tried requesting with missing or bad code")
    return response.status(400).json({ message: "Request failed - missing or bad code. Responding with ERR 400." });
  }

  response.json({ code, installation_callback_url });

  const data = {
    code: code,
    client_id: TRMNL_CLIENT_ID,
    client_secret: TRMNL_CLIENT_SECRET,
    grant_type: "authorization_code",
  };

  console.log("Validating token from TRMNL");
  const trmnl_response = await fetch("https://usetrmnl.com/oauth/token", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });

  if (!trmnl_response.ok) {
    return response.status(400).json({ message: "Error fetching access token from TRMNL" });
  }

  const trmnl_data = await trmnl_response.json();
  const accessToken = trmnl_data.access_token;

  console.log("Fetch access token of", accessToken);
  console.log("Redirecting user");
  response.redirect(installation_callback_url, 302);
}
