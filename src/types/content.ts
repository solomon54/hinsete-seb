export interface ContentPage {
  pageNumber: number;
  bodyText: string;
  assets: string[];
}

export interface Content {
  id: string;
  weekIndex: number; // 0 for Week 1, 1 for Week 2, etc.
  title: string;
  slug: string;
  contentJson: {
    pages: ContentPage[];
  };
  isLocked: boolean;
}
