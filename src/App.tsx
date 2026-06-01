import ErrorBoundary from './components/ErrorBoundary';
import AIChatBot from './pages/AiChatBot';

export default function App() {
  return (
    <ErrorBoundary>
      <AIChatBot />
    </ErrorBoundary>
  );
}