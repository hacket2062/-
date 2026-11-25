import type { Grade, Question, Semester, SubjectId } from '../types/game';
import { getCurriculumUnits } from './curriculum';

/**
 * Curated original 108-curriculum Taiwan elementary questions across all 4 subjects,
 * covering all interactive question types: single_choice, true_false, radical_combine,
 * spelling, listening, number_line, ordering.
 */
const CURATED_QUESTIONS: Question[] = [
  // ==================== 數學 MATH ====================
  // 五上第1章：因數與倍數 (Spec P3 Vertical Slice flagship chapter!)
  {
    id: 'm5_1_f1',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '因數與倍數',
    type: 'single_choice',
    difficulty: 1,
    prompt: '請問下列哪一個數是 24 的因數？',
    options: ['6', '5', '7', '9'],
    answer: '6',
    explanation: '24 ÷ 6 ＝ 4，可以整除沒有餘數，所以 6 是 24 的因數。',
    explanationSteps: ['檢查 24 除以各選項是否整除', '24 ÷ 6 ＝ 4（整除）', '其餘 5、7、9 皆有餘數，故選 6'],
    hint: '試著用 24 除以選項，能整除的就是因數！',
  },
  {
    id: 'm5_1_f2',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '因數與倍數',
    type: 'single_choice',
    difficulty: 2,
    prompt: '下列哪一個數同時是 2 和 5 的倍數？',
    options: ['30', '25', '24', '35'],
    answer: '30',
    explanation: '同時是 2 和 5 的倍數，個位數字一定是 0，所以答案是 30。',
    explanationSteps: ['2 的倍數個位是 0、2、4、6、8', '5 的倍數個位是 0 或 5', '同時符合的個位一定是 0 → 30'],
    hint: '同時是 2 和 5 的倍數，想想看個位數字必須是多少？',
  },
  {
    id: 'm5_1_f3',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '因數與倍數',
    type: 'true_false',
    difficulty: 2,
    prompt: '是非題：任何一個大於 0 的整數，它最小的因數都是 1，最大的因數都是自己。',
    options: ['正確 ○', '錯誤 ✕'],
    answer: '正確 ○',
    explanation: '任何正整數 n 都可以寫成 1 × n，因此最小因數一定是 1、最大因數一定是自己。',
    hint: '試著舉例 12 的因數：1, 2, 3, 4, 6, 12。',
  },
  {
    id: 'm5_1_f4',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '因數與倍數',
    type: 'number_line',
    difficulty: 2,
    prompt: '數線砲台鎖定！請在數線上點出「12 和 18 的最大公因數」所在的位置。',
    numberLine: { min: 0, max: 12, step: 1, target: 6, tolerance: 0.4, unitLabel: '' },
    answer: '6',
    explanation: '12 的因數有 1,2,3,4,6,12；18 的因數有 1,2,3,6,9,18。最大的共同因數是 6。',
    explanationSteps: ['列出 12 的因數：1, 2, 3, 4, 6, 12', '列出 18 的因數：1, 2, 3, 6, 9, 18', '最大公因數為 6'],
    hint: '找出 12 和 18 都能整除的最大數字，介於 4 到 8 之間。',
  },
  {
    id: 'm5_1_f5',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '公因數公倍數',
    type: 'single_choice',
    difficulty: 3,
    prompt: '藍圖工坊要將 36 塊木板平分成若干堆，每堆一樣多且不分剩，每堆不可能是幾塊？',
    options: ['8 塊', '4 塊', '6 塊', '9 塊'],
    answer: '8 塊',
    explanation: '36 ÷ 8 ＝ 4 餘 4，無法整除，所以 8 不是 36 的因數。',
    explanationSteps: ['平分且不剩下＝找 36 的因數', '36 ÷ 4＝9、36 ÷ 6＝6、36 ÷ 9＝4 皆整除', '36 ÷ 8 有餘數，故不可能為 8 塊'],
    hint: '不能平分代表那個數字不是 36 的因數喔！',
  },
  {
    id: 'm5_1_f6',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '公因數公倍數',
    type: 'single_choice',
    difficulty: 3,
    prompt: '海狸建築師每隔 4 天巡視城牆，貓頭鷹法師每隔 6 天巡視一次。兩人今天同時出發，最快幾天後會再次同日出發？',
    options: ['12 天', '10 天', '18 天', '24 天'],
    answer: '12 天',
    explanation: '找 4 和 6 的最小公倍數：4 的倍數有 4, 8, 12…；6 的倍數有 6, 12…，最小公倍數是 12。',
    explanationSteps: ['4 的倍數：4, 8, 12, 16...', '6 的倍數：6, 12, 18...', '第一次同時遇到就是最小公倍數 12 天'],
    hint: '把 4 的倍數和 6 的倍數寫出來，找第一個重複的數字！',
  },
  {
    id: 'm5_1_f7',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '因數與倍數',
    type: 'single_choice',
    difficulty: 4,
    prompt: '有一個三位數「24□」是 3 的倍數，請問 □ 中可以填入下列哪一個數字？',
    options: ['3', '1', '2', '4'],
    answer: '3',
    explanation: '判斷 3 的倍數：各位數字和要是 3 的倍數。2 ＋ 4 ＋ 3 ＝ 9，9 是 3 的倍數。',
    explanationSteps: ['3 的倍數判別法：各位數字總和能被 3 整除', '2 ＋ 4 ＝ 6，加上 3 變成 9', '9 ÷ 3 ＝ 3 整除，答案選 3'],
    hint: '把 2 ＋ 4 ＋ □ 加起來，總和必須是 3 的倍數喔！',
  },
  {
    id: 'm5_1_f8',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '公因數公倍數',
    type: 'ordering',
    difficulty: 4,
    prompt: '請將 18 的所有正因數中，這四個數字由小到大依序排列：',
    parts: ['9', '2', '18', '6'],
    answer: '2,6,9,18',
    explanation: '由小到大排列為：2 ＜ 6 ＜ 9 ＜ 18，它們都能整除 18。',
    hint: '從最小的偶數開始點選，一路排到最大的 18。',
  },
  {
    id: 'm5_1_f9',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '公因數公倍數',
    type: 'single_choice',
    difficulty: 5,
    prompt: '要把長 24 公分、寬 16 公分的長方形地磚鋪成一個「最小的正方形廣場」，這個正方形的邊長是多少公分？',
    options: ['48 公分', '8 公分', '32 公分', '96 公分'],
    answer: '48 公分',
    explanation: '拼成大正方形需要找 24 和 16 的最小公倍數：24 × 2 ＝ 48，16 × 3 ＝ 48，故邊長 48 公分。',
    explanationSteps: ['鋪成大正方形＝邊長要同時是 24 與 16 的倍數', '24 的倍數：24, 48, 72...', '16 的倍數：16, 32, 48...', '最小公倍數是 48 公分'],
    hint: '小拼大找公倍數！列出 24 和 16 的倍數找最小的共同值。',
  },
  {
    id: 'm5_1_f10',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u1',
    knowledgePoint: '公因數公倍數',
    type: 'single_choice',
    difficulty: 5,
    prompt: '王國慶典準備了 42 顆金蘋果與 28 塊起司，平分裝進最多幾個禮盒，才能讓每盒內容完全一樣？',
    options: ['14 個', '7 個', '6 個', '21 個'],
    answer: '14 個',
    explanation: '分裝到最多禮盒需找 42 與 28 的最大公因數：42 ＝ 14 × 3，28 ＝ 14 × 2，最大公因數是 14。',
    explanationSteps: ['大平分成小份＝找最大公因數', '42 與 28 的公因數有 1, 2, 7, 14', '最多可裝成 14 個禮盒'],
    hint: '「平分、最多幾個」是求最大公因數的經典關鍵字！',
  },
  // 五上第2章：分數擴分約分異分母
  {
    id: 'm5_1_u2_1',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u2',
    knowledgePoint: '擴分約分通分',
    type: 'single_choice',
    difficulty: 2,
    prompt: '將 12/18 約分成最簡分數，結果是多少？',
    options: ['2/3', '3/4', '4/6', '6/9'],
    answer: '2/3',
    explanation: '12 和 18 的最大公因數是 6，分子分母同除以 6 得到 2/3。',
    hint: '把分子和分母同時除以 6 看看！',
  },
  {
    id: 'm5_1_u2_2',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u2',
    knowledgePoint: '異分母加減',
    type: 'single_choice',
    difficulty: 3,
    prompt: '計算 1/2 ＋ 1/3 的答案是多少？',
    options: ['5/6', '2/5', '2/6', '3/5'],
    answer: '5/6',
    explanation: '先通分為分母 6：1/2 ＝ 3/6，1/3 ＝ 2/6，相加得到 5/6。',
    explanationSteps: ['找 2 和 3 的公倍數 6 當分母', '1/2 ＝ 3/6，1/3 ＝ 2/6', '3/6 ＋ 2/6 ＝ 5/6'],
    hint: '異分母不能直接把分母相加，先通分成分母 6 喔！',
  },
  {
    id: 'm5_1_u2_3',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u2',
    knowledgePoint: '擴分約分通分',
    type: 'number_line',
    difficulty: 3,
    prompt: '數線砲台！請在 0 到 1 的數線上點出 3/4（＝0.75）的位置。',
    numberLine: { min: 0, max: 1, step: 0.25, target: 0.75, tolerance: 0.08, unitLabel: '' },
    answer: '0.75',
    explanation: '把 0 到 1 平分成 4 格，第 3 格就是 3/4，也就是 0.75。',
    hint: '0.5 是一半，3/4 在 0.5 和 1 的正中間！',
  },
  // 五上第3章：多邊形面積
  {
    id: 'm5_1_u3_1',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u3',
    knowledgePoint: '多邊形面積',
    type: 'single_choice',
    difficulty: 2,
    prompt: '一塊三角形農田的底是 10 公尺、高是 6 公尺，請問面積是多少平方公尺？',
    options: ['30 平方公尺', '60 平方公尺', '16 平方公尺', '20 平方公尺'],
    answer: '30 平方公尺',
    explanation: '三角形面積＝底 × 高 ÷ 2 ＝ 10 × 6 ÷ 2 ＝ 30 平方公尺。',
    hint: '別忘了三角形面積算完底×高後，一定要除以 2！',
  },
  {
    id: 'm5_1_u3_2',
    grade: 5,
    semester: 1,
    subject: 'math',
    unitId: 'math_g5_s1_u3',
    knowledgePoint: '線對稱',
    type: 'single_choice',
    difficulty: 3,
    prompt: '請問一個正方形總共有幾條對稱軸？',
    options: ['4 條', '2 條', '1 條', '8 條'],
    answer: '4 條',
    explanation: '正方形有水平、垂直以及兩條對角線，共 4 條對稱軸。',
    hint: '除了上下、左右對摺外，斜對角也可以完全重合喔！',
  },

  // ==================== 國語文 CHINESE ====================
  {
    id: 'c5_1_1',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u1',
    knowledgePoint: '常用字形音義',
    type: 'radical_combine',
    difficulty: 1,
    prompt: '部件拼字魔法！請點選兩個正確部件，組合成代表「水流澄澈乾淨」的「清」字：',
    parts: ['氵', '青', '火', '心'],
    answer: '氵+青',
    elementTag: 'water',
    explanation: '「氵」（水部）與「青」組成「清」，與水有關，形容清澈乾淨。',
    hint: '和水有關的字通常有「三點水」部首喔！',
  },
  {
    id: 'c5_1_2',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u1',
    knowledgePoint: '成語典故',
    type: 'single_choice',
    difficulty: 2,
    prompt: '成語連鎖！比喻「畫龍點上眼睛就飛走了，形容文章或說話加上關鍵一筆更加精彩」是哪個成語？',
    options: ['畫龍點睛', '畫蛇添足', '葉公好龍', '龍飛鳳舞'],
    answer: '畫龍點睛',
    elementTag: 'fire',
    explanation: '「畫龍點睛」源自南朝張僧繇畫龍典故，比喻關鍵處加上精闢語句讓整體生動傳神。',
    hint: '關鍵字是「點上眼睛」！',
  },
  {
    id: 'c5_1_3',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u1',
    knowledgePoint: '近反義詞',
    type: 'single_choice',
    difficulty: 2,
    prompt: '請問「雪中送炭」的相反意義成語是哪一個？',
    options: ['落井下石', '錦上添花', '守望相助', '扶弱濟貧'],
    answer: '落井下石',
    elementTag: 'wind',
    explanation: '「雪中送炭」指在別人困難時給予幫助；「落井下石」則是趁人危難時加害，為反義成語。',
    hint: '一個是在危難時幫忙，相反的就是趁人危難時欺負他。',
  },
  {
    id: 'c5_1_4',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u2',
    knowledgePoint: '設問與映襯',
    type: 'single_choice',
    difficulty: 3,
    prompt: '修辭屬性辨識：「微風輕輕撫摸著稻穗的臉龐，唱起溫柔的搖籃曲。」這句話運用了哪種修辭？',
    options: ['擬人（風屬性）', '譬喻（火屬性）', '誇飾（雷屬性）', '排比（水屬性）'],
    answer: '擬人（風屬性）',
    elementTag: 'wind',
    explanation: '把沒有生命的「微風」賦予人類「撫摸、唱搖籃曲」的動作，這就是擬人修辭！',
    hint: '「撫摸臉龐、唱歌」都是人類才會做的動作喔！',
  },
  {
    id: 'c5_1_5',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u2',
    knowledgePoint: '設問與映襯',
    type: 'single_choice',
    difficulty: 3,
    prompt: '修辭屬性辨識：「他餓得好像可以吞下一整頭大象！」這句話主要運用了什麼修辭？',
    options: ['誇飾（雷屬性）', '排比（水屬性）', '設問（金屬性）', '對偶（木屬性）'],
    answer: '誇飾（雷屬性）',
    elementTag: 'thunder',
    explanation: '人不可能真的吞下一整頭大象，故意誇張描述飢餓程度，屬於誇飾修辭。',
    hint: '超出常理、故意放大的形容方式叫做什麼？',
  },
  {
    id: 'c5_1_6',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u1',
    knowledgePoint: '常用字形音義',
    type: 'radical_combine',
    difficulty: 2,
    prompt: '部件拼字魔法！請組合出代表「誠實講信用、說話算話」的「誠」字：',
    parts: ['言', '成', '木', '口'],
    answer: '言+成',
    elementTag: 'fire',
    explanation: '「言」加上「成」組成「誠」，代表說出的話真誠可靠。',
    hint: '和說話有關的部首是「言」字旁！',
  },
  {
    id: 'c5_1_7',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u2',
    knowledgePoint: '破折號刪節號',
    type: 'single_choice',
    difficulty: 3,
    prompt: '病句破盾！下列哪一句的「的、得、地」使用完全正確？',
    options: [
      '小狗開心地在草地上跑得飛快。',
      '小狗開心在草地上跑的飛快。',
      '小狗開心的在草地上跑地飛快。',
      '小狗開心得在草地上跑的飛快。',
    ],
    answer: '小狗開心地在草地上跑得飛快。',
    elementTag: 'water',
    explanation: '動詞前修飾動作通常用「地」（開心地跑），動詞後補充程度用「得」（跑得飛快）。',
    hint: '記住口訣：動詞前面「地」，動詞後面「得」，名詞前面「的」！',
  },
  {
    id: 'c5_1_8',
    grade: 5,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g5_s1_u1',
    knowledgePoint: '一字多義',
    type: 'single_choice',
    difficulty: 4,
    prompt: '下列哪一個詞語中的「光」字，意思與「把飯菜吃光」的「光」相同？',
    options: ['用光積蓄', '陽光普照', '光陰似箭', '為校爭光'],
    answer: '用光積蓄',
    elementTag: 'fire',
    explanation: '「吃光」與「用光」的「光」都代表「一點不剩、全部耗盡」的意思。',
    hint: '「吃光」就是全部吃完、一點都不剩的意思。',
  },
  {
    id: 'c3_1_1',
    grade: 3,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g3_s1_u1',
    knowledgePoint: '量詞疊字',
    type: 'single_choice',
    difficulty: 1,
    prompt: '下列哪一個量詞搭配最恰當？「天空飄著一（　）潔白的雲朵。」',
    options: ['朵', '枝', '張', '雙'],
    answer: '朵',
    explanation: '形容雲或花朵常用量詞「朵」。',
    hint: '想想看白雲常說「一什麼雲」？',
  },
  {
    id: 'c4_1_1',
    grade: 4,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g4_s1_u1',
    knowledgePoint: '多音字',
    type: 'single_choice',
    difficulty: 2,
    prompt: '「銀行」和「人行道」的「行」字，讀音分別是什麼？',
    options: ['ㄏㄤˊ ／ ㄒㄧㄥˊ', 'ㄒㄧㄥˊ ／ ㄏㄤˊ', '都是 ㄒㄧㄥˊ', '都是 ㄏㄤˊ'],
    answer: 'ㄏㄤˊ ／ ㄒㄧㄥˊ',
    explanation: '「銀行」指行業機構讀 ㄏㄤˊ；「人行道」指行走的路讀 ㄒㄧㄥˊ。',
    hint: '走動的意思讀 ㄒㄧㄥˊ，商店機構讀 ㄏㄤˊ。',
  },
  {
    id: 'c6_1_1',
    grade: 6,
    semester: 1,
    subject: 'chinese',
    unitId: 'chinese_g6_s1_u1',
    knowledgePoint: '文言淺語',
    type: 'single_choice',
    difficulty: 3,
    prompt: '文言淺語：「學而時習之，不亦說乎？」句中的「說」字在這裡是什麼意思？',
    options: ['高興、喜悅（通「悅」）', '說話、演講', '說明、解釋', '勸說'],
    answer: '高興、喜悅（通「悅」）',
    explanation: '在《論語》此句中，「說」通「悅」，讀作 ㄩㄝˋ，表示喜悅愉快的意思。',
    hint: '學習後時常溫習，難道不是一件很「開心」的事嗎？',
  },

  // ==================== 英語文 ENGLISH ====================
  {
    id: 'e5_1_1',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u1',
    knowledgePoint: '職業單字',
    type: 'listening',
    difficulty: 1,
    prompt: '聽力射擊！點擊喇叭聽英文發音，射擊對應的職業意思：',
    speechText: 'doctor',
    speechLang: 'en-US',
    options: ['🩺 醫生 (doctor)', '👨‍🍳 廚師 (cook)', '🧑‍✈️ 飛行員 (pilot)', '🧑‍🏫 老師 (teacher)'],
    answer: '🩺 醫生 (doctor)',
    explanation: 'doctor [ˈdɑːktɚ] 的中文意思是「醫生」。例句：My sister is a doctor.',
    hint: '聽開頭的 /d/ 音，在醫院照顧病人的職業！',
  },
  {
    id: 'e5_1_2',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u1',
    knowledgePoint: '時間與月份',
    type: 'single_choice',
    difficulty: 2,
    prompt: 'What time is it? 「現在是七點三十分」英文怎麼說？',
    speechText: "It's seven thirty.",
    speechLang: 'en-US',
    options: ["It's seven thirty.", "It's seven thirteen.", "It's six thirty.", "It's seventy three."],
    answer: "It's seven thirty.",
    explanation: '7 是 seven，30 是 thirty（13 才是 thirteen），所以七點三十分是 It\'s seven thirty.',
    hint: '注意區分 thirty (30) 和 thirteen (13) 喔！',
  },
  {
    id: 'e5_1_3',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u2',
    knowledgePoint: '現在進行式',
    type: 'single_choice',
    difficulty: 2,
    prompt: 'Look! The robot ______ now. （看！那台機器人現在正在唱歌。）',
    speechText: 'Look! The robot is singing now.',
    speechLang: 'en-US',
    options: ['is singing', 'sing', 'sings', 'sang'],
    answer: 'is singing',
    explanation: '看到 Look! 和 now 表示動作正在發生，要用現在進行式 be 動詞 + V-ing → is singing。',
    hint: '句尾有「now（現在）」，記得用 be 動詞加上 V-ing！',
  },
  {
    id: 'e5_1_4',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u1',
    knowledgePoint: '時間與月份',
    type: 'spelling',
    difficulty: 2,
    prompt: '拼字充能！依序射擊字母方塊拼出「月亮 (moon)」發射主砲：',
    speechText: 'moon',
    speechLang: 'en-US',
    parts: ['O', 'N', 'M', 'O', 'A'],
    answer: 'MOON',
    explanation: 'moon (M-O-O-N) 是「月亮」，雙寫 oo 發長音 /uː/。',
    hint: 'M 開頭，中間有兩個 O！',
  },
  {
    id: 'e5_1_5',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u2',
    knowledgePoint: "can/can't",
    type: 'single_choice',
    difficulty: 3,
    prompt: 'Boss 對話戰！對手問："Can you swim?" 下列哪一句是正確的肯定回答？',
    speechText: 'Can you swim?',
    speechLang: 'en-US',
    options: ['Yes, I can.', 'Yes, I do.', 'Yes, I am.', 'Yes, you can.'],
    answer: 'Yes, I can.',
    explanation: '用 Can you...? 提問時，回答也要用 can 呼應，並把 you 換成 I → Yes, I can.',
    hint: '用 Can 問，就用 can 答！',
  },
  {
    id: 'e5_1_6',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u2',
    knowledgePoint: 'Phonics長母音',
    type: 'listening',
    difficulty: 3,
    prompt: 'Phonics 節奏鎖定！哪一個單字發「長母音 a_e (/eɪ/)」？',
    speechText: 'cake',
    speechLang: 'en-US',
    options: ['cake 🎂', 'cat 🐱', 'cap 🧢', 'bag 🎒'],
    answer: 'cake 🎂',
    explanation: '字尾不發音的 e（a_e 結構）讓字母 a 發出長音 /eɪ/，所以 cake 是長母音！',
    hint: '找找看字尾藏著魔法無聲 e 的單字！',
  },
  {
    id: 'e5_1_7',
    grade: 5,
    semester: 1,
    subject: 'english',
    unitId: 'english_g5_s1_u2',
    knowledgePoint: '現在進行式',
    type: 'ordering',
    difficulty: 3,
    prompt: '句子組裝大招！依英文正確語序排列出「我正在看書」：',
    parts: ['reading', 'I', 'a book.', 'am'],
    answer: 'I,am,reading,a book.',
    explanation: '英文語序為：主詞 (I) ＋ be 動詞 (am) ＋ 動作 (reading) ＋ 受詞 (a book.)。',
    hint: '主詞 I 放在最前面，接著是 am！',
  },
  {
    id: 'e3_1_1',
    grade: 3,
    semester: 1,
    subject: 'english',
    unitId: 'english_g3_s1_u1',
    knowledgePoint: '問候語',
    type: 'listening',
    difficulty: 1,
    prompt: '聽力射擊！早上遇到老師說 "Good morning!"，應該怎麼回應？',
    speechText: 'Good morning!',
    speechLang: 'en-US',
    options: ['Good morning!', 'Good night!', 'Thank you!', 'Goodbye!'],
    answer: 'Good morning!',
    explanation: 'Good morning 是「早安」，早安互相回應 Good morning!。',
    hint: '早上見面互道早安喔！',
  },
  {
    id: 'e4_1_1',
    grade: 4,
    semester: 1,
    subject: 'english',
    unitId: 'english_g4_s1_u2',
    knowledgePoint: '天氣與星期',
    type: 'listening',
    difficulty: 2,
    prompt: '聽力射擊！聽發音選出對應的天氣圖示：',
    speechText: 'It is sunny today.',
    speechLang: 'en-US',
    options: ['☀️ 晴天 (sunny)', '🌧️ 雨天 (rainy)', '☁️ 多雲 (cloudy)', '💨 刮風 (windy)'],
    answer: '☀️ 晴天 (sunny)',
    explanation: 'sunny 來自 sun（太陽），意思是「晴朗的」。',
    hint: 'sun 就是太陽喔！',
  },
  {
    id: 'e6_1_1',
    grade: 6,
    semester: 1,
    subject: 'english',
    unitId: 'english_g6_s1_u1',
    knowledgePoint: '過去式',
    type: 'single_choice',
    difficulty: 3,
    prompt: 'I ______ to the science museum yesterday. （我昨天去了科學博物館。）',
    speechText: 'I went to the science museum yesterday.',
    speechLang: 'en-US',
    options: ['went', 'go', 'going', 'goes'],
    answer: 'went',
    explanation: 'yesterday（昨天）代表過去時間，go 的不規則過去式是 went。',
    hint: 'yesterday 代表昨天發生的事，要用過去式！',
  },

  // ==================== 自然科學 SCIENCE ====================
  {
    id: 's5_1_1',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u1',
    knowledgePoint: '水溶液酸鹼',
    type: 'single_choice',
    difficulty: 1,
    prompt: '元素料理調味！把「紫色高麗菜汁」滴進酸酸的檸檬汁裡，溶液會變成什麼顏色？',
    options: ['偏紅色（酸性）', '偏藍綠色（鹼性）', '保持深紫色（中性）', '變成透明無色'],
    answer: '偏紅色（酸性）',
    elementTag: 'fire',
    explanation: '紫色高麗菜汁是天然酸鹼指示劑：遇酸變偏紅色、中性維持紫色、遇鹼變藍綠或黃色。',
    hint: '記住口訣：酸紅、中紫、鹼藍綠！',
  },
  {
    id: 's5_1_2',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u1',
    knowledgePoint: '水溶液酸鹼',
    type: 'single_choice',
    difficulty: 2,
    prompt: '調味鍊金師測出小蘇打水會讓「紅色石蕊試紙變藍色」，請問小蘇打水屬於哪種性質？',
    options: ['鹼性', '酸性', '中性', '無法判斷'],
    answer: '鹼性',
    elementTag: 'water',
    explanation: '石蕊試紙特性：紅變藍代表鹼性；藍變紅代表酸性；都不變色代表中性。',
    hint: '石蕊試紙「紅變藍」就是鹼性喔！',
  },
  {
    id: 's5_1_3',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u1',
    knowledgePoint: '水溶液酸鹼',
    type: 'true_false',
    difficulty: 2,
    prompt: '料理實驗安全是非題：未知的水溶液只要看起來清澈透明，就可以直接用舌頭嚐嚐看是不是食鹽水。',
    options: ['錯誤 ✕', '正確 ○'],
    answer: '錯誤 ✕',
    elementTag: 'wind',
    explanation: '千萬不可隨便品嚐未知水溶液！有些無色溶液具腐蝕性或毒性，須用試紙或儀器檢驗。',
    hint: '實驗室安全第一條：未知液體絕對不能亂喝或亂聞！',
  },
  {
    id: 's5_1_4',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u2',
    knowledgePoint: '植物繁殖',
    type: 'single_choice',
    difficulty: 2,
    prompt: '食材採集！我們平常吃的「紅蘿蔔」和「地瓜」，主要是植物的哪一個部位？',
    options: ['根', '莖', '葉', '果實'],
    answer: '根',
    elementTag: 'wind',
    explanation: '紅蘿蔔與地瓜屬於「塊根」，負責儲存養分；馬鈴薯才是塊莖喔！',
    hint: '它們長在土裡，是膨大儲存養分的「根」！',
  },
  {
    id: 's5_1_5',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u2',
    knowledgePoint: '光的折射',
    type: 'single_choice',
    difficulty: 3,
    prompt: '把湯匙斜斜放進裝滿水的透明杯子裡，看起來好像折斷了，這是什麼光學現象？',
    options: ['光的折射', '光的反射', '光的散射', '光的直線傳播不變'],
    answer: '光的折射',
    elementTag: 'water',
    explanation: '光從空氣進入水中時傳播速度改變，行進方向發生偏折，稱為「光的折射」。',
    hint: '光穿過不同介質（空氣→水）彎折了，叫作「折」什麼？',
  },
  {
    id: 's5_1_6',
    grade: 5,
    semester: 1,
    subject: 'science',
    unitId: 'science_g5_s1_u2',
    knowledgePoint: '太陽與四季',
    type: 'single_choice',
    difficulty: 3,
    prompt: '在台灣，一年當中哪一個季節中午太陽的仰角最高、竿影最短？',
    options: ['夏季（夏至前後）', '冬季（冬至前後）', '春季', '秋季'],
    answer: '夏季（夏至前後）',
    elementTag: 'fire',
    explanation: '台灣位於北半球，夏季太陽直射北回歸線附近，中午太陽最接近頭頂，因此影子最短。',
    hint: '太陽越接近頭頂正上方，天氣越熱、影子越短！',
  },
  {
    id: 's3_1_1',
    grade: 3,
    semester: 1,
    subject: 'science',
    unitId: 'science_g3_s1_u1',
    knowledgePoint: '溶解',
    type: 'single_choice',
    difficulty: 1,
    prompt: '煮糖水時，哪一種做法可以讓冰糖在水中「溶解得最快」？',
    options: ['磨成細粉、用熱水並攪拌', '整大塊放進冰水不動', '放進冷水不攪拌', '把水倒掉一半'],
    answer: '磨成細粉、用熱水並攪拌',
    elementTag: 'fire',
    explanation: '溫度越高、顆粒越小（接觸面積大）、加上攪拌，都能大幅加快物質溶解速度。',
    hint: '熱水＋攪拌＋小顆粒三招一起用最快！',
  },
  {
    id: 's4_1_1',
    grade: 4,
    semester: 1,
    subject: 'science',
    unitId: 'science_g4_s1_u2',
    knowledgePoint: '簡單電路',
    type: 'single_choice',
    difficulty: 2,
    prompt: '下列哪一種廚房物品接進簡單電路中，最容易讓小燈泡發亮（屬於導體）？',
    options: ['不鏽鋼湯匙', '木頭筷子', '塑膠量杯', '橡皮擦'],
    answer: '不鏽鋼湯匙',
    elementTag: 'thunder',
    explanation: '金屬（如銅、鐵、不鏽鋼）容易導電，屬於導體；木頭、塑膠、橡膠多為絕緣體。',
    hint: '找找看哪一個是金屬做的！',
  },
  {
    id: 's6_1_1',
    grade: 6,
    semester: 1,
    subject: 'science',
    unitId: 'science_g6_s1_u1',
    knowledgePoint: '熱的傳播',
    type: 'single_choice',
    difficulty: 3,
    prompt: '烈焰主廚用金屬炒鍋加熱湯底，熱水上升、冷水下降形成循環，讓整鍋湯變熱，這主要是哪種熱傳播方式？',
    options: ['對流', '傳導', '輻射', '凝結'],
    answer: '對流',
    elementTag: 'fire',
    explanation: '液體與氣體受熱膨脹變輕上升、冷的下沉補充，形成「熱對流」。',
    hint: '水或空氣靠著冷熱流動循環傳熱，叫作「對」什麼？',
  },
];

