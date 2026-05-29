export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  dateGroup: 'Today' | 'Yesterday' | 'Previous 7 Days';
}