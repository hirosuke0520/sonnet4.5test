'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from './hooks/useSound';

const EASY_WORDS = [
  { japanese: 'すし', romaji: 'sushi' },
  { japanese: 'うどん', romaji: 'udon' },
  { japanese: 'そば', romaji: 'soba' },
  { japanese: 'さけ', romaji: 'sake' },
  { japanese: 'みず', romaji: 'mizu' },
  { japanese: 'いぬ', romaji: 'inu' },
  { japanese: 'ねこ', romaji: 'neko' },
  { japanese: 'とり', romaji: 'tori' },
  { japanese: 'かに', romaji: 'kani' },
  { japanese: 'たこ', romaji: 'tako' },
  { japanese: 'さる', romaji: 'saru' },
  { japanese: 'くま', romaji: 'kuma' },
  { japanese: 'はし', romaji: 'hashi' },
  { japanese: 'ふね', romaji: 'fune' },
  { japanese: 'ほし', romaji: 'hoshi' },
  { japanese: 'かぜ', romaji: 'kaze' },
  { japanese: 'あめ', romaji: 'ame' },
  { japanese: 'ゆき', romaji: 'yuki' },
  { japanese: 'くも', romaji: 'kumo' },
  { japanese: 'にじ', romaji: 'niji' },
];

const NORMAL_WORDS = [
  { japanese: 'さしみ', romaji: 'sashimi' },
  { japanese: 'てんぷら', romaji: 'tempura' },
  { japanese: 'らーめん', romaji: 'ra-men' },
  { japanese: 'おにぎり', romaji: 'onigiri' },
  { japanese: 'たこやき', romaji: 'takoyaki' },
  { japanese: 'やきとり', romaji: 'yakitori' },
  { japanese: 'とんかつ', romaji: 'tonkatsu' },
  { japanese: 'みそしる', romaji: 'misoshiru' },
  { japanese: 'ぎょうざ', romaji: 'gyouza' },
  { japanese: 'かつどん', romaji: 'katsudon' },
  { japanese: 'にくじゃが', romaji: 'nikujaga' },
  { japanese: 'はんばーぐ', romaji: 'hanba-gu' },
  { japanese: 'かれーらいす', romaji: 'kare-raisu' },
  { japanese: 'おむらいす', romaji: 'omuraisu' },
  { japanese: 'すぱげってぃ', romaji: 'supagetti' },
  { japanese: 'ぴざ', romaji: 'piza' },
  { japanese: 'さらだ', romaji: 'sarada' },
  { japanese: 'すーぷ', romaji: 'su-pu' },
  { japanese: 'ぱん', romaji: 'pan' },
  { japanese: 'けーき', romaji: 'ke-ki' },
];

const HARD_WORDS = [
  { japanese: 'おやこどん', romaji: 'oyakodon' },
  { japanese: 'ちゃわんむし', romaji: 'chawanmushi' },
  { japanese: 'しゃぶしゃぶ', romaji: 'shabushabu' },
  { japanese: 'すきやき', romaji: 'sukiyaki' },
  { japanese: 'おこのみやき', romaji: 'okonomiyaki' },
  { japanese: 'もんじゃやき', romaji: 'monjayaki' },
  { japanese: 'やきそば', romaji: 'yakisoba' },
  { japanese: 'ちゃーはん', romaji: 'cha-han' },
  { japanese: 'てりやき', romaji: 'teriyaki' },
  { japanese: 'からあげ', romaji: 'karaage' },
  { japanese: 'えびふらい', romaji: 'ebifurai' },
  { japanese: 'はんばーがー', romaji: 'hanba-ga-' },
  { japanese: 'すてーき', romaji: 'sute-ki' },
  { japanese: 'おーぶんとーすと', romaji: 'o-bunto-suto' },
  { japanese: 'ふれんちとーすと', romaji: 'furenchito-suto' },
  { japanese: 'ぱんけーき', romaji: 'panke-ki' },
  { japanese: 'どーなつ', romaji: 'do-natsu' },
  { japanese: 'ちょこれーと', romaji: 'chokore-to' },
  { japanese: 'あいすくりーむ', romaji: 'aisukuri-mu' },
  { japanese: 'ぷりん', romaji: 'purin' },
];

type Difficulty = 'easy' | 'normal' | 'hard';

