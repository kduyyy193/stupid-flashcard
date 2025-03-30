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

const PER_PAGE = 20;

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [totalAnswers, setTotalAnswers] = useState<number>(0);
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>([]);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isViPrompt, setIsViPrompt] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);

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
      setRemainingIndexes(
        shuffleArray(Array.from({ length: 20 }, (_, index) => index))
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

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
      setIsViPrompt(Math.random() < 0.5);
    } else {
      setHasCompleted(true);
    }
  }, [remainingIndexes]);

  const handleAnswer = (isCorrect: boolean) => {
    setTotalAnswers((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleChangeTopic = (url: string) => {
    getFlashcard(url);
  };

  const handleRetake = () => {
    setHasCompleted(false);
    setRemainingIndexes(
      shuffleArray(Array.from({ length: 20 }, (_, index) => index))
    );
  };

  const handleChangePage = (idx: number) => {
    setCurrentPage(idx);
    setHasCompleted(false);
    setRemainingIndexes(
      shuffleArray(Array.from({ length: 20 }, (_, index) => index))
    );
  };

  const getEncouragementMessage = (percentage: number) => {
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

  const currentCard = flashcards?.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )[currentCardIndex];

  // Init data
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
        <div className="mt-4">
          <div className="mb-2">Chọn ải số bên dưới</div>
          <div className="flex flex-wrap gap-4">
            {Array(Math.round(flashcards.length / PER_PAGE))
              .fill("")
              .map((_, idx) => (
                <div
                  key={idx}
                  className={`${
                    currentPage === idx + 1 ? "bg-blue-400" : "bg-gray-400"
                  } text-white px-4 py-2 rounded-lg cursor-pointer`}
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
            Chúc mừng! Bạn đã chọc thủng hết đống thẻ nhớ rồi đấy!
          </p>
          <h2 className="text-lg font-semibold mt-4">
            Kết quả: {Math.round((correctAnswers / totalAnswers) * 100)}%
          </h2>
          <p className="mt-4">
            {getEncouragementMessage((correctAnswers / totalAnswers) * 100)}
          </p>
          <button
            className="mt-8 bg-white text-black px-4 py-2 rounded-lg"
            onClick={handleRetake}
          >
            Thử lại
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
          Chọn đi, đừng chọn cái nào mà dễ như bỡn, chọn cái nào ‘đâm vào não’
          một chút cho đỡ nhàm chán nhé! 😏
        </p>
      )}
      {flashcards.length > 0 && !hasCompleted && (
        <p className="text-sm text-gray-500 sm:block hidden">{`Ấn "Mũi tên phải" để qua thẻ tiếp theo đi :v`}</p>
      )}
    </div>
  );
};

export default FlashcardList;