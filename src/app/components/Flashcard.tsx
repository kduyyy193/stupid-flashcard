import { useEffect, useState } from "react";

interface FlashcardProps {
  word: string;
  meaning: string;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  word,
  meaning,
  onAnswer,
  onNext,
}) => {
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(false);

  const checkAnswer = () => {
    setIsAnswered(true);
    if (userInput.toLowerCase().trim() === meaning.toLowerCase().trim()) {
      setCorrectAnswer(true);
      onAnswer(true);
    } else {
      setCorrectAnswer(false);
      onAnswer(false);
    }
  };

  useEffect(() => {
    if (word) {
      setUserInput("");
      setIsAnswered(false);
    }
  }, [word]);

  return (
    <div className="flex flex-col items-center p-4 border rounded shadow-lg">
      <h2 className="text-2xl mb-4 font-semibold">Translate: {word}</h2>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter the meaning"
        className="p-2 mb-4 border rounded text-black"
        onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
      />
      <button
        onClick={checkAnswer}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Check Answer
      </button>
      {isAnswered && (
        <div
          className={`mt-4  text-center ${
            correctAnswer ? "text-green-500" : "text-red-500"
          }`}
        >
          {correctAnswer ? "Correct!" : "Wrong!"}
          <p className="capitalize">{meaning}</p>
        </div>
      )}
      {isAnswered && (
        <button
          onClick={onNext}
          className="mt-4 p-2 bg-gray-500 text-white rounded"
        >
          Next
        </button>
      )}
      {isAnswered && !correctAnswer && (
        <div className="mt-2 text-gray-600">
          <p>The correct answer is: {meaning}</p>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
