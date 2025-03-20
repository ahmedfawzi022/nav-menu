export interface NavItem {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  children?: NavItem[];
}

export interface DragAnalytics {
  id: string;
  from: number;
  to: number;
}