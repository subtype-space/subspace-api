import { Request, Response } from 'express';

interface TrmnlTokenResponse {
  access_token: string;
  [key: string]: any; // For other potential fields in the response
}

const trmnlController = async (request: Request, response: Response): Promise<void> => {
  console.log('Accessed /trmnl');
  const TRMNL_CLIENT_ID = process.env.TRMNL_CLIENT_ID || "null-client";
  const TRMNL_CLIENT_SECRET = process.env.TRMNL_CLIENT_SECRET;

  const { code, installation_callback_url } = request.query as { 
    code?: string, 
    installation_callback_url?: string 
  };

  if (!code) {
    console.error("Entity tried requesting with missing or bad code");
    response.status(400).json({ message: "Request failed - missing or bad code. Responding with ERR 400." });
    return;
  }

  response.json({ code, installation_callback_url });

  const data = {
    code: code,
    client_id: TRMNL_CLIENT_ID,
    client_secret: TRMNL_CLIENT_SECRET,
    grant_type: "authorization_code",
  };

  console.log("Validating token from TRMNL");
  try {
    const trmnl_response = await fetch("https://usetrmnl.com/oauth/token", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (!trmnl_response.ok) {
      response.status(400).json({ message: "Error fetching access token from TRMNL" });
      return;
    }

    const trmnl_data = await trmnl_response.json() as TrmnlTokenResponse;
    const accessToken = trmnl_data.access_token;

    console.log("Fetch access token of", accessToken);
    console.log("Redirecting user");
    
    if (installation_callback_url) {
      response.redirect(installation_callback_url);
    } else {
      response.status(400).json({ message: "Missing installation callback URL" });
    }
  } catch (error) {
    console.error("Error during TRMNL token validation:", error);
    response.status(500).json({ message: "Internal server error during token validation" });
  }
};

export default trmnlController;

// Alternative export options:
// export = trmnlController; // CommonJS-style export (used for backwards compatibility)
// export { trmnlController }; // Named export