/**
 * Web Speech API wrapper for zh-TW & en-US read-aloud (Spec §12 & §14)
 */
export function speakText(text: string, lang: 'zh-TW' | 'en-US' = 'zh-TW', rate = 0.95): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Gracefully ignore in headless / restricted environments
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

/** Common Taiwan Grade-3/4 Zhuyin lookup for ruby annotation rendering */
const ZHUYIN_MAP: Record<string, string> = {
  智: 'ㄓˋ',
  光: 'ㄍㄨㄤ',
  守: 'ㄕㄡˇ',
  護: 'ㄏㄨˋ',
  者: 'ㄓㄜˇ',
  數: 'ㄕㄨˋ',
  學: 'ㄒㄩㄝˊ',
  國: 'ㄍㄨㄛˊ',
  語: 'ㄩˇ',
  自: 'ㄗˋ',
  然: 'ㄖㄢˊ',
  英: 'ㄧㄥ',
  文: 'ㄨㄣˊ',
  題: 'ㄊㄧˊ',
  目: 'ㄇㄨˋ',
  答: 'ㄉㄚˊ',
  案: 'ㄢˋ',
  請: 'ㄑㄧㄥˇ',
  問: 'ㄨㄣˋ',
  下: 'ㄒㄧㄚˋ',
  列: 'ㄌㄧㄝˋ',
  哪: 'ㄋㄚˇ',
  一: 'ㄧ',
  個: 'ㄍㄜ˙',
  是: 'ㄕˋ',
  正: 'ㄓㄥˋ',
  確: 'ㄑㄩㄝˋ',
  的: 'ㄉㄜ˙',
  成: 'ㄔㄥˊ',
  修: 'ㄒㄧㄡ',
  辭: 'ㄘˊ',
  植: 'ㄓˊ',
  物: 'ㄨˋ',
  動: 'ㄉㄨㄥˋ',
  水: 'ㄕㄨㄟˇ',
  磁: 'ㄘˊ',
  鐵: 'ㄊㄧㄝˇ',
  空: 'ㄎㄨㄥ',
  氣: 'ㄑㄧˋ',
  分: 'ㄈㄣ',
  除: 'ㄔㄨˊ',
  乘: 'ㄔㄥˊ',
  加: 'ㄐㄧㄚ',
  減: 'ㄐㄧㄢˇ',
  周: 'ㄓㄡ',
  長: 'ㄔㄤˊ',
  面: 'ㄇㄧㄢˋ',
  積: 'ㄐㄧ',
  體: 'ㄊㄧˇ',
  角: 'ㄐㄧㄠˇ',
  度: 'ㄉㄨˋ',
  公: 'ㄍㄨㄥ',
  尺: 'ㄔˇ',
  克: 'ㄎㄜˋ',
  升: 'ㄕㄥ',
  部: 'ㄅㄨˋ',
  首: 'ㄕㄡˇ',
  譬: 'ㄆㄧˋ',
  喻: 'ㄩˋ',
  擬: 'ㄋㄧˇ',
  人: 'ㄖㄣˊ',
  誇: 'ㄎㄨㄚ',
  飾: 'ㄕˋ',
  排: 'ㄆㄞˊ',
  比: 'ㄅㄧˇ',
  因: 'ㄧㄣ',
  倍: 'ㄅㄟˋ',
  質: 'ㄓˊ',
  熱: 'ㄖㄜˋ',
  酸: 'ㄙㄨㄢ',
  鹼: 'ㄐㄧㄢˇ',
  太: 'ㄊㄞˋ',
  陽: 'ㄧㄤˊ',
  月: 'ㄩㄝˋ',
  亮: 'ㄌㄧㄤˋ',
  風: 'ㄈㄥ',
  雨: 'ㄩˇ',
  電: 'ㄉㄧㄢˋ',
  路: 'ㄌㄨˋ',
  昆: 'ㄎㄨㄣ',
  蟲: 'ㄔㄨㄥˊ',
  葉: 'ㄧㄝˋ',
  莖: 'ㄐㄧㄥ',
  根: 'ㄍㄣ',
  花: 'ㄏㄨㄚ',
  果: 'ㄍㄨㄛˇ',
  實: 'ㄕˊ',
  種: 'ㄓㄨㄥˇ',
  子: 'ㄗˇ',
};

export interface AnnotatedChar {
  char: string;
  zhuyin?: string;
}

export function annotateZhuyin(text: string): AnnotatedChar[] {
  return Array.from(text).map((char) => ({
    char,
    zhuyin: ZHUYIN_MAP[char],
  }));
}
