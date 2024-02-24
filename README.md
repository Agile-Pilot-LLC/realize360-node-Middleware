# Local Test Commands

curl -X GET -H "Content-Type: application/json" -d '{"appId": "yourAppId", "appSecret": "yourAppSecret", "nonce": "yourNonce", "userId": "yourUserId", "prompt": "yourPrompt"}' https://realizeapi-duyrq6q27q-uc.a.run.app/2fe1b096ed13e45b2bfb2751bf922cae

curl https://realizeapi-duyrq6q27q-uc.a.run.app/2fe1b096ed13e45b2bfb2751bf922cae

# Blockade API Test
curl -X POST -H "Content-Type: application/json" -H "x-api-key: YOUR_API_KEY" -d '{"prompt":"YOUR_PROMPT"}' https://backend.blockadelabs.com/api/v1/skybox
