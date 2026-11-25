// Satu Api, 12 Pesanan — WebAudio synth sounds only, no audio files.
// Sizzle is a looped noise bed whose level follows the flames; every other
// sound is a short oscillator or noise burst built on first use.

export function createAudio() {
  const api = {
    ctx: null,
    master: null,
    sizzleGain: null,
    muted: false,
    ensure() {
      if (api.ctx) {
        if (api.ctx.state === 'suspended') api.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      api.ctx = new AC();
      api.master = api.ctx.createGain();
      api.master.gain.value = api.muted ? 0 : 0.5;
      api.master.connect(api.ctx.destination);
      // Sizzle bed: white noise through a bandpass, gain driven per frame.
      const len = api.ctx.sampleRate;
      const buf = api.ctx.createBuffer(1, len, api.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = api.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const bp = api.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 5200;
      bp.Q.value = 0.6;
      api.sizzleGain = api.ctx.createGain();
      api.sizzleGain.gain.value = 0;
      src.connect(bp);
      bp.connect(api.sizzleGain);
      api.sizzleGain.connect(api.master);
      src.start();
    },
    setSizzle(level) {
      if (!api.ctx || !api.sizzleGain) return;
      const target = api.muted ? 0 : Math.max(0, Math.min(0.12, level));
      api.sizzleGain.gain.setTargetAtTime(target, api.ctx.currentTime, 0.1);
    },
    tone(freq, dur, type, vol, when = 0) {
      if (!api.ctx) return;
      const t0 = api.ctx.currentTime + when;
      const osc = api.ctx.createOscillator();
      const g = api.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(g);
      g.connect(api.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },
    click() { api.tone(1400, 0.06, 'square', 0.08); },
    add() { api.tone(660, 0.09, 'sine', 0.14); api.tone(990, 0.12, 'sine', 0.1, 0.05); },
    bad() { api.tone(180, 0.16, 'sawtooth', 0.1); },
    done() { api.tone(880, 0.18, 'sine', 0.16); api.tone(1174, 0.22, 'sine', 0.12, 0.09); },
    serve() {
      api.tone(784, 0.14, 'sine', 0.18);
      api.tone(1046, 0.16, 'sine', 0.16, 0.08);
      api.tone(1318, 0.3, 'sine', 0.16, 0.16);
    },
    burn() { api.tone(110, 0.45, 'sawtooth', 0.16); api.tone(82, 0.5, 'square', 0.08, 0.05); },
    walkout() { api.tone(392, 0.2, 'triangle', 0.14); api.tone(311, 0.3, 'triangle', 0.14, 0.14); },
    rush() {
      api.tone(523, 0.12, 'square', 0.1);
      api.tone(659, 0.12, 'square', 0.1, 0.1);
      api.tone(784, 0.2, 'square', 0.12, 0.2);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => api.tone(f, 0.32, 'sine', 0.18, i * 0.13));
    },
    lose() {
      [392, 330, 262].forEach((f, i) => api.tone(f, 0.3, 'triangle', 0.14, i * 0.16));
    },
    setMuted(m) {
      api.muted = m;
      if (api.master && api.ctx) {
        api.master.gain.setTargetAtTime(m ? 0 : 0.5, api.ctx.currentTime, 0.05);
      }
    },
  };
  return api;
}

// Drain world event names into sounds. Called once per frame from main.js.
export function playEvents(audio, world) {
  for (const ev of world.events) {
    switch (ev.type) {
      case 'click': audio.click(); break;
      case 'add': audio.add(); break;
      case 'bad': audio.bad(); break;
      case 'done': audio.done(); break;
      case 'serve': audio.serve(); break;
      case 'burn': audio.burn(); break;
      case 'walkout': audio.walkout(); break;
      case 'rush': audio.rush(); break;
      case 'win': audio.win(); break;
      case 'lose': audio.lose(); break;
      case 'plate': audio.done(); break;
      default: break;
    }
  }
  world.events.length = 0;
}
