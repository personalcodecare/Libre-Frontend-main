import { FC } from "react";

type ProgressBarPops = {
  progressPercentage: number;
};

export const ProgressBar: FC<ProgressBarPops> = ({ progressPercentage }) => {
  return (
    <div className='h-1 w-full bg-gray-300'>
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${
          progressPercentage < 70 ? "bg-red-600" : "bg-green-600"
        }`}
      ></div>
    </div>
  );
};