/**
 * Deterministic procedural curriculum generator so ALL 32 grade×semester×subject slots
 * always have rich, fresh, accurate, grade-appropriate 108-curriculum questions!
 */
function generateMathUnitQuestions(grade: Grade, semester: Semester, unitId: string, kp: string, seedOffset: number): Question[] {
  const qs: Question[] = [];
  if (grade === 3 && semester === 1) {
    for (let i = 0; i < 6; i++) {
      const a = 120 + ((i + seedOffset) * 37) % 450;
      const b = 85 + ((i + seedOffset) * 29) % 320;
      const ans = a + b;
      qs.push({
        id: `gen_${unitId}_add_${i}`,
        grade,
        semester,
        subject: 'math',
        unitId,
        knowledgePoint: kp,
        type: 'single_choice',
        difficulty: ((i % 3) + 1) as 1 | 2 | 3,
        prompt: `建造農田需要木材 ${a} 根與石磚 ${b} 塊，合計共需要多少份建材？`,
        options: shuffleWithSeed([String(ans), String(ans + 10), String(ans - 10), String(ans + 100)], i + a),
        answer: String(ans),
        explanation: `${a} ＋ ${b} ＝ ${ans}。記得個位滿十要進位到十位喔！`,
        explanationSteps: [`個位相加後檢查是否進位`, `${a} ＋ ${b} ＝ ${ans}`],
        hint: `先算百位 ${Math.floor(a / 100) * 100} ＋ ${Math.floor(b / 100) * 100}，再把十位個位加上去！`,
      });
    }
  } else if (grade === 3 && semester === 2) {
    for (let i = 0; i < 6; i++) {
      const divisor = 3 + ((i + seedOffset) % 6);
      const q = 4 + ((i * 2 + seedOffset) % 6);
      const rem = 1 + (i % (divisor - 1));
      const dividend = divisor * q + rem;
      const ans = `${q} 餘 ${rem}`;
      qs.push({
        id: `gen_${unitId}_div_${i}`,
        grade,
        semester,
        subject: 'math',
        unitId,
        knowledgePoint: kp,
        type: 'single_choice',
        difficulty: ((i % 3) + 1) as 1 | 2 | 3,
        prompt: `將 ${dividend} 顆知識果實平分給 ${divisor} 隻小精靈，每隻分到幾顆？剩下幾顆？`,
        options: shuffleWithSeed(
          [ans, `${q - 1} 餘 ${rem + 1}`, `${q + 1} 餘 ${Math.max(0, rem - 1)}`, `${q} 餘 0`],
          i + dividend
        ),
        answer: ans,
        explanation: `${divisor} × ${q} ＝ ${divisor * q}，${dividend} － ${divisor * q} ＝ ${rem}，所以商是 ${q}、餘數是 ${rem}。`,
        hint: `想想 ${divisor} 的乘法表，哪個最接近 ${dividend} 又不會超過？`,
      });
    }
  } else if (grade === 4) {
    for (let i = 0; i < 6; i++) {
      const len = 6 + ((i + seedOffset) % 9);
      const wid = 4 + ((i * 2 + seedOffset) % 7);
      const isArea = i % 2 === 0;
      const ans = isArea ? len * wid : (len + wid) * 2;
      qs.push({
        id: `gen_${unitId}_rect_${i}`,
        grade,
        semester,
        subject: 'math',
        unitId,
        knowledgePoint: kp,
        type: 'single_choice',
        difficulty: ((i % 4) + 1) as 1 | 2 | 3 | 4,
        prompt: isArea
          ? `數境城堡要建一塊長 ${len} 公尺、寬 ${wid} 公尺的長方形農田，面積是多少平方公尺？`
          : `圍牆包圍長 ${len} 公尺、寬 ${wid} 公尺的長方形營地，圍牆總周長是多少公尺？`,
        options: shuffleWithSeed(
          [String(ans), String(isArea ? (len + wid) * 2 : len * wid), String(ans + 4), String(Math.max(2, ans - 4))],
          i + len * 7
        ),
        answer: String(ans),
        explanation: isArea
          ? `長方形面積＝長 × 寬＝${len} × ${wid} ＝ ${ans} 平方公尺。`
          : `長方形周長＝(長 ＋ 寬) × 2＝(${len} ＋ ${wid}) × 2 ＝ ${ans} 公尺。`,
        hint: isArea ? '面積＝長 × 寬！' : '周長有兩條長、兩條寬，記得 (長＋寬)×2！',
      });
    }
  } else if (grade === 5) {
    const pairs: Array<[number, number]> = [
      [12, 16],
      [15, 20],
      [18, 24],
      [14, 21],
      [8, 12],
      [10, 15],
    ];
    pairs.forEach(([a, b], i) => {
      const g = gcd(a, b);
      const l = (a * b) / g;
      const askGcd = (i + seedOffset) % 2 === 0;
      const ans = askGcd ? g : l;
      qs.push({
        id: `gen_${unitId}_gl_${i}`,
        grade,
        semester,
        subject: 'math',
        unitId,
        knowledgePoint: kp,
        type: 'single_choice',
        difficulty: ((i % 4) + 2) as 2 | 3 | 4 | 5,
        prompt: askGcd
          ? `請找出 ${a} 和 ${b} 的「最大公因數」來啟動數境防禦塔：`
          : `請找出 ${a} 和 ${b} 的「最小公倍數」來同步兩座砲塔的發射週期：`,
        options: shuffleWithSeed(
          [String(ans), String(askGcd ? g * 2 : l / 2), String(ans + 2), String(Math.max(1, ans - 1))],
          a + b + i
        ),
        answer: String(ans),
        explanation: askGcd
          ? `${a} 與 ${b} 共同能整除的最大數為 ${g}。`
          : `${a} 與 ${b} 最小的共同倍數是 ${l}。`,
        hint: askGcd ? '找同時能整除這兩個數的最大數字！' : '把較大數的倍數一個個試試看能不能被另一個數整除！',
      });
    });
  } else {
    // Grade 6: rate / circle / ratio / unknown
    for (let i = 0; i < 6; i++) {
      const speed = 40 + ((i + seedOffset) % 5) * 10;
      const hours = 2 + (i % 4);
      const dist = speed * hours;
      qs.push({
        id: `gen_${unitId}_rate_${i}`,
        grade,
        semester,
        subject: 'math',
        unitId,
        knowledgePoint: kp,
        type: 'single_choice',
        difficulty: ((i % 4) + 2) as 2 | 3 | 4 | 5,
        prompt: `王國飛艇以每小時 ${speed} 公里的速率飛行，${hours} 小時共飛行多少公里？`,
        options: shuffleWithSeed(
          [`${dist} 公里`, `${dist + speed} 公里`, `${Math.round(dist / 2)} 公里`, `${speed + hours} 公里`],
          dist + i
        ),
        answer: `${dist} 公里`,
        explanation: `距離＝速率 × 時間＝${speed} × ${hours} ＝ ${dist} 公里。`,
        hint: '距離＝速率 × 時間喔！',
      });
    }
  }
  return qs;
}

