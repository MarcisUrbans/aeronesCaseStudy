import { FC } from "react";

interface IReviewButtonProps {
  action: (seconds: number, action: "rewind" | "forward") => void;
  text: string;
}

export const RewindButton: FC<IReviewButtonProps> = ({ action, text }) => (
  <button
    className="border-[1px] border-[#000]"
    onClick={() => action(15, "rewind")}
  >
    {text}
  </button>
);
