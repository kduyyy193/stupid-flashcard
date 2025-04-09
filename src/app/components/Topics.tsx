import React from "react";

export interface ITopics {
  id: number;
  name: string;
  url: string;
}

interface IProps {
  topics: ITopics[];
  onChange: (url: string) => void;
}

const Topics = ({ topics, onChange }: IProps) => {
  return (
    <div className="relative">
      <select
        defaultValue="DEFAULT"
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 
          text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none"
      >
        <option
          value="DEFAULT"
          disabled
          className="text-gray-500 bg-white"
        >
          Chọn chủ đề
        </option>
        {topics.map((topic) => (
          <option
            key={topic.id}
            value={topic.url}
            className="text-gray-800 bg-white hover:bg-gray-100"
          >
            {topic.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default Topics;