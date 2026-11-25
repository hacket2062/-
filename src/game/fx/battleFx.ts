/**
 * Zero-GC Pooled Particle Ring Buffer, 4-Stage VFX System, Hitstop, Camera Trauma Shake,
 * Floating Damage Numbers, and Procedural Web Audio Synth SFX (Spec §8 & §13).
 */

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  shape: 'circle' | 'spark' | 'ring' | 'petal' | 'square';
  rotation: number;
  vRot: number;
}

export interface FloatingNumber {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  text: string;
  subText?: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
}

export interface BeamEffect {
  active: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  life: number;
  maxLife: number;
  style: 'slash' | 'laser' | 'arc' | 'flame';
}

export class BattleFxEngine {
  readonly particles: Particle[];
  readonly floatingNumbers: FloatingNumber[];
  readonly beams: BeamEffect[];
  private particleHead = 0;
  private numHead = 0;
  private beamHead = 0;

  hitstopTimer = 0;
  trauma = 0;
  omenTimer = 0;
  omenX = 0;
  omenY = 0;
  omenColor = '#facc15';
  enemyFlashTimer = 0;
  heroFlashTimer = 0;

  constructor(maxParticles = 180) {
    this.particles = Array.from({ length: maxParticles }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 4,
      color: '#facc15',
      alpha: 1,
      life: 0,
      maxLife: 0.6,
      gravity: 0,
      shape: 'circle',
      rotation: 0,
      vRot: 0,
    }));
    this.floatingNumbers = Array.from({ length: 24 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: -60,
      text: '',
      color: '#ffffff',
      scale: 1,
      life: 0,
      maxLife: 0.9,
    }));
    this.beams = Array.from({ length: 12 }, () => ({
      active: false,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      color: '#38bdf8',
      width: 6,
      life: 0,
      maxLife: 0.35,
      style: 'laser',
    }));
  }

  /** Stage 1: Omen (0.25s charge particles gathering) */
  triggerOmen(x: number, y: number, color: string) {
    this.omenTimer = 0.28;
    this.omenX = x;
    this.omenY = y;
    this.omenColor = color;
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14;
      const dist = 58 + Math.random() * 24;
      this.spawnParticle({
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        vx: -Math.cos(ang) * 170,
        vy: -Math.sin(ang) * 170,
        size: 3.5 + Math.random() * 2.5,
        color,
        maxLife: 0.3,
        gravity: 0,
        shape: 'spark',
      });
    }
  }

  /** Stage 2 & 3: Burst beam + Hitstop (60-90ms) + Screen Shake + White Flash + Particle Explosion */
  triggerImpact(params: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
    style: BeamEffect['style'];
    shape: Particle['shape'];
    heavy: boolean;
    damageText: string;
    subText?: string;
    numColor: string;
    targetIsEnemy: boolean;
  }) {
    this.spawnBeam(params.fromX, params.fromY, params.toX, params.toY, params.color, params.heavy ? 12 : 6, params.style);
    this.hitstopTimer = params.heavy ? 0.085 : 0.045;
    this.trauma = Math.min(1, this.trauma + (params.heavy ? 0.72 : 0.36));
    if (params.targetIsEnemy) {
      this.enemyFlashTimer = 0.09;
    } else {
      this.heroFlashTimer = 0.1;
    }

    const count = params.heavy ? 28 : 16;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (params.heavy ? 120 : 80) + Math.random() * 190;
      this.spawnParticle({
        x: params.toX,
        y: params.toY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 45,
        size: (params.heavy ? 5 : 3.5) + Math.random() * 4,
        color: i % 3 === 0 ? '#ffffff' : params.color,
        maxLife: 0.45 + Math.random() * 0.45,
        gravity: 220,
        shape: params.shape,
      });
    }

    // Impact ring
    this.spawnParticle({
      x: params.toX,
      y: params.toY,
      vx: 0,
      vy: 0,
      size: params.heavy ? 54 : 34,
      color: params.color,
      maxLife: 0.32,
      gravity: 0,
      shape: 'ring',
    });

    this.spawnFloatingNumber({
      x: params.toX + (Math.random() - 0.5) * 26,
      y: params.toY - 36,
      text: params.damageText,
      subText: params.subText,
      color: params.numColor,
      scale: params.heavy ? 1.35 : 1.0,
    });
  }

  spawnParticle(cfg: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    maxLife: number;
    gravity: number;
    shape: Particle['shape'];
  }) {
    const p = this.particles[this.particleHead];
    this.particleHead = (this.particleHead + 1) % this.particles.length;
    p.active = true;
    p.x = cfg.x;
    p.y = cfg.y;
    p.vx = cfg.vx;
    p.vy = cfg.vy;
    p.size = cfg.size;
    p.color = cfg.color;
    p.alpha = 1;
    p.life = cfg.maxLife;
    p.maxLife = cfg.maxLife;
    p.gravity = cfg.gravity;
    p.shape = cfg.shape;
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 8;
  }

  spawnBeam(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
    style: BeamEffect['style']
  ) {
    const b = this.beams[this.beamHead];
    this.beamHead = (this.beamHead + 1) % this.beams.length;
    b.active = true;
    b.x1 = x1;
    b.y1 = y1;
    b.x2 = x2;
    b.y2 = y2;
    b.color = color;
    b.width = width;
    b.life = 0.34;
    b.maxLife = 0.34;
    b.style = style;
  }

  spawnFloatingNumber(cfg: {
    x: number;
    y: number;
    text: string;
    subText?: string;
    color: string;
    scale: number;
  }) {
    const fn = this.floatingNumbers[this.numHead];
    this.numHead = (this.numHead + 1) % this.floatingNumbers.length;
    fn.active = true;
    fn.x = cfg.x;
    fn.y = cfg.y;
    fn.vy = -78;
    fn.text = cfg.text;
    fn.subText = cfg.subText;
    fn.color = cfg.color;
    fn.scale = cfg.scale;
    fn.life = 0.95;
    fn.maxLife = 0.95;
  }

  update(rawDt: number): { simDt: number; shakeX: number; shakeY: number } {
    const dt = Math.min(rawDt, 0.05);
    this.trauma = Math.max(0, this.trauma - dt * 2.1);
    this.enemyFlashTimer = Math.max(0, this.enemyFlashTimer - dt);
    this.heroFlashTimer = Math.max(0, this.heroFlashTimer - dt);
    this.omenTimer = Math.max(0, this.omenTimer - dt);

    const shakeMag = this.trauma * this.trauma * 13;
    const shakeX = shakeMag > 0.1 ? (Math.random() * 2 - 1) * shakeMag : 0;
    const shakeY = shakeMag > 0.1 ? (Math.random() * 2 - 1) * shakeMag : 0;

    let simDt = dt;
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      simDt = 0;
    }

    // Particles & floating numbers continue smoothly in real dt
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    for (let i = 0; i < this.beams.length; i++) {
      const b = this.beams[i];
      if (!b.active) continue;
      b.life -= dt;
      if (b.life <= 0) b.active = false;
    }

    for (let i = 0; i < this.floatingNumbers.length; i++) {
      const fn = this.floatingNumbers[i];
      if (!fn.active) continue;
      fn.life -= dt;
      if (fn.life <= 0) {
        fn.active = false;
        continue;
      }
      fn.y += fn.vy * dt;
      fn.vy *= 0.94;
    }

    return { simDt, shakeX, shakeY };
  }

  render(ctx: CanvasRenderingContext2D) {
    // Omen magic circle
    if (this.omenTimer > 0) {
      const t = 1 - this.omenTimer / 0.28;
      ctx.save();
      ctx.translate(this.omenX, this.omenY + 26);
      ctx.scale(1, 0.36);
      ctx.strokeStyle = this.omenColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.85 * (1 - t * 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, 26 + t * 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Beams / Slashes
    for (let i = 0; i < this.beams.length; i++) {
      const b = this.beams[i];
      if (!b.active) continue;
      const ratio = b.life / b.maxLife;
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.lineCap = 'round';
      if (b.style === 'slash') {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width * ratio;
        ctx.beginPath();
        ctx.arc(b.x2, b.y2, 46, -Math.PI * 0.75, Math.PI * 0.25);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = b.width * 0.45 * ratio;
        ctx.stroke();
      } else {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width * (0.6 + ratio * 0.6);
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = b.width * 0.35 * ratio;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Pooled Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.shape === 'ring') {
        const progress = 1 - p.life / p.maxLife;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * p.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (0.35 + progress * 0.9), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 1.4, -p.size * 0.35, p.size * 2.8, p.size * 0.7);
      } else if (p.shape === 'petal') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.6, -p.size * 0.6, p.size * 1.2, p.size * 1.2);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Floating Damage / Heal Numbers (Spec §8: PERFECT gold, Crit red enlarged, Heal green)
    for (let i = 0; i < this.floatingNumbers.length; i++) {
      const fn = this.floatingNumbers[i];
      if (!fn.active) continue;
      const ratio = fn.life / fn.maxLife;
      const pop = ratio > 0.8 ? 1 + (1 - ratio) * 1.6 : 1;
      ctx.save();
      ctx.globalAlpha = Math.min(1, ratio * 1.4);
      ctx.translate(fn.x, fn.y);
      ctx.scale(fn.scale * pop, fn.scale * pop);
      ctx.font = '800 22px "Outfit", "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(10, 15, 30, 0.92)';
      ctx.strokeText(fn.text, 0, 0);
      ctx.fillStyle = fn.color;
      ctx.fillText(fn.text, 0, 0);
      if (fn.subText) {
        ctx.font = '700 12px "Outfit", "Noto Sans TC", sans-serif';
        ctx.lineWidth = 3;
        ctx.strokeText(fn.subText, 0, -22);
        ctx.fillStyle = '#fef08a';
        ctx.fillText(fn.subText, 0, -22);
      }
      ctx.restore();
    }
  }
}

