import type { CharacterTemplate } from '../../types/game';

/**
 * Spec §13: 2.5-head Q-version Skeletal Rig Renderer (Canvas2D, 60 FPS)
 * Hierarchy: hip -> torso -> head (+ ears/wings/cape) -> L/R upperArm -> forearm -> weapon;
 * hip -> L/R thigh -> calf -> foot.
 * Supports 11 animation states with anticipation, follow-through, and breathing!
 */
export type RigAnimState =
  | 'idle'
  | 'run'
  | 'attack'
  | 'skill1'
  | 'skill2'
  | 'cast'
  | 'ultimate'
  | 'hit'
  | 'dodge'
  | 'victory'
  | 'defeated';

export interface RigRenderParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  time: number;
  state: RigAnimState;
  stateProgress: number; // 0..1 within current action
  character: CharacterTemplate;
  evolutionStage?: number;
  whiteFlash?: boolean;
  panicked?: boolean;
}

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

export function drawSkeletalHero(params: RigRenderParams): void {
  const {
    ctx,
    x,
    y,
    scale = 1,
    facing = 1,
    time,
    state,
    stateProgress,
    character,
    evolutionStage = 0,
    whiteFlash = false,
    panicked = false,
  } = params;

  // Pose joint angles (radians) and offsets driven by state machine
  const breathe = Math.sin(time * 3.4);
  let hipY = breathe * 2.2;
  let hipX = 0;
  let torsoLean = 0.04;
  let headTilt = breathe * 0.04;
  let rArmRot = -0.35 + breathe * 0.08;
  let rForearmRot = -0.25;
  let lArmRot = 0.35 - breathe * 0.08;
  let lLegRot = 0;
  let rLegRot = 0;
  let capeLag = Math.sin(time * 3.4 - 0.8) * 0.14;
  let scaleX = 1;
  let scaleY = 1;

  if (state === 'run') {
    const stride = Math.sin(time * 13);
    hipY = Math.abs(stride) * -5;
    torsoLean = 0.2;
    lLegRot = stride * 0.65;
    rLegRot = -stride * 0.65;
    rArmRot = -stride * 0.55;
    lArmRot = stride * 0.55;
    capeLag = -0.4 + Math.sin(time * 13 - 0.9) * 0.2;
  } else if (state === 'attack' || state === 'skill1' || state === 'skill2') {
    // Anticipation (0..0.32) -> Active Strike (0.32..0.62) -> Follow-through (0.62..1)
    if (stateProgress < 0.32) {
      const p = easeInOut(stateProgress / 0.32);
      hipX = -10 * p;
      torsoLean = -0.22 * p;
      rArmRot = -1.65 * p;
      rForearmRot = -0.6 * p;
      scaleX = 1 - 0.08 * p;
      scaleY = 1 + 0.08 * p;
    } else if (stateProgress < 0.65) {
      const p = easeInOut((stateProgress - 0.32) / 0.33);
      hipX = -10 + 36 * p;
      torsoLean = -0.22 + 0.56 * p;
      rArmRot = -1.65 + 2.65 * p;
      rForearmRot = -0.6 + 0.9 * p;
      scaleX = 1.12;
      scaleY = 0.92;
    } else {
      const p = easeInOut((stateProgress - 0.65) / 0.35);
      hipX = 26 * (1 - p);
      torsoLean = 0.34 * (1 - p);
      rArmRot = 1.0 * (1 - p) - 0.35 * p;
      rForearmRot = 0.3 * (1 - p) - 0.25 * p;
    }
    capeLag = -0.35;
  } else if (state === 'cast' || state === 'ultimate') {
    const lift = Math.sin(stateProgress * Math.PI);
    hipY = -12 * lift;
    torsoLean = -0.15 * lift;
    rArmRot = -1.9 * lift;
    lArmRot = -1.5 * lift;
    capeLag = Math.sin(time * 16) * 0.3;
  } else if (state === 'hit') {
    const k = Math.sin(stateProgress * Math.PI);
    hipX = -16 * k;
    torsoLean = -0.38 * k;
    headTilt = -0.28 * k;
    rArmRot = 0.8 * k;
    lArmRot = -0.7 * k;
    scaleX = 0.88;
    scaleY = 1.12;
  } else if (state === 'dodge') {
    const k = Math.sin(stateProgress * Math.PI);
    hipX = -22 * k;
    hipY = -14 * k;
    torsoLean = -0.25 * k;
  } else if (state === 'victory') {
    const jump = Math.abs(Math.sin(time * 6.5));
    hipY = -14 * jump;
    rArmRot = -2.1 + Math.sin(time * 10) * 0.2;
    lArmRot = -1.8 - Math.sin(time * 10) * 0.2;
  } else if (state === 'defeated') {
    hipY = 26;
    torsoLean = -1.35;
    rArmRot = 0.9;
    lArmRot = 1.1;
  }

  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 40 * scale, 26 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Evolution golden halo for stage >= 2
  if (evolutionStage >= 1 && state !== 'defeated') {
    ctx.save();
    ctx.strokeStyle = character.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.35 + Math.sin(time * 4) * 0.15;
    ctx.beginPath();
    ctx.ellipse(0, 38 * scale, (30 + evolutionStage * 5) * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.scale(facing * scale * scaleX, scale * scaleY);
  ctx.translate(hipX, hipY);

  const primary = whiteFlash ? '#ffffff' : character.primaryColor;
  const secondary = whiteFlash ? '#ffffff' : character.secondaryColor;
  const accent = whiteFlash ? '#ffffff' : character.accentColor;
  const skin = whiteFlash ? '#ffffff' : '#fde6c8';

  // Cape / Tail behind torso (delayed lag sway)
  ctx.save();
  ctx.translate(-8, -4);
  ctx.rotate(capeLag);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(-24, 6, -18, 28);
  ctx.lineTo(-2, 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Wings appendage if applicable
  if (character.earsOrAppendage === 'wings') {
    const flap = Math.sin(time * 9) * 0.25;
    ctx.save();
    ctx.translate(-10, -12);
    ctx.rotate(-0.4 + flap);
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.ellipse(-14, -4, 16, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Back Leg (Left)
  ctx.save();
  ctx.translate(-6, 14);
  ctx.rotate(lLegRot);
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, -5, 0, 10, 18, 4);
  ctx.fillStyle = secondary;
  roundRect(ctx, -6, 15, 13, 8, 4);
  ctx.restore();

  // Front Leg (Right)
  ctx.save();
  ctx.translate(7, 14);
  ctx.rotate(rLegRot);
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, -5, 0, 10, 18, 4);
  ctx.fillStyle = secondary;
  roundRect(ctx, -6, 15, 14, 8, 4);
  ctx.restore();

  // Back Arm (Left)
  ctx.save();
  ctx.translate(-11, -10);
  ctx.rotate(lArmRot);
  ctx.fillStyle = primary;
  roundRect(ctx, -4, 0, 9, 18, 4);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, 19, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Torso
  ctx.save();
  ctx.rotate(torsoLean);
  ctx.fillStyle = primary;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  roundRect(ctx, -14, -18, 28, 34, 9);
  ctx.stroke();
  // Chest emblem / sash
  ctx.fillStyle = secondary;
  ctx.fillRect(-10, -6, 20, 6);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, -3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Head (2.5-head Q proportion: big expressive head!)
  ctx.save();
  ctx.translate(0, -36);
  ctx.rotate(headTilt);

  // Appendages on head (fox/cat/bunny/horns/mech/owl)
  drawHeadAppendage(ctx, character.earsOrAppendage ?? 'none', primary, secondary, accent);

  // Head shape
  ctx.fillStyle = character.earsOrAppendage === 'mech' ? primary : skin;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair / Helmet crown
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.arc(0, -5, 21, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = secondary;
  ctx.fillRect(-16, -9, 32, 5);

  // Expressive Eyes
  if (character.earsOrAppendage === 'mech') {
    ctx.fillStyle = whiteFlash ? '#ffffff' : '#22d3ee';
    roundRect(ctx, -10, -3, 22, 8, 3);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-5, 2, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.ellipse(9, 2, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, 0.5, 1.3, 0, Math.PI * 2);
    ctx.arc(10, 0.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Cheek blush
    ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-10, 7, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(13, 7, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Panicked sweat drop (Spec §4 防亂猜 慌張)
  if (panicked) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(18, -14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // end head

  // Front Arm + Forearm + Weapon (Right)
  ctx.save();
  ctx.translate(12, -10);
  ctx.rotate(rArmRot);
  ctx.fillStyle = primary;
  roundRect(ctx, -4, -2, 9, 16, 4);
  ctx.translate(0, 14);
  ctx.rotate(rForearmRot);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, 4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  drawWeapon(ctx, character.weaponKind, secondary, accent, evolutionStage);
  ctx.restore();

  ctx.restore(); // end torso
  ctx.restore(); // end root
}

function drawHeadAppendage(
  ctx: CanvasRenderingContext2D,
  kind: NonNullable<CharacterTemplate['earsOrAppendage']>,
  primary: string,
  secondary: string,
  accent: string
) {
  ctx.fillStyle = primary;
  if (kind === 'cat' || kind === 'fox') {
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.lineTo(-20, -32);
    ctx.lineTo(-4, -18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -12);
    ctx.lineTo(20, -32);
    ctx.lineTo(4, -18);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'bunny') {
    roundRect(ctx, -13, -40, 8, 24, 4);
    roundRect(ctx, 5, -40, 8, 24, 4);
  } else if (kind === 'panda' || kind === 'beaver') {
    ctx.beginPath();
    ctx.arc(-15, -18, 7, 0, Math.PI * 2);
    ctx.arc(15, -18, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'horns') {
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-14, -14);
    ctx.lineTo(-24, -32);
    ctx.lineTo(-6, -20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -14);
    ctx.lineTo(24, -32);
    ctx.lineTo(6, -20);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'mech') {
    ctx.fillStyle = accent;
    ctx.fillRect(-2, -32, 4, 14);
    ctx.beginPath();
    ctx.arc(0, -34, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'owl') {
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-17, -14);
    ctx.lineTo(-22, -26);
    ctx.lineTo(-8, -19);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, -14);
    ctx.lineTo(22, -26);
    ctx.lineTo(8, -19);
    ctx.fill();
  }
}

function drawWeapon(
  ctx: CanvasRenderingContext2D,
  kind: CharacterTemplate['weaponKind'],
  secondary: string,
  accent: string,
  evo: number
) {
  ctx.save();
  ctx.translate(4, 4);
  if (kind === 'sword' || kind === 'knife') {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-2, -34, 6, 32);
    ctx.fillStyle = accent;
    ctx.fillRect(-7, -4, 16, 5);
    if (evo >= 1) {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.strokeRect(-2, -34, 6, 32);
    }
  } else if (kind === 'brush' || kind === 'staff' || kind === 'wand') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -34, 5, 42);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0.5, -36, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'blaster' || kind === 'sniper' || kind === 'drone') {
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, -2, -6, 28, 11, 3);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(18, -3, 10, 5);
  } else if (kind === 'hammer') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -28, 5, 32);
    ctx.fillStyle = secondary;
    roundRect(ctx, -12, -38, 25, 14, 3);
  } else if (kind === 'wok') {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(10, -4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (kind === 'shield') {
    ctx.fillStyle = secondary;
    roundRect(ctx, -4, -18, 16, 28, 6);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(-1, -14, 10, 20);
  } else if (kind === 'bow') {
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -6, 18, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawEnemyMonster(params: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  time: number;
  subject: 'chinese' | 'english' | 'math' | 'science';
  isBoss: boolean;
  hpRatio: number;
  whiteFlash: boolean;
  shieldActive?: boolean;
  label: string;
}): void {
  const { ctx, x, y, time, subject, isBoss, hpRatio, whiteFlash, shieldActive, label } = params;
  const s = isBoss ? 1.38 : 1.0;
  const hover = Math.sin(time * 3.8) * 6;

  ctx.save();
  ctx.translate(x, y + hover);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 42 * s - hover, 34 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyColor = whiteFlash
    ? '#ffffff'
    : subject === 'chinese'
    ? '#1f2937'
    : subject === 'english'
    ? '#4c1d95'
    : subject === 'math'
    ? '#334155'
    : '#7f1d1d';
  const glowColor =
    subject === 'chinese'
      ? '#dc2626'
      : subject === 'english'
      ? '#ec4899'
      : subject === 'math'
      ? '#f97316'
      : '#fb923c';

  // Menacing aura for Boss
  if (isBoss) {
    ctx.save();
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.45 + Math.sin(time * 6) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, 44 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Distinct silhouette per world
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 3;
  if (subject === 'english') {
    // Hexagonal Virus Drone
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + time * 0.4;
      const px = Math.cos(a) * 32 * s;
      const py = Math.sin(a) * 32 * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (subject === 'math') {
    // Zero Legion Geometric Golem
    roundRect(ctx, -28 * s, -30 * s, 56 * s, 58 * s, 10 * s);
    ctx.stroke();
    ctx.fillStyle = glowColor;
    ctx.font = `900 ${Math.round(28 * s)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('0', 0, 10 * s);
  } else {
    // Organic Ink Demon / Dark Gluttony
    ctx.beginPath();
    ctx.arc(0, 0, 32 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Horns
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.moveTo(-20 * s, -22 * s);
    ctx.lineTo(-30 * s, -44 * s);
    ctx.lineTo(-8 * s, -28 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20 * s, -22 * s);
    ctx.lineTo(30 * s, -44 * s);
    ctx.lineTo(8 * s, -28 * s);
    ctx.fill();
  }

  // Eyes
  if (subject !== 'math') {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-10 * s, -5 * s, 5 * s, 4 * s, -0.2, 0, Math.PI * 2);
    ctx.ellipse(10 * s, -5 * s, 5 * s, 4 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shield barrier if active (Boss shield break mechanic)
  if (shieldActive) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 48 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Overhead HP bar & name
  const barW = 92 * s;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  roundRect(ctx, -barW / 2, -56 * s, barW, 10, 5);
  ctx.fillStyle = hpRatio > 0.35 ? '#ef4444' : '#f97316';
  roundRect(ctx, -barW / 2 + 1, -55 * s, Math.max(0, (barW - 2) * hpRatio), 8, 4);

  ctx.font = '700 13px "Noto Sans TC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(label, 0, -64 * s);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
