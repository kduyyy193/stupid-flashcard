import { useState, useEffect } from "react";

interface FlashcardProps {
  prompt: string;
  answer: string;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  prompt,
  answer,
  onAnswer,
  onNext,
}) => {
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    setIsAnswered(true);
    const isAnswerCorrect = userInput.toLowerCase().trim() === answer.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    onAnswer(isAnswerCorrect);
  };

  useEffect(() => {
    setUserInput("");
    setIsAnswered(false);
  }, [prompt]);

  return (
    <div className="flex flex-col items-center p-4 rounded shadow-lg min-h-[276px]">
      <h2 className="text-2xl mb-4 font-semibold">{prompt}</h2>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter your answer"
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
          className={`mt-4 text-center ${
            isCorrect ? "text-green-500" : "text-red-500"
          }`}
        >
          {isCorrect ? "Correct!" : `Wrong! The correct answer is: ${answer}`}
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
    </div>
  );
};

export default Flashcard;
