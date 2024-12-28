"use client";
import { useState, useEffect, useCallback } from "react";
import Flashcard from "./Flashcard";

interface FlashcardData {
  id: number;
  word: string;
  meaning: string;
}

const FlashcardList: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<Map<number, number>>(new Map());
  const [incorrectAnswers, setIncorrectAnswers] = useState<Map<number, number>>(new Map());
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>([]);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Key for localStorage
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
    } else {
      setHasCompleted(true);
      setRemainingIndexes(shuffleArray(Array.from({ length: flashcards.length }, (_, index) => index)));
    }
  }, [remainingIndexes, flashcards.length]);

  const handleAnswer = (id: number, isCorrect: boolean) => {
    setCorrectAnswers((prev) => {
      const updated = new Map(prev);
      updated.set(id, (updated.get(id) || 0) + (isCorrect ? 1 : 0));
      return updated;
    });

    setIncorrectAnswers((prev) => {
      const updated = new Map(prev);
      if (!isCorrect) {
        updated.set(id, (updated.get(id) || 0) + 1);
      }
      return updated;
    });

    if ((correctAnswers.get(id) || 0) + (isCorrect ? 1 : 0) >= 3) {
      setLearnedWords((prev) => [...prev, flashcards.find(card => card.id === id)?.word || ""]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as FlashcardData[];
          if (Array.isArray(data) && data.every(item => item.id && item.word && item.meaning)) {
            setFlashcards(data);
            setRemainingIndexes(shuffleArray(Array.from({ length: data.length }, (_, index) => index)));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            setErrorMessage(null);
          } else {
            throw new Error("Invalid file format");
          }
        } catch (error) {
            console.log(error)
          setErrorMessage("File không hợp lệ. Vui lòng thử lại.");
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    // Load flashcards from localStorage on initial render
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

  const currentCard = flashcards[currentCardIndex];
  const isCardCompleted = currentCard ? (correctAnswers.get(currentCard.id) || 0) >= 3 : false;

  return (
    <div className="space-y-6">
      <input
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {currentCard ? (
        isCardCompleted ? (
          <p className="text-xl font-semibold text-green-500">
            You&rsquo;ve learned this word!
          </p>
        ) : (
          <div>
            <Flashcard
              word={currentCard.word}
              meaning={currentCard.meaning}
              onAnswer={(isCorrect) => handleAnswer(currentCard.id, isCorrect)}
              onNext={handleNext}
            />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Correct answers: {correctAnswers.get(currentCard.id) || 0}
              </p>
              <p className="text-sm text-gray-600">
                Incorrect answers: {incorrectAnswers.get(currentCard.id) || 0}
              </p>
            </div>
          </div>
        )
      ) : (
        <p>No flashcards available. Please upload a JSON file.</p>
      )}

      <p className="text-sm text-gray-500">
        {`Press "Arrow Right" to move to the next card.`}
      </p>

      {hasCompleted && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">{`Words you've learned:`}</h3>
          <ul className="list-disc pl-5">
            {learnedWords.length === 0 ? (
              <p>No words learned yet.</p>
            ) : (
              learnedWords.map((word, index) => (
                <li key={index}>{word}</li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
