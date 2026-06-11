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
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #04020d;
      --surface: #0b0720;
      --border: rgba(120, 80, 255, 0.18);
      --purple: #7c4dff;
      --purple2: #b47cff;
      --cyan: #00e5ff;
      --text: #ece8ff;
      --muted: #7a6fa0;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Space Grotesk', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* ── CANVAS DE PARTÍCULAS ── */
    #canvas {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    /* ── GLOW RADIAL ── */
    .bg-glow {
      position: fixed;
      inset: 0;
      z-index: 0;
      background:
        radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,77,255,0.18) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,229,255,0.08) 0%, transparent 60%);
      pointer-events: none;
    }

    /* ── GRID ── */
    .bg-grid {
      position: fixed;
      inset: 0;
      z-index: 0;
      background-image:
        linear-gradient(rgba(124,77,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(124,77,255,0.05) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
      pointer-events: none;
    }

    /* ── CARD ── */
    .card {
      position: relative;
      z-index: 1;
      width: 420px;
      max-width: calc(100vw - 32px);
      padding: 52px 40px 44px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 28px;
      text-align: center;
      box-shadow: 0 0 80px rgba(124,77,255,0.12), 0 30px 80px rgba(0,0,0,0.6);
      animation: cardIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(40px) scale(0.94); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* top shimmer line */
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 15%; right: 15%;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--purple2), var(--cyan), var(--purple2), transparent);
      border-radius: 999px;
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%,100% { opacity: 0.5; left: 15%; right: 15%; }
      50%      { opacity: 1;   left: 5%;  right: 5%; }
    }

    /* ── SHIELD ICON (SVG animado) ── */
    .shield-wrap {
      width: 88px;
      height: 88px;
      margin: 0 auto 28px;
      position: relative;
      animation: iconIn 0.7s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes iconIn {
      from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
      to   { opacity: 1; transform: scale(1) rotate(0deg); }
    }

    .shield-bg {
      position: absolute;
      inset: 0;
      border-radius: 22px;
      background: linear-gradient(135deg, rgba(124,77,255,0.25), rgba(0,229,255,0.08));
      border: 1px solid rgba(124,77,255,0.35);
      animation: shieldPulse 3s ease-in-out infinite;
    }

    @keyframes shieldPulse {
      0%,100% { box-shadow: 0 0 20px rgba(124,77,255,0.2); }
      50%      { box-shadow: 0 0 44px rgba(124,77,255,0.5), 0 0 80px rgba(0,229,255,0.1); }
    }

    .shield-svg {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      padding: 18px;
    }

    /* scan line inside shield */
    .scan-line {
      position: absolute;
      left: 14px; right: 14px;
      height: 1.5px;
      background: linear-gradient(90deg, transparent, var(--cyan), transparent);
      top: 18px;
      animation: scan 2.4s ease-in-out infinite;
      border-radius: 999px;
    }

    @keyframes scan {
      0%   { top: 18px; opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: calc(100% - 18px); opacity: 0; }
    }

    /* ── BRAND / TÍTULO ── */
    .brand {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: var(--cyan);
      opacity: 0.7;
      margin-bottom: 10px;
      animation: fadeUp 0.5s 0.4s both;
    }

    h1 {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 12px;
      animation: fadeUp 0.5s 0.5s both;
    }

    h1 .accent {
      background: linear-gradient(90deg, var(--purple2), var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .desc {
      font-size: 13.5px;
      color: var(--muted);
      line-height: 1.65;
      margin-bottom: 36px;
      animation: fadeUp 0.5s 0.55s both;
    }

    /* ── STEPS ── */
    .steps {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 0;
      margin-bottom: 36px;
      animation: fadeUp 0.5s 0.6s both;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .step-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: rgba(124,77,255,0.12);
      border: 1px solid rgba(124,77,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .step-icon svg { width: 18px; height: 18px; }

    .step-label {
      font-size: 10.5px;
      color: var(--muted);
      text-align: center;
      max-width: 72px;
      line-height: 1.4;
    }

    .step-connector {
      width: 32px;
      height: 1px;
      background: linear-gradient(90deg, rgba(124,77,255,0.3), rgba(0,229,255,0.2));
      margin-top: 21px;
      flex-shrink: 0;
    }

    /* ── BOTÃO ── */
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 11px;
      width: 100%;
      padding: 16px 28px;
      background: linear-gradient(135deg, #6b3de8, #5a2fd8);
      border: 1px solid rgba(180,124,255,0.35);
      border-radius: 14px;
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-decoration: none;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: fadeUp 0.5s 0.7s both;
    }

    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent 60%);
      pointer-events: none;
    }

    /* moving shine */
    .btn::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      animation: btnShine 2.8s ease-in-out infinite 1.5s;
    }

    @keyframes btnShine {
      0%   { left: -80%; }
      100% { left: 140%; }
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 36px rgba(107,61,232,0.55);
    }
    .btn:active { transform: translateY(0); }

    .btn-discord-icon { width: 22px; height: 22px; flex-shrink: 0; }

    /* ── FOOTER ── */
    .footer {
      margin-top: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11px;
      color: rgba(122,111,160,0.5);
      animation: fadeUp 0.5s 0.8s both;
    }

    .footer svg { width: 12px; height: 12px; opacity: 0.5; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── FLOATING ORBS ── */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 { width: 350px; height: 350px; background: rgba(124,77,255,0.18); top: -120px; left: -80px; animation: orbFloat 12s ease-in-out infinite; }
    .orb-2 { width: 250px; height: 250px; background: rgba(0,229,255,0.1); bottom: -60px; right: -60px; animation: orbFloat 9s ease-in-out infinite reverse; }

    @keyframes orbFloat {
      0%,100% { transform: translate(0,0); }
      50%      { transform: translate(30px,-30px); }
    }

    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; }
    }
  </style>
</head>
<body>

<div class="bg-glow"></div>
<div class="bg-grid"></div>
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<canvas id="canvas"></canvas>

<div class="card">

  <!-- Shield SVG animado -->
  <div class="shield-wrap">
    <div class="shield-bg"></div>
    <div class="scan-line"></div>
    <svg class="shield-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- shield outline -->
      <path d="M26 4L6 12V26C6 36.5 15 44.8 26 48C37 44.8 46 36.5 46 26V12L26 4Z"
        stroke="url(#sg)" stroke-width="1.8" stroke-linejoin="round" fill="rgba(124,77,255,0.08)"/>
      <!-- check mark -->
      <path d="M17 26.5L23 32.5L35 20"
        stroke="url(#cg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <animate attributeName="stroke-dasharray" from="0 30" to="30 0" dur="0.6s" begin="0.8s" fill="freeze"/>
        <animate attributeName="stroke-dashoffset" from="0" to="0" dur="0.6s" fill="freeze"/>
      </path>
      <defs>
        <linearGradient id="sg" x1="6" y1="4" x2="46" y2="48" gradientUnits="userSpaceOnUse">
          <stop stop-color="#b47cff"/>
          <stop offset="1" stop-color="#00e5ff"/>
        </linearGradient>
        <linearGradient id="cg" x1="17" y1="26" x2="35" y2="26" gradientUnits="userSpaceOnUse">
          <stop stop-color="#b47cff"/>
          <stop offset="1" stop-color="#00e5ff"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <div class="brand">Lino Security</div>
  <h1>Verificação <span class="accent">Discord</span></h1>
  <p class="desc">Para acessar o servidor, confirme sua identidade. Processo rápido e seguro.</p>

  <!-- Steps -->
  <div class="steps">
    <div class="step">
      <div class="step-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#si1)" stroke-width="1.8" stroke-linecap="round">
          <path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-6-6z"/>
          <polyline points="15 3 15 9 21 9"/>
          <defs>
            <linearGradient id="si1" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stop-color="#b47cff"/><stop offset="1" stop-color="#00e5ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="step-label">Clique em verificar</span>
    </div>
    <div class="step-connector"></div>
    <div class="step">
      <div class="step-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#si2)" stroke-width="1.8" stroke-linecap="round">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          <defs>
            <linearGradient id="si2" x1="0" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
              <stop stop-color="#b47cff"/><stop offset="1" stop-color="#00e5ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="step-label">Autorize no Discord</span>
    </div>
    <div class="step-connector"></div>
    <div class="step">
      <div class="step-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#si3)" stroke-width="1.8" stroke-linecap="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
          <defs>
            <linearGradient id="si3" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#b47cff"/><stop offset="1" stop-color="#00e5ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="step-label">Acesso liberado</span>
    </div>
  </div>

  <!-- Botão -->
  <a class="btn" href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify%20guilds.join">
    <svg class="btn-discord-icon" viewBox="0 0 24 24" fill="white">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
    Verificar com Discord
  </a>

  <!-- Footer -->
  <div class="footer">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    Seus dados estão protegidos · Lino Security
  </div>

</div>

<!-- Partículas -->
<script>
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.size = Math.random() * 1.4 + 0.4;
      this.speed = Math.random() * 0.4 + 0.15;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '124,77,255' : '0,229,255';
      this.drift = (Math.random() - 0.5) * 0.3;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.opacity -= 0.0008;
      if (this.y < -10 || this.opacity <= 0) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = \`rgba(${this.color},${this.opacity})\`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
</script>

</body>
</html>
`);
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

    try {
      await axios.put(
        `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}/roles/1498558547116429352`,
        {},
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
      );
    } catch(e) {}

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
