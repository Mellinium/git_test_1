export type Explanation = {
  id: string;
  excerpt: string;
  text: string;
};

export type Highlight = {
  id: string;
  rects: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>;
};