const DIFFICULTY_CONFIG = {
  easy: { timeLimit: 8, gameTime: 60 },
  normal: { timeLimit: 5, gameTime: 60 },
  hard: { timeLimit: 3, gameTime: 60 },
};

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [currentWord, setCurrentWord] = useState(NORMAL_WORDS[0]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [errors, setErrors] = useState(0);
  const [wordTimeLeft, setWordTimeLeft] = useState(5);
  const [remainingWords, setRemainingWords] = useState<typeof EASY_WORDS>([]);
  const [totalWords, setTotalWords] = useState(20);
  const [perfectClear, setPerfectClear] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bonusScore, setBonusScore] = useState(0);
  const [showComboBreak, setShowComboBreak] = useState(false);

  const { playCorrect, playError, playGameStart, playGameEnd, playTick, playKeypress, playMissType } = useSound();

  // ローマ字入力の揺らぎを正規化する関数
  const normalizeRomaji = useCallback((text: string): string => {
    return text
      .replace(/shi/g, 'si')
      .replace(/chi/g, 'ti')
      .replace(/tsu/g, 'tu')
      .replace(/fu/g, 'hu')
      .replace(/ja/g, 'zya')
      .replace(/ju/g, 'zyu')
      .replace(/jo/g, 'zyo')
      .replace(/sha/g, 'sya')
      .replace(/shu/g, 'syu')
      .replace(/sho/g, 'syo')
      .replace(/cha/g, 'tya')
      .replace(/chu/g, 'tyu')
      .replace(/cho/g, 'tyo');
  }, []);

  // 入力が正解と一致するかチェック（正規化して比較）
  const isInputCorrect = useCallback((input: string, answer: string): boolean => {
    return normalizeRomaji(input) === normalizeRomaji(answer);
  }, [normalizeRomaji]);

  // 入力が正解の途中まで合っているかチェック
  const isInputOnTrack = useCallback((input: string, answer: string): boolean => {
    const normalizedInput = normalizeRomaji(input);
    const normalizedAnswer = normalizeRomaji(answer);
    return normalizedAnswer.startsWith(normalizedInput);
  }, [normalizeRomaji]);

  const getWordList = useCallback((diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return EASY_WORDS;
      case 'normal':
        return NORMAL_WORDS;
      case 'hard':
        return HARD_WORDS;
    }
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // コンボボーナスの計算
  const calculateComboBonus = useCallback((currentCombo: number): number => {
    if (currentCombo < 3) return 0;
    if (currentCombo < 5) return 1;
    if (currentCombo < 10) return 2;
    if (currentCombo < 20) return 3;
    return 5;
  }, []);

  const getNextWord = useCallback(() => {
    if (remainingWords.length > 0) {
      const nextWord = remainingWords[0];
      setCurrentWord(nextWord);
      setRemainingWords(remainingWords.slice(1));
      return true;
    }
    return false;
  }, [remainingWords]);

  const startGame = (selectedDifficulty: Difficulty) => {
    playGameStart();
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setScore(0);
    setErrors(0);
    setPerfectClear(false);
    setCombo(0);
    setMaxCombo(0);
    setBonusScore(0);
    setShowComboBreak(false);
    const config = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(config.gameTime);
    setWordTimeLeft(config.timeLimit);
    setInput('');

    // シャッフルした単語リストを準備
    const words = getWordList(selectedDifficulty);
    const shuffled = shuffleArray(words);
    setTotalWords(shuffled.length);
    setCurrentWord(shuffled[0]);
    setRemainingWords(shuffled.slice(1));
  };

  // 全体の時間管理
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 10) {
          playTick();
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      playGameEnd();
      setGameState('result');
    }
  }, [gameState, timeLeft, playTick, playGameEnd]);

  // 単語ごとの時間管理
  useEffect(() => {
    if (gameState === 'playing' && wordTimeLeft > 0) {
      const timer = setInterval(() => {
        setWordTimeLeft((prev) => {
          if (prev <= 0.01) {
            return 0;
          }
          return prev - 0.01;
        });
      }, 10);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && wordTimeLeft <= 0) {
      // 時間切れ - ミスとして次の単語へ
      playError();
      setErrors(errors + 1);
      setInput('');
      // コンボリセット
      if (combo > 0) {
        setShowComboBreak(true);
        setTimeout(() => setShowComboBreak(false), 1000);
      }
      setCombo(0);
      const hasNext = getNextWord();
      if (!hasNext) {
        // 全問終了
        playGameEnd();
        setGameState('result');
      } else {
        setWordTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit);
      }
    }
  }, [gameState, wordTimeLeft, errors, combo, playError, getNextWord, difficulty, playGameEnd]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 入力が増えた場合のみ音を鳴らす
    if (value.length > input.length) {
      const isOnTrack = isInputOnTrack(value, currentWord.romaji);

      if (!isOnTrack) {
        // 正解ルートから外れている場合は常にミスタイプ音
        playMissType();
      } else if (!isInputCorrect(value, currentWord.romaji)) {
        // 正解ルート上の通常タイピング音
        playKeypress();
      }
    }

    setInput(value);

    if (isInputCorrect(value, currentWord.romaji)) {
      playCorrect();
      setScore(score + 1);

      // コンボ加算
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }

      // ボーナスポイント計算
      const bonus = calculateComboBonus(newCombo);
      if (bonus > 0) {
        setBonusScore(bonusScore + bonus);
      }

      setInput('');
      const hasNext = getNextWord();
      if (!hasNext) {
        // 全問クリア！
        setPerfectClear(true);
        playGameEnd();
        setGameState('result');
      } else {
        setWordTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isInputCorrect(input, currentWord.romaji)) {
      playError();
      setErrors(errors + 1);
      setInput('');
      // コンボリセット
      if (combo > 0) {
        setShowComboBreak(true);
        setTimeout(() => setShowComboBreak(false), 1000);
      }
      setCombo(0);
      const hasNext = getNextWord();
      if (!hasNext) {
        // 全問終了
        playGameEnd();
        setGameState('result');
      } else {
        setWordTimeLeft(DIFFICULTY_CONFIG[difficulty].timeLimit);
      }
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-6xl font-bold text-red-600 mb-4">🍣 寿司打</h1>
          <p className="text-xl text-gray-700 mb-12">日本語タイピングゲーム</p>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">難易度を選択</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Easy */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-green-600 mb-2">イージー</h3>
                  <p className="text-gray-600 text-sm">短い単語 (3-4文字)</p>
                </div>
                <div className="mb-6 text-left text-gray-700">
                  <p className="mb-1">⏱️ 制限時間: 60秒</p>
                  <p className="mb-1">⚡ 1問: 8秒</p>
                  <p className="text-xs text-gray-500 mt-2">例: すし、ねこ、みず</p>
                </div>
                <button
                  onClick={() => startGame('easy')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-full transition-colors shadow-lg"
                >
                  スタート
                </button>
              </div>

              {/* Normal */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-4 border-orange-300">
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-orange-600 mb-2">ノーマル</h3>
                  <p className="text-gray-600 text-sm">中程度の単語 (5-8文字)</p>
                </div>
                <div className="mb-6 text-left text-gray-700">
                  <p className="mb-1">⏱️ 制限時間: 60秒</p>
                  <p className="mb-1">⚡ 1問: 5秒</p>
                  <p className="text-xs text-gray-500 mt-2">例: てんぷら、おにぎり</p>
                </div>
                <button
                  onClick={() => startGame('normal')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-full transition-colors shadow-lg"
                >
                  スタート
                </button>
              </div>

              {/* Hard */}
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-red-600 mb-2">ハード</h3>
                  <p className="text-gray-600 text-sm">長い単語 (9-12文字)</p>
                </div>
                <div className="mb-6 text-left text-gray-700">
                  <p className="mb-1">⏱️ 制限時間: 60秒</p>
                  <p className="mb-1">⚡ 1問: 3秒</p>
                  <p className="text-xs text-gray-500 mt-2">例: おこのみやき、しゃぶしゃぶ</p>
                </div>
                <button
                  onClick={() => startGame('hard')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xl py-4 rounded-full transition-colors shadow-lg"
                >
                  スタート
                </button>
              </div>
            </div>
          </div>

          <div className="text-gray-600">
            <p className="mt-2">表示される日本語をローマ字で入力してください</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const accuracy = score + errors > 0 ? Math.round((score / (score + errors)) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          {perfectClear && (
            <div className="mb-6 animate-bounce">
              <p className="text-7xl">🎉</p>
              <p className="text-4xl font-bold text-yellow-500 mt-4">完全クリア！</p>
            </div>
          )}
          <h1 className="text-5xl font-bold text-red-600 mb-8">結果発表</h1>
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div className="mb-6">
              <p className="text-gray-600 text-lg">スコア</p>
              <p className="text-6xl font-bold text-red-500">{score}/{totalWords}</p>
              {bonusScore > 0 && (
                <p className="text-2xl font-bold text-purple-500 mt-2">+{bonusScore} ボーナス</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-gray-600">正解</p>
                <p className="text-3xl font-bold text-green-500">{score}</p>
              </div>
              <div>
                <p className="text-gray-600">ミス</p>
                <p className="text-3xl font-bold text-red-400">{errors}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-gray-600">正確率</p>
                <p className="text-3xl font-bold text-blue-500">{accuracy}%</p>
              </div>
              <div>
                <p className="text-gray-600">最大コンボ</p>
                <p className="text-3xl font-bold text-purple-500">{maxCombo}</p>
              </div>
            </div>
            {perfectClear && (
              <div className="mt-8 p-4 bg-yellow-100 rounded-2xl">
                <p className="text-lg font-bold text-yellow-700">
                  全{totalWords}問を制限時間内にクリア！
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame(difficulty)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-10 py-3 rounded-full transition-colors shadow-lg"
            >
              もう一度
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl px-10 py-3 rounded-full transition-colors shadow-lg"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
      combo >= 20 ? 'bg-gradient-to-b from-yellow-100 to-orange-200' :
      combo >= 10 ? 'bg-gradient-to-b from-purple-100 to-pink-100' :
      combo >= 5 ? 'bg-gradient-to-b from-blue-100 to-indigo-100' :
      'bg-gradient-to-b from-red-50 to-orange-50'
    }`}>
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-2xl font-bold text-gray-700">
            残り: <span className="text-purple-600">{totalWords - score}問</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            スコア: <span className="text-red-500">{score}/{totalWords}</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            コンボ: <span className={`${combo >= 10 ? 'text-yellow-500 animate-pulse' : combo >= 5 ? 'text-purple-500' : 'text-blue-500'}`}>{combo}</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            時間: <span className="text-blue-500">{timeLeft}秒</span>
          </div>
        </div>

        <div className={`bg-white rounded-3xl shadow-2xl p-16 text-center relative transition-all duration-300 ${
          combo >= 20 ? 'ring-8 ring-yellow-400 shadow-yellow-500/50' :
          combo >= 10 ? 'ring-4 ring-purple-400 shadow-purple-500/50' :
          combo >= 5 ? 'ring-2 ring-blue-400' : ''
        }`}>
          {/* コンボブレイクアニメーション */}
          {showComboBreak && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50 rounded-3xl animate-pulse">
              <p className="text-6xl font-bold text-red-500">COMBO BREAK!</p>
            </div>
          )}

          {/* コンボボーナス表示 */}
          {combo >= 3 && (
            <div className="mb-4">
              <p className="text-2xl font-bold text-purple-600 animate-bounce">
                {combo}連続! +{calculateComboBonus(combo)}ボーナス
              </p>
            </div>
          )}

          {/* 単語ごとの制限時間メーター */}
          <div className="mb-8">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  wordTimeLeft / DIFFICULTY_CONFIG[difficulty].timeLimit > 0.5
                    ? 'bg-green-500'
                    : wordTimeLeft / DIFFICULTY_CONFIG[difficulty].timeLimit > 0.25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(wordTimeLeft / DIFFICULTY_CONFIG[difficulty].timeLimit) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {wordTimeLeft.toFixed(1)}秒
            </p>
          </div>

          <div className="mb-12">
            <p className="text-8xl font-bold text-red-600 mb-6">{currentWord.japanese}</p>
            <div className="text-3xl font-mono">
              {input.length === 0 ? (
                <p className="text-gray-400">{currentWord.romaji}</p>
              ) : isInputOnTrack(input, currentWord.romaji) ? (
                <p className="text-blue-500">{currentWord.romaji}</p>
              ) : (
                <p className="text-red-500">{currentWord.romaji}</p>
              )}
            </div>
          </div>

          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-4xl text-center border-b-4 border-red-300 focus:border-red-500 outline-none py-4 transition-colors"
            placeholder="ここに入力..."
          />
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>正しく入力すると自動的に次の単語に進みます</p>
          <p className="mt-2">間違えた場合はEnterキーでスキップできます</p>
        </div>
      </div>
    </div>
  );
}
