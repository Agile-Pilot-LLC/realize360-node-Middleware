const axios = require('axios');

async function consumePurchase(sku, userId){
    // curl -d "access_token=OC|$APP_ID|$APP_SECRET" -d "sku=$SKU" https://graph.oculus.com/$APP_ID/consume_entitlement
    const appId = process.env.APP_ID;
    const appSecret = process.env.APP_SECRET;
    const accessToken = `OC|${appId}|${appSecret}`;
    const response = await axios.post(`https://graph.oculus.com/${appId}/consume_entitlement`, {
        access_token: accessToken,
        sku: sku,
        user_id: userId
    });
    if(response.data.success){
        return true;
    }
    else{
        return false;
    }
}

module.exports = consumePurchase;