import React, { useEffect, useRef } from 'react';
import type { CharacterTemplate, SubjectId } from '../../types/game';
import { GAME_ART } from '../../assets/worldAssets';
import { BattleFxEngine } from '../fx/battleFx';
import { drawEnemyMonster, drawSkeletalHero, type RigAnimState } from '../rig/skeletalRig';

export interface BattleVisualEvent {
  seq: number;
  kind: 'hero_attack' | 'hero_ultimate' | 'enemy_attack' | 'heal' | 'shield_block';
  damageText: string;
  subText?: string;
  heavy?: boolean;
  color?: string;
}

interface Props {
  subject: SubjectId;
  party: CharacterTemplate[];
  activePartyIndex: number;
  enemyName: string;
  enemyHpRatio: number;
  isBoss: boolean;
  enemyShieldActive: boolean;
  heroHpRatio: number;
  panicked: boolean;
  luminaBurst: boolean;
  /** World-specific live state */
  mathPhase?: 'day' | 'night';
  mathTowerLevel?: number;
  cuisineHeat?: number;
  galaxyTargets?: string[];
  visualEvent: BattleVisualEvent | null;
  paused: boolean;
  onGalaxyShootOption?: (index: number) => void;
}

/**
 * 60 FPS Canvas2D Battle Stage Renderer with 4 completely distinct world visualizations & mechanics:
 * - chinese (墨靈幻境): 3-hero RPG formation, floating calligraphy ink petals, gold slashes
 * - english (星際機甲戰線): Horizontal starfield shooter, W/S/Up/Down dodge & target drones
 * - math (數境建築王國): Day/Night sky cycle, blueprint grid, castle tower defense lane & turrets
 * - science (元素料理大亂鬥): Elemental kitchen hearth, sizzling wok cauldron & flying ingredients
 */
