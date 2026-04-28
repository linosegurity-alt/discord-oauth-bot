const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://discord-oauth-bot-ni1m.onrender.com/callback';
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const FIREBASE_URL = process.env.FIREBASE_URL;

async function refreshToken(userId, refreshToken) {
  const res = await axios.post('https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  await axios.put(`${FIREBASE_URL}/tokens/${userId}.json`, {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
  });
  return res.data.access_token;
}

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;
    const refresh = tokenRes.data.refresh_token;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userId = userRes.data.id;

    await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
      { access_token: accessToken },
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    await axios.put(`${FIREBASE_URL}/tokens/${userId}.json`, {
      access_token: accessToken,
      refresh_token: refresh,
      username: userRes.data.username
    });

    res.send('Verificado com sucesso!');
  } catch (err) {
    res.send('Erro: ' + err.message);
  }
});

app.get('/add-all', async (req, res) => {
  const secret = req.query.secret;
  if (secret !== process.env.ADMIN_SECRET) return res.send('Não autorizado');
  
  const newGuild = req.query.guild;
  if (!newGuild) return res.send('Informe o guild');

  try {
    const snap = await axios.get(`${FIREBASE_URL}/tokens.json`);
    const tokens = snap.data;
    let count = 0;

    for (const userId in tokens) {
      try {
        let accessToken = tokens[userId].access_token;
        try {
          accessToken = await refreshToken(userId, tokens[userId].refresh_token);
        } catch(e) {}
        
        await axios.put(
          `https://discord.com/api/guilds/${newGuild}/members/${userId}`,
          { access_token: accessToken },
          { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
        );
        count++;
      } catch (e) {}
    }

    res.send(`Adicionados: ${count} membros`);
  } catch (err) {
    res.send('Erro: ' + err.message);
  }
});

app.listen(3000, () => console.log('Rodando!'));
