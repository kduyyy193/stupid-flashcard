"use client";
import { useState, useEffect, useCallback } from "react";
import Flashcard from "./Flashcard";

interface FlashcardData {
  id: number;
  vi: string;
  en: string;
}

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<Map<number, number>>(new Map());
  const [incorrectAnswers, setIncorrectAnswers] = useState<Map<number, number>>(new Map());
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>([]);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isViPrompt, setIsViPrompt] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const LOCAL_STORAGE_KEY = "flashcards";

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

  const handleAnswer = (id: number, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => {
        const updated = new Map(prev);
        updated.set(id, (updated.get(id) || 0) + 1);
        return updated;
      });
    } else {
      setIncorrectAnswers((prev) => {
        const updated = new Map(prev);
        updated.set(id, (updated.get(id) || 0) + 1);
        return updated;
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as FlashcardData[];
          if (Array.isArray(data) && data.every(item => item.id && item.vi && item.en)) {
            setFlashcards(data);
            setRemainingIndexes(shuffleArray(Array.from({ length: data.length }, (_, index) => index)));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            setErrorMessage(null);
          } else {
            throw new Error("Invalid file format");
          }
        } catch (error) {
          console.log(error)
          setErrorMessage("File is invalid format");
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const savedFlashcards = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFlashcards) {
      try {
        const parsedFlashcards = JSON.parse(savedFlashcards) as FlashcardData[];
        setFlashcards(parsedFlashcards);
        setRemainingIndexes(shuffleArray(Array.from({ length: parsedFlashcards.length }, (_, index) => index)));
      } catch (error) {
        console.error("Error parsing flashcards from localStorage:", error);
      }
    }
  }, []);

  const currentCard = flashcards[currentCardIndex];

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
    <div className="space-y-6">
      <div>{ `format json: [{ "id": 1, "en": "dog", "vi": "con chó" },...]`}</div>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {hasCompleted ? (
        <div className="text-center">
          <p className="text-green-500">You have completed all the memory cards!</p>
          <h2 className="text-lg font-semibold mt-4">Result:</h2>
          <ul className="mt-2">
            {flashcards.map((card) => (
              <li key={card.id} className="mb-2">
                {isViPrompt ? card.vi : card.en}: 
                <span className="text-green-500 ml-2">
                {`${card.vi} - ${card.en}`}
                </span>,
                <span className="text-green-500 ml-2">
                  Correct: {correctAnswers.get(card.id) || 0}
                </span>, 
                <span className="text-red-500 ml-2">
                  Wrong: {incorrectAnswers.get(card.id) || 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : currentCard ? (
        <Flashcard
          prompt={isViPrompt ? currentCard.vi : currentCard.en}
          answer={isViPrompt ? currentCard.en : currentCard.vi}
          onAnswer={(isCorrect) => handleAnswer(currentCard.id, isCorrect)}
          onNext={handleNext}
        />
      ) : (
        <p>No flashcards available. Please upload a JSON file.</p>
      )}
      <p className="text-sm text-gray-500">
        {`Press "Arrow Right" to move to the next card.`}
      </p>
    </div>
  );
};

export default FlashcardList;
