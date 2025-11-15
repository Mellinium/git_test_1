export type HighlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Highlight = {
  id: string;
  rects: HighlightRect[];
  text: string;
  createdAt: number;
};

export type Explanation = {
  id: string;
  selectedText: string;
  explanation: string;
  createdAt: number;
};
