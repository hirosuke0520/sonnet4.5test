'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from './hooks/useSound';

const WORDS = [
  { japanese: 'すし', romaji: 'sushi' },
  { japanese: 'さしみ', romaji: 'sashimi' },
  { japanese: 'てんぷら', romaji: 'tempura' },
  { japanese: 'らーめん', romaji: 'ra-men' },
  { japanese: 'おにぎり', romaji: 'onigiri' },
  { japanese: 'たこやき', romaji: 'takoyaki' },
  { japanese: 'やきとり', romaji: 'yakitori' },
  { japanese: 'うどん', romaji: 'udon' },
  { japanese: 'そば', romaji: 'soba' },
  { japanese: 'とんかつ', romaji: 'tonkatsu' },
  { japanese: 'みそしる', romaji: 'misoshiru' },
  { japanese: 'ぎょうざ', romaji: 'gyouza' },
  { japanese: 'かつどん', romaji: 'katsudon' },
  { japanese: 'おやこどん', romaji: 'oyakodon' },
  { japanese: 'ちゃわんむし', romaji: 'chawanmushi' },
];

const GAME_TIME = 60; // 60 seconds
const WORD_TIME_LIMIT = 5; // 5 seconds per word

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [errors, setErrors] = useState(0);
  const [wordTimeLeft, setWordTimeLeft] = useState(WORD_TIME_LIMIT);

  const { playCorrect, playError, playGameStart, playGameEnd, playTick, playKeypress } = useSound();

  const getRandomWord = useCallback(() => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }, []);

  const startGame = () => {
    playGameStart();
    setGameState('playing');
    setScore(0);
    setErrors(0);
    setTimeLeft(GAME_TIME);
    setWordTimeLeft(WORD_TIME_LIMIT);
    setInput('');
    setCurrentWord(getRandomWord());
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
      setCurrentWord(getRandomWord());
      setWordTimeLeft(WORD_TIME_LIMIT);
    }
  }, [gameState, wordTimeLeft, errors, playError, getRandomWord]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // タイピング音を鳴らす（正解時を除く）
    if (value.length > input.length && value !== currentWord.romaji) {
      playKeypress();
    }

    setInput(value);

    if (value === currentWord.romaji) {
      playCorrect();
      setScore(score + 1);
      setInput('');
      setCurrentWord(getRandomWord());
      setWordTimeLeft(WORD_TIME_LIMIT);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input !== currentWord.romaji) {
      playError();
      setErrors(errors + 1);
      setInput('');
      setCurrentWord(getRandomWord());
      setWordTimeLeft(WORD_TIME_LIMIT);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">🍣 寿司打</h1>
          <p className="text-xl text-gray-700 mb-8">日本語タイピングゲーム</p>
          <button
            onClick={startGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-2xl px-12 py-4 rounded-full transition-colors shadow-lg"
          >
            スタート
          </button>
          <div className="mt-8 text-gray-600">
            <p>制限時間: {GAME_TIME}秒</p>
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
          <h1 className="text-5xl font-bold text-red-600 mb-8">結果発表</h1>
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div className="mb-6">
              <p className="text-gray-600 text-lg">スコア</p>
              <p className="text-6xl font-bold text-red-500">{score}</p>
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
            <div className="mt-8">
              <p className="text-gray-600">正確率</p>
              <p className="text-3xl font-bold text-blue-500">{accuracy}%</p>
            </div>
          </div>
          <button
            onClick={startGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl px-10 py-3 rounded-full transition-colors shadow-lg"
          >
            もう一度プレイ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="text-2xl font-bold text-gray-700">
            スコア: <span className="text-red-500">{score}</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            残り時間: <span className="text-blue-500">{timeLeft}秒</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">
            ミス: <span className="text-red-400">{errors}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
          {/* 単語ごとの制限時間メーター */}
          <div className="mb-8">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  wordTimeLeft / WORD_TIME_LIMIT > 0.5
                    ? 'bg-green-500'
                    : wordTimeLeft / WORD_TIME_LIMIT > 0.25
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(wordTimeLeft / WORD_TIME_LIMIT) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {wordTimeLeft.toFixed(1)}秒
            </p>
          </div>

          <div className="mb-12">
            <p className="text-8xl font-bold text-red-600 mb-6">{currentWord.japanese}</p>
            <p className="text-3xl font-mono">
              {currentWord.romaji.split('').map((char, index) => {
                let color = 'text-gray-400';
                if (index < input.length) {
                  if (input[index] === char) {
                    color = 'text-blue-500';
                  } else {
                    color = 'text-red-500';
                  }
                }
                return (
                  <span key={index} className={color}>
                    {char}
                  </span>
                );
              })}
            </p>
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
