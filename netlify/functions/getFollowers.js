const axios = require('axios');

const APP_ID = 'your-app-id';
const CLIENT_KEY = 'your-client-key';
const CLIENT_SECRET = 'your-client-secret';
const OPEN_ID = 'your-open-id';

exports.handler = async (event, context) => {
    try {
        const tokenResponse = await axios.post('https://open-api.tiktok.com/oauth/access_token', {
            client_key: CLIENT_KEY,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: 'authorization-code',
        });

        const accessToken = tokenResponse.data.data.access_token;

        const userInfoResponse = await axios.get(`https://open-api.tiktok.com/user/info/?open_id=${OPEN_ID}&access_token=${accessToken}`);

        const followersCount = userInfoResponse.data.data.follower_count;

        return {
            statusCode: 200,
            body: JSON.stringify({ followers: followersCount }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Błąd pobierania danych o obserwujących' }),
        };
    }
};
