# Local Test Commands

curl -k -X GET -H "Content-Type: application/json" -d '{"appId": "your_app_id", "appSecret": "your_app_secret", "nonce": "your_nonce", "userId": "your_user_id", "prompt": "grand canyon"}' https://35.229.88.12:443/8d40aef2d91eba06b6581d3d1853e28e

# Blockade API Test
curl -X POST -H "Content-Type: application/json" -H "x-api-key: YOUR_API_KEY" -d '{"prompt":"YOUR_PROMPT"}' https://backend.blockadelabs.com/api/v1/skybox
