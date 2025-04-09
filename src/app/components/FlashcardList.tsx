"use client";
import { useState, useEffect, useCallback } from "react";
import Flashcard from "./Flashcard";
import messages from "../data/messages";
import Topics, { ITopics } from "./Topics";
import useLazyCachedData from "../hooks/useCachedData";
import arrayRandomItems from "../helpers/arrayRandomItems";

interface FlashcardData {
  id: number;
  vi: string[];
  en: string[];
  desc?: string;
  type: string;
}

const PER_PAGE_OPTIONS = [5, 10, 15, 20, 25, 50];
const LANGUAGE_MODES = [
  { value: "random", label: "Ngẫu nhiên" },
  { value: "en", label: "Chỉ tiếng Anh" },
  { value: "vi", label: "Chỉ tiếng Việt" },
];

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [totalAnswers, setTotalAnswers] = useState<number>(0);
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>([]);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isViPrompt, setIsViPrompt] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [languageMode, setLanguageMode] = useState<string>("random");
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());

  const { data: topics, getData: getTopics } = useLazyCachedData<ITopics[]>(
    [],
    "topics",
    "/topics/topics.json"
  );

  const getFlashcard = useCallback(
    async (topicUrl: string) => {
      try {
        const response = await fetch(topicUrl);
        const data = await response.json();
        const randomArray = arrayRandomItems(data);
        setFlashcards(randomArray);
        setCurrentPage(1);
        const availableCards = Math.min(perPage, randomArray.length);
        setRemainingIndexes(
          shuffleArray(
            Array.from({ length: availableCards }, (_, index) => index)
          )
        );
        setAnsweredCards(new Set());
        setCurrentCardIndex(0);
        setHasCompleted(false);
        setCorrectAnswers(0);
        setTotalAnswers(0);
        if (languageMode === "en") {
          setIsViPrompt(false);
        } else if (languageMode === "vi") {
          setIsViPrompt(true);
        } else {
          setIsViPrompt(Math.random() < 0.5);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [perPage, languageMode]
  );

  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleNext = useCallback(() => {
    if (remainingIndexes.length > 0) {
      const nextIndex = remainingIndexes[0];
      setCurrentCardIndex(nextIndex);
      setRemainingIndexes(remainingIndexes.slice(1));

      if (languageMode === "en") {
        setIsViPrompt(false);
      } else if (languageMode === "vi") {
        setIsViPrompt(true);
      } else {
        setIsViPrompt(Math.random() < 0.5);
      }
    } else {
      setHasCompleted(true);
    }
  }, [remainingIndexes, languageMode]);

  const handleAnswer = (isCorrect: boolean) => {
    if (!answeredCards.has(currentCardIndex)) {
      setTotalAnswers((prev) => prev + 1);
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }
      setAnsweredCards((prev) => new Set(prev).add(currentCardIndex));
    }
  };

  const handleChangeTopic = (url: string) => {
    getFlashcard(url);
  };

  const handleRetake = () => {
    setHasCompleted(false);
    setRemainingIndexes(
      shuffleArray(Array.from({ length: perPage }, (_, index) => index))
    );
    setAnsweredCards(new Set());
  };

  const handleChangePage = (idx: number) => {
    setCurrentPage(idx);
    setHasCompleted(false);
    const startIndex = (idx - 1) * perPage;
    const remainingCards = Math.max(0, flashcards.length - startIndex);
    const availableCards = Math.min(perPage, remainingCards);

    setRemainingIndexes(
      shuffleArray(Array.from({ length: availableCards }, (_, index) => index))
    );
    setAnsweredCards(new Set());
    setCurrentCardIndex(0);
  };

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(event.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1);
    setHasCompleted(false);
    setRemainingIndexes(
      shuffleArray(Array.from({ length: newPerPage }, (_, index) => index))
    );
    setAnsweredCards(new Set());
  };

  const handleLanguageModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newMode = event.target.value;
    setLanguageMode(newMode);
    if (newMode === "en") {
      setIsViPrompt(false);
    } else if (newMode === "vi") {
      setIsViPrompt(true);
    } else {
      setIsViPrompt(Math.random() < 0.5);
    }
  };

  const getEncouragementMessage = (percentage: number) => {
    if (!percentage || isNaN(percentage))
      return messages[0]?.[0] || "Bắt đầu nào!";

    if (percentage === 100) {
      const perfectMessages = messages[100];
      return perfectMessages[
        Math.floor(Math.random() * perfectMessages.length)
      ];
    }
    const key = (Math.floor(percentage / 10) * 10) as keyof typeof messages;
    const encouragementMessages = messages[key] || messages[10];
    return encouragementMessages[
      Math.floor(Math.random() * encouragementMessages.length)
    ];
  };

  const startIndex = (currentPage - 1) * perPage;
  const cardsOnPage = flashcards.slice(startIndex, startIndex + perPage);
  const currentCard = cardsOnPage[currentCardIndex];

  const percentage =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  useEffect(() => {
    getTopics();
  }, [getTopics]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [handleNext]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-gray-50 p-4 rounded-xl shadow-sm mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Chủ đề
          </label>
          <Topics topics={topics} onChange={handleChangeTopic} />
        </div>

        {flashcards.length > 0 && (
          <>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Số câu hỏi mỗi ải
              </label>
              <select
                id="perPage"
                value={perPage}
                onChange={handlePerPageChange}
                className="w-full sm:w-32 bg-white border border-gray-300 rounded-lg px-3 py-2 
                  text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none"
              >
                {PER_PAGE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="text-gray-800 bg-white hover:bg-gray-100"
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Chế độ thử thách
              </label>
              <select
                id="languageMode"
                value={languageMode}
                onChange={handleLanguageModeChange}
                className="w-full sm:w-40 bg-white border border-gray-300 rounded-lg px-3 py-2 
                  text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none"
              >
                {LANGUAGE_MODES.map((mode) => (
                  <option
                    key={mode.value}
                    value={mode.value}
                    className="text-gray-800 bg-white hover:bg-gray-100"
                  >
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      {flashcards.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-white mb-2">Chọn ải số</div>
          <div className="flex flex-wrap gap-2">
            {Array(Math.ceil(flashcards.length / perPage))
              .fill("")
              .map((_, idx) => (
                <button
                  key={idx}
                  className={`${
                    currentPage === idx + 1
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  } text-sm font-medium px-4 py-2 rounded-full 
                  transition-colors duration-200 focus:outline-none focus:ring-2 
                  focus:ring-indigo-500 focus:ring-offset-2 shadow-sm`}
                  onClick={() => handleChangePage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
          </div>
        </div>
      )}
      <div className="min-h-[400px] flex items-center justify-center relative overflow-hidden">
        {hasCompleted ? (
          <div className="text-center space-y-6 z-10">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600 text-2xl">🎉</span>
              <p className="text-green-700 font-semibold text-lg">
                Chúc mừng! Bạn đã hoàn thành!
              </p>
              <span className="text-green-600 text-2xl">🎉</span>
            </div>
            <div className="bg-white rounded-full px-6 py-3 inline-block shadow-md">
              <h2 className="text-3xl font-bold text-indigo-700">
                {percentage}%
              </h2>
            </div>
            <p className="text-gray-800 text-lg max-w-md mx-auto">
              {getEncouragementMessage(percentage)}
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full 
                transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              onClick={handleRetake}
            >
              Thử lại nào!
            </button>
          </div>
        ) : currentCard ? (
          <div className="w-full max-w-2xl z-10">
            <Flashcard
              isViPrompt={isViPrompt}
              prompt={isViPrompt ? currentCard.vi[0] : currentCard.en[0]}
              answer={isViPrompt ? currentCard.en : currentCard.vi}
              type={currentCard.type}
              desc={currentCard?.desc}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </div>
        ) : (
          <div className="text-center z-10">
            <p className="text-xl text-indigo-700 font-semibold">
              Chọn chủ đề để bắt đầu nhé! ✨
            </p>
            <p className="text-gray-600 mt-2">
              Sẵn sàng để thử thách bản thân chưa#pragma once
            </p>
          </div>
        )}
      </div>
      {flashcards.length > 0 && !hasCompleted && (
        <p className="text-sm text-gray-600 text-center mt-4 italic">
          Dùng "Mũi tên phải" để chuyển thẻ nhé!
        </p>
      )}
    </div>
  );
};

export default FlashcardList;