/** Procedural Web Audio SFX (zero external audio files, pitch-varied, respects soundEnabled) */
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSfx(
  kind: 'correct' | 'perfect' | 'wrong' | 'ultimate' | 'victory' | 'click' | 'heal',
  enabled: boolean
): void {
  if (!enabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const playTone = (freq: number, startOffset: number, dur: number, type: OscillatorType, gainVal = 0.12) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(gainVal, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + dur);
    };

    const jitter = 0.95 + Math.random() * 0.1;
    if (kind === 'click') {
      playTone(520 * jitter, 0, 0.06, 'triangle', 0.08);
    } else if (kind === 'correct') {
      playTone(523.25 * jitter, 0, 0.12, 'triangle', 0.12);
      playTone(659.25 * jitter, 0.08, 0.18, 'triangle', 0.12);
    } else if (kind === 'perfect') {
      playTone(587.33, 0, 0.1, 'triangle', 0.13);
      playTone(880, 0.07, 0.14, 'triangle', 0.14);
      playTone(1174.66, 0.14, 0.24, 'sine', 0.14);
    } else if (kind === 'wrong') {
      playTone(220, 0, 0.16, 'sawtooth', 0.09);
      playTone(165, 0.12, 0.22, 'sawtooth', 0.09);
    } else if (kind === 'heal') {
      playTone(440, 0, 0.12, 'sine', 0.1);
      playTone(554.37, 0.09, 0.14, 'sine', 0.1);
      playTone(659.25, 0.18, 0.22, 'sine', 0.12);
    } else if (kind === 'ultimate') {
      playTone(330, 0, 0.12, 'sawtooth', 0.12);
      playTone(493.88, 0.08, 0.15, 'triangle', 0.14);
      playTone(659.25, 0.16, 0.18, 'triangle', 0.15);
      playTone(987.77, 0.25, 0.38, 'sine', 0.16);
    } else if (kind === 'victory') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, i * 0.1, 0.28, 'triangle', 0.13));
    }
  } catch {
    // ignore Web Audio issues
  }
}
