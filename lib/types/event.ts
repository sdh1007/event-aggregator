export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  url: string;
  imageUrl?: string;
  tags: string[];
  source: string;
}
