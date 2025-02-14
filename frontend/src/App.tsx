import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import './App.css';

interface Article {
  title: string;
  abstract: string;
  pmid: string;
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // Fetch real articles
  useEffect(() => {
    fetch('http://localhost:8000/articles')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error("PubMed Error:", data.error);
          return;
        }
        setArticles(data);
        setLoading(false);
      });
  }, []);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection("left");
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % articles.length);
        setSwipeDirection(null);
      }, 300); // Match the CSS transition duration
    },
    onSwipedRight: () => {
      setSwipeDirection("right");
      setTimeout(() => {
        setCurrentIndex(prev => (prev - 1 + articles.length) % articles.length);
        setSwipeDirection(null);
      }, 300);
    },
    trackMouse: true, // Enable mouse swipes
  });

  if (loading) return <div className="loading">Loading articles...</div>;
  if (!articles.length) return <div className="loading">No articles found</div>;

  // Add swipe class to the article card
  const articleCardClass = `article-card ${swipeDirection ? `swipe-${swipeDirection}` : ""}`;

  return (
    <div className="container">
      <h1>Journal Tracker</h1>
      
      {/* Swipeable article card */}
      <div {...handlers} className={articleCardClass}>
        <h2 className="article-title">
          {articles[currentIndex].title}
        </h2>
        <p className="article-summary">
          {articles[currentIndex].abstract || "No abstract available"}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="progress">
        Article {currentIndex + 1} of {articles.length}
      </div>
    </div>
  );
}

export default App;