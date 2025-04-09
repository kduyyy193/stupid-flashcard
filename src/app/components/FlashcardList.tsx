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

  const getFlashcard = useCallback(async (topicUrl: string) => {
    try {
      const response = await fetch(topicUrl);
      const data = await response.json();
      const randomArray = arrayRandomItems(data);
      setFlashcards(randomArray);
      setCurrentPage(1);
      const availableCards = Math.min(perPage, randomArray.length);
      setRemainingIndexes(
        shuffleArray(Array.from({ length: availableCards }, (_, index) => index))
      );
      setAnsweredCards(new Set());
    } catch (error) {
      console.log(error);
    }
  }, [perPage]);

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
    setCorrectAnswers(0);
    setTotalAnswers(0);
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

  const handleLanguageModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageMode(event.target.value);
    setHasCompleted(false);
    setRemainingIndexes(
      shuffleArray(Array.from({ length: perPage }, (_, index) => index))
    );
  };

  const getEncouragementMessage = (percentage: number) => {
    if (!percentage || isNaN(percentage)) return messages[0]?.[0] || "Bắt đầu nào!";
    
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

  const percentage = totalAnswers > 0 
    ? Math.round((correctAnswers / totalAnswers) * 100) 
    : 0;

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
    <div className="space-y-6 w-full">
      <Topics topics={topics} onChange={handleChangeTopic} />

      {flashcards.length > 0 && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="perPage" className="mb-2 block text-gray-700">
              Số câu hỏi mỗi ải:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={handlePerPageChange}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 
                text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                appearance-none"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option 
                  key={option} 
                  value={option}
                  className="text-gray-700 bg-white hover:bg-gray-100"
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="languageMode" className="mb-2 block text-gray-700">
              Chế độ thử thách:
            </label>
            <select
              id="languageMode"
              value={languageMode}
              onChange={handleLanguageModeChange}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 
                text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                appearance-none"
            >
              {LANGUAGE_MODES.map((mode) => (
                <option 
                  key={mode.value} 
                  value={mode.value}
                  className="text-gray-700 bg-white hover:bg-gray-100"
                >
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-gray-700">Chọn ải số bên dưới</div>
          <div className="flex flex-wrap gap-4">
            {Array(Math.ceil(flashcards.length / perPage))
              .fill("")
              .map((_, idx) => (
                <div
                  key={idx}
                  className={`${
                    currentPage === idx + 1 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "bg-gray-400 hover:bg-gray-500"
                  } text-white px-4 py-2 rounded-lg cursor-pointer transition-colors`}
                  onClick={() => handleChangePage(idx + 1)}
                >
                  <span>{idx + 1}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {hasCompleted ? (
        <div className="text-center">
          <p className="text-green-500">
            Chúc mừng! Hoàn thành hơn hoàn hảo he  😏!
          </p>
          <h2 className="text-lg font-semibold mt-4">
            Kết quả: {percentage}%
          </h2>
          <p className="mt-4">
            {getEncouragementMessage(percentage)}
          </p>
          <button
            className="mt-8 bg-white text-black px-4 py-2 rounded-lg"
            onClick={handleRetake}
          >
            Thử lại má
          </button>
        </div>
      ) : currentCard ? (
        <Flashcard
          isViPrompt={isViPrompt}
          prompt={isViPrompt ? currentCard.vi[0] : currentCard.en[0]}
          answer={isViPrompt ? currentCard.en : currentCard.vi}
          type={currentCard.type}
          desc={currentCard?.desc}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      ) : (
        <p className="text-lg">
          {" "}
          Chọn đi để tôi xem xem bạn chọn gì  😏 😏
        </p>
      )}
      {flashcards.length > 0 && !hasCompleted && (
        <p className="text-sm text-gray-500 sm:block hidden">{`Ấn "Mũi tên phải" để qua thẻ tiếp theo đi :v`}</p>
      )}
    </div>
  );
};

export default FlashcardList;