# Local Test Commands

curl -k -X GET -H "Content-Type: application/json" -d '{"appId": "your_app_id", "appSecret": "your_app_secret", "nonce": "your_nonce", "userId": "your_user_id", "prompt": "grand canyon"}' https://localhost:443/ea80ace13d1f296d26cadbaca1992e36

# Blockade API Test
curl -X POST -H "Content-Type: application/json" -H "x-api-key: " -d '{"prompt":"YOUR_PROMPT"}' https://backend.blockadelabs.com/api/v1/skybox
