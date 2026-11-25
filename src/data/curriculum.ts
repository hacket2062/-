import type { CurriculumUnit, Grade, Semester, SubjectId, TextbookEdition } from '../types/game';

interface UnitSeed {
  title: string;
  subtitle: string;
  kps: string[];
  boss: string;
  cardSummary: string;
  weapon: string;
  nanyiOrder?: number;
  hanlinOrder?: number;
}

const CURRICULUM_TABLE: Record<SubjectId, Record<Grade, Record<Semester, UnitSeed[]>>> = {
  math: {
    3: {
      1: [
        {
          title: '10000 以內的數與加減',
          subtitle: '位值城堡的基石',
          kps: ['10000以內的數', '三位數加減'],
          boss: '缺位魔偶',
          cardSummary: '認識千位、百位、十位、個位與進退位加減驗算。',
          weapon: '千位量尺鎚',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '乘法與公分毫米',
          subtitle: '工坊齒輪與尺規',
          kps: ['乘法', '公分與毫米'],
          boss: '失準齒輪王',
          cardSummary: '1 公分＝10 毫米；直式乘法逐位對齊計算。',
          weapon: '毫米星規劍',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
        {
          title: '角與平面圖形',
          subtitle: '直角城牆守護陣',
          kps: ['角', '平面圖形'],
          boss: '歪斜多邊獸',
          cardSummary: '認識直角、銳角、鈍角，與正方形、長方形邊角特性。',
          weapon: '直角守護盾',
          nanyiOrder: 3,
          hanlinOrder: 3,
        },
      ],
      2: [
        {
          title: '除法（含餘數）與分數初步',
          subtitle: '公平分配糧倉',
          kps: ['除法含餘數', '分數初步'],
          boss: '餘數貪吃怪',
          cardSummary: '餘數一定要比除數小；平分成幾份取幾份即為分數。',
          weapon: '均分天平杖',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '時分秒・容量與重量',
          subtitle: '鐘塔與市場度量衡',
          kps: ['時分秒', '公升毫升', '公斤公克'],
          boss: '混亂沙漏魔',
          cardSummary: '1小時＝60分，1公升＝1000毫升，1公斤＝1000公克。',
          weapon: '時光砝碼鎚',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
        {
          title: '圓與統計表',
          subtitle: '圓規結界與情報表',
          kps: ['圓', '統計表'],
          boss: '破圓偵察機',
          cardSummary: '直徑＝半徑×2；讀懂分類統計表掌握敵軍動向。',
          weapon: '圓心羅盤弓',
          nanyiOrder: 3,
          hanlinOrder: 3,
        },
      ],
    },
    4: {
      1: [
        {
          title: '億兆大數與多位數乘除',
          subtitle: '星辰金庫的運算',
          kps: ['億兆大數', '多位數乘除'],
          boss: '歸零巨龍',
          cardSummary: '四位一撇讀大數（個、萬、億、兆），靈活估算商與積。',
          weapon: '億兆星盤砲',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: '角度與三角形',
          subtitle: '量角器要塞防線',
          kps: ['角度', '三角形'],
          boss: '銳角鋼鐵蟹',
          cardSummary: '平角 180°、周角 360°；依邊與角辨認正三角形與等腰三角形。',
          weapon: '量角光劍',
          nanyiOrder: 3,
          hanlinOrder: 2,
        },
        {
          title: '概數與整數四則',
          subtitle: '四捨五入運算核心',
          kps: ['概數', '整數四則'],
          boss: '亂序算式魔',
          cardSummary: '先算括號，先乘除後加減；掌握四捨五入、無條件進位與捨去。',
          weapon: '四則藍圖杖',
          nanyiOrder: 2,
          hanlinOrder: 3,
        },
      ],
      2: [
        {
          title: '分數與二位小數',
          subtitle: '市場交易精密算',
          kps: ['假分數帶分數', '同分母加減', '二位小數'],
          boss: '碎片小數鬼',
          cardSummary: '假分數與帶分數互換，百分位小數對齊小數點加減。',
          weapon: '分數之刃',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '四邊形・周長與面積',
          subtitle: '農田圍牆建造術',
          kps: ['四邊形', '周長與面積'],
          boss: '拆牆推土魔',
          cardSummary: '長方形面積＝長×寬、周長＝(長＋寬)×2；平行四邊形與梯形辨認。',
          weapon: '丈量黃金鎚',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
        {
          title: '折線圖統計偵察',
          subtitle: '預測零之軍團路線',
          kps: ['折線圖'],
          boss: '迷霧曲線王',
          cardSummary: '折線圖能清楚呈現隨時間變化的趨勢與高低峰。',
          weapon: '趨勢雷達砲',
          nanyiOrder: 3,
          hanlinOrder: 3,
        },
      ],
    },
    5: {
      1: [
        {
          title: '因數與倍數',
          subtitle: '數境城堡第一道防線',
          kps: ['因數與倍數', '公因數公倍數'],
          boss: '零之將軍・除不盡',
          cardSummary: '能整除某數的整數是因數；2、3、5、10 倍數快速判別法。',
          weapon: '質因分解鎚',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '擴分・約分與異分母加減',
          subtitle: '通分能量調配站',
          kps: ['擴分約分通分', '異分母加減'],
          boss: '失衡分數魔',
          cardSummary: '異分母分數加減須先通分成相同分母，最後約成最簡分數。',
          weapon: '分數之刃',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
        {
          title: '多邊形面積與線對稱',
          subtitle: '黃金幾何結界塔',
          kps: ['多邊形面積', '線對稱'],
          boss: '碎鏡對稱王',
          cardSummary: '三角形＝底×高÷2，梯形＝(上底＋下底)×高÷2；對稱軸兩側完全重合。',
          weapon: '黃金比例法杖',
          nanyiOrder: 3,
          hanlinOrder: 3,
        },
      ],
      2: [
        {
          title: '分數乘法與小數乘法',
          subtitle: '產線倍率增幅器',
          kps: ['分數乘法', '小數乘法'],
          boss: '小數點漂移魔',
          cardSummary: '分數相乘分子乘分子、分母乘分母（先約分更快）；小數乘積對齊總小數位。',
          weapon: '倍率齒輪砲',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: '體積與容積・時間計算',
          subtitle: '立體倉庫與鐘樓工程',
          kps: ['體積與容積', '時間計算'],
          boss: '空心立方魔',
          cardSummary: '長方體體積＝長×寬×高；1公升＝1000立方公分。',
          weapon: '立方藍圖鎚',
          nanyiOrder: 3,
          hanlinOrder: 2,
        },
        {
          title: '比率・百分率與統計圖',
          subtitle: '王國經濟折線情報',
          kps: ['比率與百分率', '長條圖折線圖'],
          boss: '打折幻影商',
          cardSummary: '百分率＝部分÷全部×100%，打八折即原價×80%。',
          weapon: '百分精算弓',
          nanyiOrder: 2,
          hanlinOrder: 3,
        },
      ],
    },
    6: {
      1: [
        {
          title: '質數・最大公因數與最小公倍數',
          subtitle: '質數密碼金庫',
          kps: ['質數', '最大公因數與最小公倍數'],
          boss: '合數巨神兵',
          cardSummary: '質數只有 1 和自己兩個因數；短除法求最大公因數與最小公倍數。',
          weapon: '質數爆破鎚',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: '分數除法與小數除法',
          subtitle: '倒數逆轉核心',
          kps: ['分數除法', '小數除法'],
          boss: '倒數漩渦魔',
          cardSummary: '除以分數等於乘上它的倒數；小數除法先將除數化為整數。',
          weapon: '倒數星刃',
          nanyiOrder: 2,
          hanlinOrder: 3,
        },
        {
          title: '比與比值・圓周率與圓面積',
          subtitle: '圓周 π 的聖殿',
          kps: ['比與比值', '圓周率與圓面積'],
          boss: '無限圓周魔',
          cardSummary: '圓周長＝直徑×3.14，圓面積＝半徑×半徑×3.14。',
          weapon: '圓周星環杖',
          nanyiOrder: 3,
          hanlinOrder: 2,
        },
      ],
      2: [
        {
          title: '速率與柱體體積表面積',
          subtitle: '光速飛艇與立體塔',
          kps: ['速率', '柱體體積與表面積'],
          boss: '超速零號機',
          cardSummary: '速率＝距離÷時間；柱體體積＝底面積×柱高。',
          weapon: '光速向量砲',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '縮圖比例尺與正比',
          subtitle: '王國地圖測繪術',
          kps: ['縮圖比例尺', '正比'],
          boss: '失真地圖怪',
          cardSummary: '比例尺＝縮圖長：實際長；面積比為長度比的平方。',
          weapon: '比例尺星劍',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
        {
          title: '未知數與圓形圖',
          subtitle: '代數解鎖終極秘寶',
          kps: ['未知數', '圓形圖'],
          boss: '未知數魔王 X',
          cardSummary: '用等量公理解未知數；圓形圖百分率總和為 100%（360°）。',
          weapon: '未知奧義杖',
          nanyiOrder: 3,
          hanlinOrder: 3,
        },
      ],
    },
  },
  chinese: {
    3: {
      1: [
        {
          title: '部首字形與量詞疊字',
          subtitle: '墨林偏旁迷宮',
          kps: ['常用字形音義', '部首查字', '量詞疊字'],
          boss: '錯字糊塗妖',
          cardSummary: '辨別常用部首意義（如氵與水有關、扌與手有關），正確搭配量詞。',
          weapon: '部首青雲筆',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '譬喻擬人與基本標點',
          subtitle: '詩韻修辭畫廊',
          kps: ['譬喻與擬人', '基本標點'],
          boss: '斷句墨鴉王',
          cardSummary: '譬喻用「像、彷彿」打比方；擬人把事物寫得像人一樣有動作情感。',
          weapon: '修辭金鋒劍',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '簡單成語與因果句',
          subtitle: '成語接龍竹林',
          kps: ['簡單成語', '因果句', '短文找重點'],
          boss: '病句千足蟲',
          cardSummary: '熟悉「因為…所以…」因果關聯詞，從段落中找出主角與關鍵事件。',
          weapon: '成語玉竹弓',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    4: {
      1: [
        {
          title: '形近同音與多音字',
          subtitle: '字音辨識古亭',
          kps: ['形近字與同音字', '多音字'],
          boss: '雙音幻影狐',
          cardSummary: '依詞語意思判斷多音字讀音（如「行」走／銀「行」），避免別字。',
          weapon: '正音古墨劍',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '成語運用・誇飾與排比',
          subtitle: '雷水修辭高閣',
          kps: ['成語運用', '誇飾與排比'],
          boss: '狂瀾病句龍',
          cardSummary: '誇飾放大縮小營造震撼；排比連用三句以上結構相似句子增強氣勢。',
          weapon: '狂草雷紋筆',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '轉折假設句與段落大意',
          subtitle: '記敘文卷軸橋',
          kps: ['引號冒號', '轉折與假設句', '段落大意'],
          boss: '亂序卷軸魔',
          cardSummary: '「雖然…但是…」表轉折、「如果…就…」表假設；摘要段落主旨。',
          weapon: '記敘靈卷杖',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    5: {
      1: [
        {
          title: '一字多義・近反義詞與成語典故',
          subtitle: '翰林墨韻書閣',
          kps: ['一字多義', '近反義詞', '成語典故'],
          boss: '亂碼文妖王',
          cardSummary: '從上下文推敲詞義，了解成語背後歷史故事與近反義詞精準替換。',
          weapon: '典故翰林劍',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '設問映襯・破折刪節號',
          subtitle: '古韻修辭星壇',
          kps: ['設問與映襯', '破折號刪節號'],
          boss: '問號墨蜘蛛',
          cardSummary: '設問自問自答引起注意；映襯用相反特質對比凸顯主題。',
          weapon: '映襯玄墨扇',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '遞進條件句・說明文與主旨',
          subtitle: '萬卷書山主殿',
          kps: ['遞進與條件句', '說明文', '文章主旨'],
          boss: '迷霧斷章魔',
          cardSummary: '「不但…而且…」表遞進、「只要…就…」表條件；抓準說明文核心。',
          weapon: '明心文聖筆',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    6: {
      1: [
        {
          title: '文言淺語與詞語辨析',
          subtitle: '千年竹簡古道',
          kps: ['文言淺語', '詞語辨析', '修辭綜合判斷'],
          boss: '古籍篡改魔',
          cardSummary: '掌握常見文言虛實詞（「之、曰、亦、而」），綜合判別各類修辭。',
          weapon: '太白青蓮劍',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '議論文・古典詩詞與篇章推論',
          subtitle: '文聖雲巔試煉',
          kps: ['議論文', '古典詩詞', '篇章推論'],
          boss: '混沌墨龍皇',
          cardSummary: '辨別議論文的論點、論據與論證，賞析絕句律詩意境並合理推論。',
          weapon: '萬卷文聖璽',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
  },
  english: {
    3: {
      1: [
        {
          title: 'Alphabet, Greetings & Numbers 1-20',
          subtitle: '星港啟航通訊站',
          kps: ['26字母與發音', '問候語', '數字1-20'],
          boss: 'Static Drone Alpha',
          cardSummary: '辨識大小寫字母發音、日常打招呼（Hello / Good morning）與數字 1–20。',
          weapon: 'Alpha Pulse Blaster',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: 'Colors, Animals & Phonics 短母音',
          subtitle: '霓虹星獸實驗室',
          kps: ['顏色與動物', 'Phonics短母音'],
          boss: 'Mute Chimera',
          cardSummary: '認識基本顏色、可愛動物單字，並練習 a/e/i/o/u 短母音拼讀。',
          weapon: 'Phonics Beam Rifle',
          nanyiOrder: 2,
          hanlinOrder: 2,
        },
      ],
      2: [
        {
          title: 'Body Parts & Classroom English',
          subtitle: '機甲整修指揮艙',
          kps: ['身體部位', '教室用語'],
          boss: 'Virus Mechanoid',
          cardSummary: '熟記 head, eyes, hands 等身體部位與 Open your book 等教室指令。',
          weapon: 'Cyber Optic Cannon',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    4: {
      1: [
        {
          title: 'Numbers 1-100, Family & Food',
          subtitle: '銀河補給星艦',
          kps: ['數字1-100', '家人與食物'],
          boss: 'Glitch Harvester',
          cardSummary: '學會十位數表達、家庭成員稱謂與常見餐點單字。',
          weapon: 'Nebula Twin Gun',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: 'Weather, Days & What/Who/How',
          subtitle: '氣象雷達衛星陣',
          kps: ['天氣與星期', 'Phonics子音組合', 'What/Who/How問句'],
          boss: 'Storm Jammer X',
          cardSummary: '分辨 sunny/rainy、星期一至日、sh/ch/th 發音與疑問詞回應。',
          weapon: 'Ion Radar Sniper',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: 'Stationery & Daily Dialogues',
          subtitle: '星際通訊中繼塔',
          kps: ['文具單字', '情境對話'],
          boss: 'Silence Core Mk-II',
          cardSummary: '運用 pencil, ruler, eraser 與 How much / What is this 完成對話破盾。',
          weapon: 'Holo Comms Blade',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    5: {
      1: [
        {
          title: 'Time, Months & Occupations',
          subtitle: '超時空星際航道',
          kps: ['時間與月份', '職業單字'],
          boss: 'Chrono Virus Lord',
          cardSummary: '正確說出幾點幾分、十二個月分以及 doctor, teacher, pilot 等職業。',
          weapon: 'Chrono Nova Cannon',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: 'Present Continuous & Can/Can\'t',
          subtitle: '光速機甲演訓場',
          kps: ['現在進行式', 'can/can\'t', 'Phonics長母音'],
          boss: 'Hyper Jammer',
          cardSummary: 'be + V-ing 表示正在進行的動作；can/can\'t 表能力，長母音 a_e/i_e 規則。',
          weapon: 'Velocity Plasma Saber',
          nanyiOrder: 2,
          hanlinOrder: 2,
        },
      ],
      2: [
        {
          title: 'Places & Transportation',
          subtitle: '銀河交通樞紐站',
          kps: ['地點與交通', '問路句型'],
          boss: 'Orbital Blockade Boss',
          cardSummary: '熟悉 library, park, MRT, bus 與 How do you go to school? 句型。',
          weapon: 'Warp Wing Launcher',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    6: {
      1: [
        {
          title: 'Past Tense & Comparatives',
          subtitle: '記憶星雲檔案庫',
          kps: ['過去式', '比較級'],
          boss: 'Memory Eraser AI',
          cardSummary: '動詞過去式（規則 -ed 與不規則 went/ate/saw）及形容詞比較級 -er / more。',
          weapon: 'Omega Zero Rifle',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: 'Frequency Adverbs & Short Passages',
          subtitle: '銀河核心對話殿堂',
          kps: ['頻率副詞', 'Where/When問句', '短文與對話理解'],
          boss: 'Emperor of Silence',
          cardSummary: 'always / usually / sometimes / never 頻率排列與閱讀理解推理。',
          weapon: 'Galaxy Sovereign Core',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
  },
  science: {
    3: {
      1: [
        {
          title: '植物的身體與溶解魔法',
          subtitle: '香草溫室食材園',
          kps: ['植物的身體', '溶解'],
          boss: '枯萎饕餮獸',
          cardSummary: '辨認根、莖、葉、花、果實、種子；水溫越高、顆粒越細溶解越快。',
          weapon: '百草採集刀',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '磁鐵・空氣與風',
          subtitle: '磁浮料理送餐台',
          kps: ['磁鐵', '空氣與風'],
          boss: '亂風饕餮',
          cardSummary: '磁鐵同極相斥、異極相吸；空氣佔有空間，流動形成風。',
          weapon: '磁力漩渦鍋',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '動物分類・水的三態與光影',
          subtitle: '冰晶甜點魔法吧',
          kps: ['動物身體分類', '水的三態', '光與影子'],
          boss: '融冰黑泥怪',
          cardSummary: '水在 0°C 結冰、100°C 沸騰變水蒸氣；光直線前進遇物體形成影子。',
          weapon: '三態雪花匙',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    4: {
      1: [
        {
          title: '月亮變化與水生生物',
          subtitle: '月光海鮮料理灣',
          kps: ['月亮的變化', '水生生物'],
          boss: '潮汐暗影章',
          cardSummary: '農曆初一朔、十五望（滿月）；漂浮、沉水、挺水、浮葉四類水生植物。',
          weapon: '月潮冰晶刀',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
        {
          title: '簡單電路與溫度熱現象',
          subtitle: '電能烈焰料理爐',
          kps: ['簡單電路', '溫度與熱'],
          boss: '短路焦炭怪',
          cardSummary: '形成通路燈泡才會亮，導體能導電；物體受熱體積膨脹、遇冷收縮。',
          weapon: '電光主廚鍋',
          nanyiOrder: 2,
          hanlinOrder: 2,
        },
      ],
      2: [
        {
          title: '昆蟲・水的移動與太陽方位',
          subtitle: '毛細現象花蜜廚坊',
          kps: ['昆蟲特徵', '水的移動', '太陽與方位'],
          boss: '迷霧甲蟲王',
          cardSummary: '昆蟲有頭胸腹三部分與六隻腳；毛細現象讓水沿細縫上升，連通管水面等高。',
          weapon: '太陽羅盤平底鍋',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    5: {
      1: [
        {
          title: '水溶液的酸鹼與紫甘藍變色',
          subtitle: '七彩調味鍊金廚房',
          kps: ['水溶液酸鹼', '紫甘藍汁變色'],
          boss: '酸鹼混亂饕餮',
          cardSummary: '紫甘藍汁遇酸偏紅、中性紫、遇鹼偏藍綠；石蕊試紙藍變紅為酸性。',
          weapon: '七彩酸鹼調味瓶',
          nanyiOrder: 1,
          hanlinOrder: 2,
        },
        {
          title: '太陽四季・植物繁殖與光的折射',
          subtitle: '彩虹蔬果空中花園',
          kps: ['太陽與四季', '植物繁殖', '光的折射'],
          boss: '折光幻影蟹',
          cardSummary: '光斜射入水中發生折射使筷子看起來彎曲；種子靠風力、水力、動物或自力傳播。',
          weapon: '稜鏡彩虹主廚刀',
          nanyiOrder: 2,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '空氣燃燒・力與運動・聲音',
          subtitle: '烈火快炒節奏殿堂',
          kps: ['空氣與燃燒', '力與運動', '聲音'],
          boss: '悶燒黑煙魔',
          cardSummary: '燃燒三要素：可燃物、助燃物（氧氣）、達燃點；聲音靠物體振動與介質傳播。',
          weapon: '烈焰節奏炒鍋',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
    6: {
      1: [
        {
          title: '熱的傳播・天氣變化與地表岩石',
          subtitle: '火山地熱料理聖殿',
          kps: ['熱的傳播', '天氣變化', '岩石與地表變化'],
          boss: '熔岩饕餮王',
          cardSummary: '熱透過傳導、對流、輻射傳遞；水流侵蝕、搬運、堆積改變地表。',
          weapon: '熱對流火龍鍋',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
      2: [
        {
          title: '電磁作用・簡單機械與微生物發酵',
          subtitle: '星級發酵機械廚房',
          kps: ['電磁作用', '簡單機械', '微生物與食品保存'],
          boss: '終極黑暗饕餮',
          cardSummary: '施力臂大於抗力臂的槓桿可省力；控制溫度與水分可延長食品保存。',
          weapon: '黃金槓桿廚神刀',
          nanyiOrder: 1,
          hanlinOrder: 1,
        },
      ],
    },
  },
};

export function getCurriculumUnits(
  grade: Grade,
  semester: Semester,
  subject: SubjectId,
  edition: TextbookEdition = 'kanghsuan'
): CurriculumUnit[] {
  const seeds = CURRICULUM_TABLE[subject][grade][semester];
  const units: CurriculumUnit[] = seeds.map((seed, idx) => {
    const id = `${subject}_g${grade}_s${semester}_u${idx + 1}`;
    return {
      id,
      grade,
      semester,
      subject,
      title: seed.title,
      subtitle: seed.subtitle,
      knowledgePoints: seed.kps,
      bossName: seed.boss,
      bossTitle: `${seed.title} 守關首領`,
      knowledgeCardTitle: `${seed.title}・重點知識卡`,
      knowledgeCardSummary: seed.cardSummary,
      knowledgeWeaponName: seed.weapon,
      comicPanels: [
        { speaker: '守護精靈', line: `前方就是「${seed.title}」區域，迷霧能量正在干擾知識結晶！` },
        { speaker: seed.boss, line: `哼哼，想通過${seed.subtitle}？先接下我的知識考驗再說！` },
        { speaker: '智光守護者', line: `沒問題！只要看清題目、穩穩作答，就能發揮智光之力淨化這裡！` },
      ],
      editionOrder: {
        kanghsuan: idx + 1,
        nanyi: seed.nanyiOrder ?? idx + 1,
        hanlin: seed.hanlinOrder ?? idx + 1,
      },
    };
  });

  return units.sort((a, b) => a.editionOrder[edition] - b.editionOrder[edition]);
}

export function getAllCurriculumUnits(edition: TextbookEdition = 'kanghsuan'): CurriculumUnit[] {
  const result: CurriculumUnit[] = [];
  const subjects: SubjectId[] = ['chinese', 'english', 'math', 'science'];
  const grades: Grade[] = [3, 4, 5, 6];
  const semesters: Semester[] = [1, 2];
  for (const subject of subjects) {
    for (const grade of grades) {
      for (const semester of semesters) {
        result.push(...getCurriculumUnits(grade, semester, subject, edition));
      }
    }
  }
  return result;
}

export const EDITION_LABELS: Record<TextbookEdition, string> = {
  kanghsuan: '康軒版',
  nanyi: '南一版',
  hanlin: '翰林版',
};

export const STAGE_STRUCTURE = [
  { num: 1, label: '第 1 關', tag: '基礎概念', isBoss: false, isElite: false, enemyScale: 1.0 },
  { num: 2, label: '第 2 關', tag: '基礎概念', isBoss: false, isElite: false, enemyScale: 1.08 },
  { num: 3, label: '第 3 關', tag: '基礎概念', isBoss: false, isElite: false, enemyScale: 1.15 },
  { num: 4, label: '第 4 關', tag: '進階應用', isBoss: false, isElite: false, enemyScale: 1.25 },
  { num: 5, label: '第 5 關', tag: '進階應用', isBoss: false, isElite: false, enemyScale: 1.35 },
  { num: 6, label: '第 6 關', tag: '進階應用', isBoss: false, isElite: false, enemyScale: 1.45 },
  { num: 7, label: '第 7 關', tag: '精英關', isBoss: false, isElite: true, enemyScale: 1.65 },
  { num: 8, label: '第 8 關', tag: '綜合題', isBoss: false, isElite: false, enemyScale: 1.75 },
  { num: 9, label: '第 9 關', tag: '綜合題', isBoss: false, isElite: false, enemyScale: 1.85 },
  { num: 10, label: '第 10 關', tag: '單元 Boss', isBoss: true, isElite: true, enemyScale: 2.3 },
] as const;