export const BattleCanvas: React.FC<Props> = ({
  subject,
  party,
  activePartyIndex,
  enemyName,
  enemyHpRatio,
  isBoss,
  enemyShieldActive,
  heroHpRatio,
  panicked,
  luminaBurst,
  mathPhase = 'night',
  mathTowerLevel = 1,
  cuisineHeat = 40,
  galaxyTargets = [],
  visualEvent,
  paused,
  onGalaxyShootOption,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<BattleFxEngine>(new BattleFxEngine(180));
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const propsRef = useRef({
    subject,
    party,
    activePartyIndex,
    enemyName,
    enemyHpRatio,
    isBoss,
    enemyShieldActive,
    heroHpRatio,
    panicked,
    luminaBurst,
    mathPhase,
    mathTowerLevel,
    cuisineHeat,
    galaxyTargets,
    paused,
    onGalaxyShootOption,
  });

  propsRef.current = {
    subject,
    party,
    activePartyIndex,
    enemyName,
    enemyHpRatio,
    isBoss,
    enemyShieldActive,
    heroHpRatio,
    panicked,
    luminaBurst,
    mathPhase,
    mathTowerLevel,
    cuisineHeat,
    galaxyTargets,
    paused,
    onGalaxyShootOption,
  };

  // Animation state for rigs (decoupled from React 60Hz)
  const animRef = useRef<{
    time: number;
    heroState: RigAnimState;
    heroTimer: number;
    heroDur: number;
    mechY: number;
    enemyMarchX: number;
    keys: Set<string>;
    stars: Array<{ x: number; y: number; speed: number; size: number }>;
    lastSeq: number;
  }>({
    time: 0,
    heroState: 'idle',
    heroTimer: 0,
    heroDur: 0.6,
    mechY: 160,
    enemyMarchX: 0,
    keys: new Set(),
    stars: Array.from({ length: 48 }, (_, i) => ({
      x: (i * 97) % 900,
      y: (i * 53) % 300,
      speed: 45 + (i % 5) * 35,
      size: 1.5 + (i % 3),
    })),
    lastSeq: -1,
  });

  // Load world backdrop image once per subject
  useEffect(() => {
    const img = new Image();
    img.src = GAME_ART.worlds[subject];
    img.onload = () => {
      bgImgRef.current = img;
    };
  }, [subject]);

  // Trigger visual FX when a new battle event arrives
  useEffect(() => {
    if (!visualEvent || visualEvent.seq === animRef.current.lastSeq) return;
    animRef.current.lastSeq = visualEvent.seq;
    const fx = fxRef.current;
    const canvas = canvasRef.current;
    const w = canvas ? canvas.clientWidth || 880 : 880;
    const h = canvas ? canvas.clientHeight || 300 : 300;
    const heroX = w * 0.25;
    const heroY = subject === 'english' ? animRef.current.mechY : h * 0.64;
    const enemyX = w * 0.76;
    const enemyY = h * 0.54;

    const worldStyle =
      subject === 'chinese'
        ? { style: 'slash' as const, shape: 'petal' as const, defaultColor: '#facc15' }
        : subject === 'english'
        ? { style: 'laser' as const, shape: 'spark' as const, defaultColor: '#22d3ee' }
        : subject === 'math'
        ? { style: 'laser' as const, shape: 'square' as const, defaultColor: '#f97316' }
        : { style: 'flame' as const, shape: 'circle' as const, defaultColor: '#fb923c' };

    if (visualEvent.kind === 'hero_attack' || visualEvent.kind === 'hero_ultimate') {
      animRef.current.heroState = visualEvent.kind === 'hero_ultimate' ? 'ultimate' : 'attack';
      animRef.current.heroTimer = 0;
      animRef.current.heroDur = visualEvent.kind === 'hero_ultimate' ? 0.9 : 0.58;
      fx.triggerOmen(heroX, heroY, visualEvent.color ?? worldStyle.defaultColor);
      fx.triggerImpact({
        fromX: heroX + 26,
        fromY: heroY - 12,
        toX: enemyX,
        toY: enemyY,
        color: visualEvent.color ?? worldStyle.defaultColor,
        style: worldStyle.style,
        shape: worldStyle.shape,
        heavy: Boolean(visualEvent.heavy || visualEvent.kind === 'hero_ultimate'),
        damageText: visualEvent.damageText,
        subText: visualEvent.subText,
        numColor: visualEvent.color ?? '#fde047',
        targetIsEnemy: true,
      });
      // Push back Zero Legion march in Math Tower Defense
      if (subject === 'math') {
        animRef.current.enemyMarchX = Math.max(0, animRef.current.enemyMarchX - 28);
      }
    } else if (visualEvent.kind === 'enemy_attack') {
      animRef.current.heroState = 'hit';
      animRef.current.heroTimer = 0;
      animRef.current.heroDur = 0.45;
      fx.triggerImpact({
        fromX: enemyX - 24,
        fromY: enemyY,
        toX: heroX,
        toY: heroY,
        color: '#ef4444',
        style: 'laser',
        shape: 'spark',
        heavy: true,
        damageText: visualEvent.damageText,
        subText: visualEvent.subText,
        numColor: '#f87171',
        targetIsEnemy: false,
      });
      if (subject === 'math') {
        animRef.current.enemyMarchX = Math.min(180, animRef.current.enemyMarchX + 24);
      }
    } else if (visualEvent.kind === 'heal' || visualEvent.kind === 'shield_block') {
      animRef.current.heroState = 'cast';
      animRef.current.heroTimer = 0;
      animRef.current.heroDur = 0.55;
      fx.spawnFloatingNumber({
        x: heroX,
        y: heroY - 48,
        text: visualEvent.damageText,
        subText: visualEvent.subText,
        color: visualEvent.kind === 'heal' ? '#34d399' : '#38bdf8',
        scale: 1.15,
      });
      for (let i = 0; i < 14; i++) {
        fx.spawnParticle({
          x: heroX + (Math.random() - 0.5) * 50,
          y: heroY + 20,
          vx: (Math.random() - 0.5) * 30,
          vy: -60 - Math.random() * 80,
          size: 4,
          color: visualEvent.kind === 'heal' ? '#34d399' : '#38bdf8',
          maxLife: 0.7,
          gravity: -20,
          shape: 'circle',
        });
      }
    }
  }, [visualEvent, subject]);

  // Keyboard movement for Word Galaxy mech dodge (W/S/ArrowUp/ArrowDown)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
        animRef.current.keys.add(e.key.toLowerCase());
      }
    };
    const up = (e: KeyboardEvent) => {
      animRef.current.keys.delete(e.key.toLowerCase());
    };
    const clear = () => animRef.current.keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // Main 60 FPS requestAnimationFrame loop (decoupled from React!)
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const loop = (ts: number) => {
      rafId = requestAnimationFrame(loop);
      const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(320, Math.round(rect.width));
      const targetH = Math.max(220, Math.round(rect.height));

      if (canvas.width !== Math.round(targetW * dpr) || canvas.height !== Math.round(targetH * dpr)) {
        canvas.width = Math.round(targetW * dpr);
        canvas.height = Math.round(targetH * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = propsRef.current;
      const anim = animRef.current;
      const fx = fxRef.current;

      const { simDt, shakeX, shakeY } = p.paused
        ? { simDt: 0, shakeX: 0, shakeY: 0 }
        : fx.update(rawDt);

      anim.time += simDt;

      // Advance hero action timer
      if (anim.heroState !== 'idle' && anim.heroState !== 'victory' && anim.heroState !== 'defeated') {
        anim.heroTimer += simDt;
        if (anim.heroTimer >= anim.heroDur) {
          anim.heroState = 'idle';
          anim.heroTimer = 0;
        }
      }
      if (p.enemyHpRatio <= 0) anim.heroState = 'victory';
      else if (p.heroHpRatio <= 0) anim.heroState = 'defeated';

      // Galaxy mech vertical control
      if (p.subject === 'english' && !p.paused) {
        const up = anim.keys.has('arrowup') || anim.keys.has('w');
        const down = anim.keys.has('arrowdown') || anim.keys.has('s');
        if (up) anim.mechY -= 190 * simDt;
        if (down) anim.mechY += 190 * simDt;
        anim.mechY = Math.max(68, Math.min(targetH - 58, anim.mechY));
      }

      // Math Tower Defense slow march
      if (p.subject === 'math' && p.mathPhase === 'night' && !p.paused && p.enemyHpRatio > 0) {
        anim.enemyMarchX = Math.min(180, anim.enemyMarchX + 5.5 * simDt);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(shakeX, shakeY);

      // 1. Background image + themed atmospheric scrim
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, targetW, targetH);
      if (bgImgRef.current) {
        const img = bgImgRef.current;
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.globalAlpha = p.subject === 'math' && p.mathPhase === 'day' ? 0.65 : 0.45;
        ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
        ctx.globalAlpha = 1;
      }

      // World-specific atmospheric overlay & stage floor
      const grad = ctx.createLinearGradient(0, 0, 0, targetH);
      if (p.subject === 'chinese') {
        grad.addColorStop(0, 'rgba(12, 10, 9, 0.35)');
        grad.addColorStop(1, 'rgba(12, 10, 9, 0.85)');
      } else if (p.subject === 'english') {
        grad.addColorStop(0, 'rgba(7, 11, 26, 0.45)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.82)');
      } else if (p.subject === 'math') {
        grad.addColorStop(0, p.mathPhase === 'day' ? 'rgba(14, 165, 233, 0.18)' : 'rgba(15, 23, 42, 0.5)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
      } else {
        grad.addColorStop(0, 'rgba(41, 18, 8, 0.3)');
        grad.addColorStop(1, 'rgba(28, 12, 6, 0.85)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);

      // Lumina Burst Golden Aura (10 Combo!)
      if (p.luminaBurst) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.55 + Math.sin(anim.time * 12) * 0.25;
        ctx.strokeRect(4, 4, targetW - 8, targetH - 8);
        ctx.restore();
      }

      // 2. Render World-Specific Gameplay Mechanics on Canvas
      const progress = Math.min(1, anim.heroTimer / Math.max(0.1, anim.heroDur));
      const leadHero = p.party[p.activePartyIndex] ?? p.party[0];

      if (p.subject === 'chinese') {
        // Ink Realm: 3-hero RPG formation + ground ink scroll platform + drifting petals
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, targetH * 0.82);
        ctx.lineTo(targetW - 40, targetH * 0.82);
        ctx.stroke();

        // Draw 3-hero party
        p.party.slice(0, 3).forEach((hero, idx) => {
          const isLead = idx === p.activePartyIndex;
          const hx = targetW * (isLead ? 0.27 : 0.14 + idx * 0.05);
          const hy = targetH * (isLead ? 0.66 : idx === 0 ? 0.54 : 0.72);
          drawSkeletalHero({
            ctx,
            x: hx,
            y: hy,
            scale: isLead ? 1.05 : 0.78,
            facing: 1,
            time: anim.time + idx * 0.6,
            state: isLead ? anim.heroState : 'idle',
            stateProgress: progress,
            character: hero,
            evolutionStage: 1,
            whiteFlash: isLead && fx.heroFlashTimer > 0,
            panicked: p.panicked,
          });
        });

        drawEnemyMonster({
          ctx,
          x: targetW * 0.76,
          y: targetH * 0.56,
          time: anim.time,
          subject: 'chinese',
          isBoss: p.isBoss,
          hpRatio: p.enemyHpRatio,
          whiteFlash: fx.enemyFlashTimer > 0,
          shieldActive: p.enemyShieldActive,
          label: p.enemyName,
        });
      } else if (p.subject === 'english') {
        // Word Galaxy: Scrolling parallax starfield + flight lanes + Mech + clickable word drones
        for (const star of anim.stars) {
          star.x -= star.speed * simDt;
          if (star.x < 0) star.x = targetW;
          ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
          ctx.fillRect(star.x, (star.y / 300) * targetH, star.size * 2.2, star.size * 0.8);
        }

        // Holographic laser sight line from Mech
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.28)';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(targetW * 0.22 + 34, anim.mechY - 6);
        ctx.lineTo(targetW * 0.74, anim.mechY - 6);
        ctx.stroke();
        ctx.setLineDash([]);

        if (leadHero) {
          drawSkeletalHero({
            ctx,
            x: targetW * 0.22,
            y: anim.mechY,
            scale: 0.96,
            facing: 1,
            time: anim.time,
            state: anim.heroState === 'idle' ? 'run' : anim.heroState,
            stateProgress: progress,
            character: leadHero,
            evolutionStage: 1,
            whiteFlash: fx.heroFlashTimer > 0,
            panicked: p.panicked,
          });
        }

        // Flying Target Drones showing quick lock-on badges
        if (p.galaxyTargets.length > 0 && p.enemyHpRatio > 0) {
          p.galaxyTargets.slice(0, 4).forEach((label, i) => {
            const laneY = 58 + i * ((targetH - 110) / Math.max(1, Math.min(4, p.galaxyTargets.length) - 1 || 1));
            const dx = targetW * 0.56 + Math.sin(anim.time * 2.4 + i) * 14;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(dx - 58, laneY - 15, 116, 30, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#e0f2fe';
            ctx.font = '700 12px "Noto Sans TC", sans-serif';
            ctx.textAlign = 'center';
            const shortTxt = label.length > 12 ? `${label.slice(0, 11)}…` : label;
            ctx.fillText(`[${i + 1}] ${shortTxt}`, dx, laneY + 4);
          });
        }

        drawEnemyMonster({
          ctx,
          x: targetW * 0.82,
          y: targetH * 0.52,
          time: anim.time,
          subject: 'english',
          isBoss: p.isBoss,
          hpRatio: p.enemyHpRatio,
          whiteFlash: fx.enemyFlashTimer > 0,
          shieldActive: p.enemyShieldActive,
          label: p.enemyName,
        });
      } else if (p.subject === 'math') {
        // Math Kingdom: Blueprint Grid + Built Castle Turrets + Defense Path + Zero Legion March
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx < targetW; gx += 36) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, targetH);
          ctx.stroke();
        }
        for (let gy = 0; gy < targetH; gy += 36) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(targetW, gy);
          ctx.stroke();
        }

        // Winding defense road
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(targetW * 0.86, targetH * 0.68);
        ctx.lineTo(targetW * 0.16, targetH * 0.68);
        ctx.stroke();

        // Kingdom Gate & Turrets on left (upgrade visually with mathTowerLevel)
        const gateX = targetW * 0.1;
        const gateTop = targetH * 0.36;
        const gateH = targetH * 0.46;
        // Stone & brass tower base
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(gateX - 30, gateTop + 14, 60, gateH - 14, 8);
        ctx.fill();
        ctx.stroke();
        // Battlement crown
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gateX - 34, gateTop, 68, 18, 5);
        ctx.fill();
        ctx.stroke();
        // Rotating brass gear emblem on tower
        ctx.save();
        ctx.translate(gateX, gateTop + gateH * 0.54);
        ctx.rotate(anim.time * 1.1);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();
        for (let g = 0; g < 6; g++) {
          const ang = (g * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
          ctx.lineTo(Math.cos(ang) * 16, Math.sin(ang) * 16);
          ctx.stroke();
        }
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 5 + Math.sin(anim.time * 5) * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Turret barrels with muzzle glow
        for (let t = 0; t < Math.min(3, p.mathTowerLevel); t++) {
          const by = gateTop + 26 + t * 24;
          ctx.fillStyle = '#0ea5e9';
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(gateX + 18, by, 26, 10, 3);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fde047';
          ctx.fillRect(gateX + 41, by + 2, 4, 6);
        }
        ctx.fillStyle = '#fde68a';
        ctx.font = '700 12px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`數境砲塔 Lv.${p.mathTowerLevel}`, gateX, gateTop - 8);

        if (leadHero) {
          drawSkeletalHero({
            ctx,
            x: targetW * 0.26,
            y: targetH * 0.64,
            scale: 1.0,
            facing: 1,
            time: anim.time,
            state: anim.heroState,
            stateProgress: progress,
            character: leadHero,
            evolutionStage: 1,
            whiteFlash: fx.heroFlashTimer > 0,
            panicked: p.panicked,
          });
        }

        const zeroX = Math.max(targetW * 0.46, targetW * 0.78 - anim.enemyMarchX);
        drawEnemyMonster({
          ctx,
          x: zeroX,
          y: targetH * 0.58,
          time: anim.time,
          subject: 'math',
          isBoss: p.isBoss,
          hpRatio: p.enemyHpRatio,
          whiteFlash: fx.enemyFlashTimer > 0,
          shieldActive: p.enemyShieldActive,
          label: p.enemyName,
        });
      } else {
        // Elemental Cuisine: Glowing Cooking Hearth + Giant Sizzling Wok + Heat Gauge
        const wokX = targetW * 0.47;
        const wokY = targetH * 0.72;
        // Fire under wok
        const flameH = 14 + (p.cuisineHeat / 100) * 18 + Math.sin(anim.time * 16) * 4;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(wokX, wokY + 26, 36, flameH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wok body
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wokX, wokY, 44, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Bubbling soup
        ctx.fillStyle = p.cuisineHeat > 70 ? '#fb7185' : '#34d399';
        ctx.beginPath();
        ctx.ellipse(wokX, wokY + 4, 38, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.font = '700 11px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`料理火力 ${Math.round(p.cuisineHeat)}%`, wokX, wokY + 44);

        if (leadHero) {
          drawSkeletalHero({
            ctx,
            x: targetW * 0.24,
            y: targetH * 0.65,
            scale: 1.02,
            facing: 1,
            time: anim.time,
            state: anim.heroState,
            stateProgress: progress,
            character: leadHero,
            evolutionStage: 1,
            whiteFlash: fx.heroFlashTimer > 0,
            panicked: p.panicked,
          });
        }

        drawEnemyMonster({
          ctx,
          x: targetW * 0.77,
          y: targetH * 0.56,
          time: anim.time,
          subject: 'science',
          isBoss: p.isBoss,
          hpRatio: p.enemyHpRatio,
          whiteFlash: fx.enemyFlashTimer > 0,
          shieldActive: p.enemyShieldActive,
          label: p.enemyName,
        });
      }

      // 3. Render Pooled Particles, Beams, Floating Numbers
      fx.render(ctx);

      ctx.restore();
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (subject !== 'english' || !onGalaxyShootOption || galaxyTargets.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const count = Math.min(4, galaxyTargets.length);
    const band = rect.height / count;
    const idx = Math.max(0, Math.min(count - 1, Math.floor(clickY / band)));
    onGalaxyShootOption(idx);
  };

  return (
    <div className="relative w-full h-[250px] sm:h-[290px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl">
      <canvas
        ref={canvasRef}
        data-testid="battle-canvas"
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />
      {/* World-specific subtle HUD tag top-left */}
      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700/60">
        {subject === 'chinese' && '墨靈幻境・3人小隊水墨戰場'}
        {subject === 'english' && '星際機甲戰線・W/S閃避・點擊或按 1-4 射擊目標'}
        {subject === 'math' && (mathPhase === 'day' ? '數境王國・白天建造階段' : '數境王國・夜晚塔防守城')}
        {subject === 'science' && '元素料理對決・科學烹調戰場'}
      </div>
      {panicked && (
        <div className="pointer-events-none absolute top-3 right-3 rounded-lg bg-sky-500/90 text-slate-950 px-3 py-1 text-xs font-black">
          慌張中・請冷靜看題（本題無速度加成）
        </div>
      )}
      {luminaBurst && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-amber-400 text-slate-950 px-4 py-1 text-xs font-black tracking-wider shadow-lg">
          10 連擊達成・智光爆發 傷害 +25%！
        </div>
      )}
    </div>
  );
};
