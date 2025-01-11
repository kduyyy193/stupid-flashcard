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
    <div className="rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-white">Topics</h2>
      <select
        defaultValue={"DEFAULT"}
        onChange={(e) => onChange(e.target.value)}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-black text-start min-w-32"
      >
        <option
          value="DEFAULT"
          disabled
          className=" text-black p-4 bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-all cursor-pointer text-center font-semibold"
        >
          {"Select one"}
        </option>
        {topics.map((topic, index) => (
          <option
            key={index}
            value={topic.url}
            className="text-black p-4 bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-all cursor-pointer text-center font-semibold"
          >
            {topic.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Topics;