function generateVocabOrConceptPack(
  grade: Grade,
  semester: Semester,
  subject: SubjectId,
  unitId: string,
  kp: string
): Question[] {
  if (subject === 'english') {
    const sets: Array<{ word: string; zh: string; distractors: string[]; sentence: string }> = [
      { word: 'apple', zh: '🍎 蘋果 (apple)', distractors: ['🍌 香蕉 (banana)', '🍊 橘子 (orange)', '🍇 葡萄 (grape)'], sentence: 'I eat an apple every day.' },
      { word: 'library', zh: '📚 圖書館 (library)', distractors: ['🏥 醫院 (hospital)', '🏫 學校 (school)', '🌳 公園 (park)'], sentence: 'Let us read in the library.' },
      { word: 'teacher', zh: '🧑‍🏫 老師 (teacher)', distractors: ['🩺 醫生 (doctor)', '🚒 消防員 (firefighter)', '👮 警察 (police)'], sentence: 'Miss Lin is our English teacher.' },
      { word: 'happy', zh: '😊 開心的 (happy)', distractors: ['😢 難過的 (sad)', '😴 想睡的 (sleepy)', '😠 生氣的 (angry)'], sentence: 'I am very happy today!' },
      { word: 'rabbit', zh: '🐰 兔子 (rabbit)', distractors: ['🐱 貓咪 (cat)', '🐶 小狗 (dog)', '🐢 烏龜 (turtle)'], sentence: 'The white rabbit can jump high.' },
      { word: 'train', zh: '🚆 火車 (train)', distractors: ['🚲 腳踏車 (bike)', '✈️ 飛機 (plane)', '🚢 輪船 (ship)'], sentence: 'We go to Taipei by train.' },
    ];
    return sets.map((item, idx) => ({
      id: `gen_${unitId}_eng_${idx}`,
      grade,
      semester,
      subject: 'english',
      unitId,
      knowledgePoint: kp,
      type: idx % 3 === 0 ? 'listening' : 'single_choice',
      difficulty: ((idx % 3) + 1) as 1 | 2 | 3,
      prompt:
        idx % 3 === 0
          ? `聽力射擊！聽發音並射擊對應 "${item.word}" 的正確目標：`
          : `星際通訊解碼！"${item.word}" 的中文意思是什麼？`,
      speechText: item.word,
      speechLang: 'en-US',
      options: shuffleWithSeed([item.zh, ...item.distractors], idx + grade),
      answer: item.zh,
      explanation: `${item.word} 的意思是「${item.zh}」。例句：${item.sentence}`,
      hint: `點上方喇叭聽聽看 "${item.word}" 的發音！`,
    }));
  }

  if (subject === 'chinese') {
    const idioms = [
      {
        prompt: '比喻「自己騙自己，以為摀住耳朵別人就聽不見」是哪個成語？',
        ans: '掩耳盜鈴',
        opts: ['掩耳盜鈴', '守株待兔', '刻舟求劍', '井底之蛙'],
        exp: '「掩耳盜鈴」指偷鈴鐺時摀住自己耳朵，比喻自欺欺人。',
        el: 'wind' as const,
      },
      {
        prompt: '形容「非常專心致志，一點也不分心」的成語是哪一個？',
        ans: '全神貫注',
        opts: ['全神貫注', '三心二意', '半途而廢', '走馬看花'],
        exp: '「全神貫注」形容全部精神集中於一件事上。',
        el: 'fire' as const,
      },
      {
        prompt: '修辭屬性判斷：「天上的星星一眨一眨地對我們微笑。」屬於哪種修辭？',
        ans: '擬人（風屬性）',
        opts: ['擬人（風屬性）', '譬喻（火屬性）', '誇飾（雷屬性）', '排比（水屬性）'],
        exp: '把星星描寫成會「眨眼微笑」，賦予人類神態，是擬人法。',
        el: 'wind' as const,
      },
      {
        prompt: '修辭屬性判斷：「彎彎的月亮像一艘金色小船漂浮在夜空。」屬於哪種修辭？',
        ans: '譬喻（火屬性）',
        opts: ['譬喻（火屬性）', '擬人（風屬性）', '排比（水屬性）', '設問（金屬性）'],
        exp: '用「像」把月亮比喻為金色小船，屬於明喻（譬喻修辭）。',
        el: 'fire' as const,
      },
      {
        prompt: '病句淨化！選出用字完全正確的詞語：',
        ans: '再接再厲',
        opts: ['再接再厲', '再接再勵', '在接在厲', '再結再厲'],
        exp: '「再接再厲」的「厲」是磨刀石、奮勉之意，不可寫成「勵」。',
        el: 'thunder' as const,
      },
    ];
    return idioms.map((it, idx) => ({
      id: `gen_${unitId}_chi_${idx}`,
      grade,
      semester,
      subject: 'chinese',
      unitId,
      knowledgePoint: kp,
      type: 'single_choice',
      difficulty: ((idx % 3) + 1) as 1 | 2 | 3,
      prompt: it.prompt,
      options: shuffleWithSeed(it.opts, idx + grade * 3),
      answer: it.ans,
      elementTag: it.el,
      explanation: it.exp,
      hint: '仔細看題目中的關鍵形容詞或語境喔！',
    }));
  }

  // Science general curriculum pack
  const sciItems = [
    {
      prompt: '元素料理三態變化！冰塊吸熱融化成液態水，液態水繼續加熱到 100°C 沸騰會變成什麼？',
      ans: '水蒸氣（氣態）',
      opts: ['水蒸氣（氣態）', '霜（固態）', '冰晶（固態）', '乾冰'],
      exp: '水在常壓下 0°C 結冰、100°C 沸騰汽化成為看不見的水蒸氣（氣態）。',
      el: 'water' as const,
    },
    {
      prompt: '磁力實驗！把兩塊磁鐵的 N 極與 N 極靠近時，會發生什麼現象？',
      ans: '互相排斥推開',
      opts: ['互相排斥推開', '緊緊吸在一起', '完全沒有反應', '磁力消失'],
      exp: '磁鐵具有「同極相斥、異極相吸」的特性，N 極遇 N 極會互相推開。',
      el: 'thunder' as const,
    },
    {
      prompt: '廚房物理！使用開瓶器或大剪刀時，只要讓「施力臂大於抗力臂」，槓桿會產生什麼效果？',
      ans: '省力',
      opts: ['省力', '費力', '既不省力也不費力', '無法轉動'],
      exp: '當施力臂 ＞ 抗力臂時為省力槓桿，只需較小的力就能撬動重物。',
      el: 'wind' as const,
    },
    {
      prompt: '食材採集！植物行光合作用製造養分，最主要的器官是哪一個部位？',
      ans: '葉子',
      opts: ['葉子', '根部', '花瓣', '種子'],
      exp: '葉片含有豐富葉綠體，吸收陽光、水與二氧化碳進行光合作用製造養分。',
      el: 'wind' as const,
    },
    {
      prompt: '發酵料理知識！做麵包時加入酵母菌讓麵團膨鬆變大，主要是因為酵母菌產生了哪種氣體？',
      ans: '二氧化碳',
      opts: ['二氧化碳', '氧氣', '氮氣', '氫氣'],
      exp: '酵母菌發酵分解糖分產生二氧化碳氣泡，受熱膨脹讓麵包鬆軟好吃！',
      el: 'fire' as const,
    },
  ];

  return sciItems.map((it, idx) => ({
    id: `gen_${unitId}_sci_${idx}`,
    grade,
    semester,
    subject: 'science',
    unitId,
    knowledgePoint: kp,
    type: 'single_choice',
    difficulty: ((idx % 3) + 1) as 1 | 2 | 3,
    prompt: it.prompt,
    options: shuffleWithSeed(it.opts, idx + semester * 5),
    answer: it.ans,
    elementTag: it.el,
    explanation: it.exp,
    hint: '回想自然課本做過的實驗觀察結果！',
  }));
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = Math.abs(seed) + 13;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Retrieve a rich question pool (>= 8 questions) for any Grade × Semester × Subject × Unit */
export function getQuestionsForUnit(params: {
  grade: Grade;
  semester: Semester;
  subject: SubjectId;
  unitId: string;
}): Question[] {
  const exactUnit = CURATED_QUESTIONS.filter(
    (q) => q.unitId === params.unitId && q.subject === params.subject
  );
  const sameSubject = CURATED_QUESTIONS.filter(
    (q) => q.subject === params.subject && q.unitId !== params.unitId
  );

  const units = getCurriculumUnits(params.grade, params.semester, params.subject);
  const unit = units.find((u) => u.id === params.unitId) ?? units[0];
  const kp = unit?.knowledgePoints[0] ?? '綜合知識';
  const seedOffset = params.grade * 7 + params.semester * 3 + units.findIndex((u) => u.id === unit?.id);

  const generated =
    params.subject === 'math'
      ? generateMathUnitQuestions(params.grade, params.semester, params.unitId, kp, seedOffset)
      : generateVocabOrConceptPack(params.grade, params.semester, params.subject, params.unitId, kp);

  const combined = [...exactUnit, ...generated, ...sameSubject.slice(0, 4)];
  // Deduplicate by id
  const seen = new Set<string>();
  return combined.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

/** Quick 3-question pool for Ultimate Challenge (5s rapid fire) or Cross-Subject battles */
export function getQuickChallengeQuestions(subject: SubjectId, grade: Grade, semester: Semester): Question[] {
  const units = getCurriculumUnits(grade, semester, subject);
  const pool = getQuestionsForUnit({
    grade,
    semester,
    subject,
    unitId: units[0]?.id ?? `${subject}_g${grade}_s${semester}_u1`,
  });
  return pool.filter((q) => q.type === 'single_choice' || q.type === 'true_false');
}

export function getCrossSubjectQuestions(grade: Grade, semester: Semester): Question[] {
  const subjects: SubjectId[] = ['chinese', 'english', 'math', 'science'];
  const all: Question[] = [];
  for (const s of subjects) {
    const units = getCurriculumUnits(grade, semester, s);
    const unitId = units[0]?.id ?? `${s}_g${grade}_s${semester}_u1`;
    all.push(...getQuestionsForUnit({ grade, semester, subject: s, unitId }).slice(0, 3));
  }
  return all;
}
