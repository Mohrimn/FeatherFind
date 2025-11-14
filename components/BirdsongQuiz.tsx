import React, { useState, useEffect } from 'react';
import type { QuizStats } from '../types';
import { quizData } from '../data/quizData';

export const BirdsongQuiz: React.FC = () => {
  const [stats, setStats] = useState<QuizStats>({ score: 0, streak: 0, questionsAnswered: 0, correctAnswers: 0 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [shuffledQuizData, setShuffledQuizData] = useState(() => [...quizData].sort(() => Math.random() - 0.5));

  // Load stats from localStorage
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem('birdsongQuizStats');
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error("Failed to parse stats from localStorage", e);
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('birdsongQuizStats', JSON.stringify(stats));
  }, [stats]);

  const handleQuizAnswer = (answer: string) => {
    const isCorrect = answer === shuffledQuizData[currentQuestionIndex].correctAnswer;
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? "Correct!" : `Nice try! The correct answer was ${shuffledQuizData[currentQuestionIndex].correctAnswer}.`
    });

    setStats(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 10 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));

    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestionIndex(prev => (prev + 1) % shuffledQuizData.length);
      if(currentQuestionIndex === shuffledQuizData.length - 1){
          setShuffledQuizData([...quizData].sort(() => Math.random() - 0.5));
          setCurrentQuestionIndex(0);
      }
    }, 2000);
  };

  const accuracy = stats.questionsAnswered > 0 ? ((stats.correctAnswers / stats.questionsAnswered) * 100).toFixed(0) : 0;
  const currentQuizItem = shuffledQuizData[currentQuestionIndex];

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Birdsong Quiz
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Test your knowledge and train your ear to identify different bird calls.
            </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6 animate-fade-in">
            <div className="text-center">
                <h3 className="text-2xl font-bold">Your Progress</h3>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Score</p><p className="text-xl font-bold">{stats.score}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Streak</p><p className="text-xl font-bold">{stats.streak} 🔥</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p><p className="text-xl font-bold">{accuracy}%</p></div>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-300">Listen to the sound and guess the bird!</p>
                <audio key={currentQuizItem.id} controls src={currentQuizItem.audioSrc} className="w-full">Your browser does not support the audio element.</audio>
                <div className="grid grid-cols-2 gap-3">
                    {currentQuizItem.options.map(opt => (
                        <button key={opt} onClick={() => handleQuizAnswer(opt)} disabled={!!feedback} className="p-3 text-left bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors disabled:opacity-70">{opt}</button>
                    ))}
                </div>
                {feedback && (
                    <div className={`p-3 rounded-lg text-center font-semibold ${feedback.correct ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
