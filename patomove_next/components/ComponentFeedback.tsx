'use client';

import { useState } from 'react';

interface ComponentFeedbackProps {
  componentName: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showInProduction?: boolean;
}

interface FeedbackData {
  componentName: string;
  rating: number;
  comment: string;
  timestamp: string;
  userAgent: string;
}

export default function ComponentFeedback({ 
  componentName, 
  position = 'top-right',
  showInProduction = false 
}: ComponentFeedbackProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  //hide in production unless explicitly enabled
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && !showInProduction) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  const saveFeedback = () => {
    const feedbackData: FeedbackData = {
      componentName,
      rating,
      comment,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    //save to localStorage for now
    const existingFeedback = JSON.parse(localStorage.getItem('componentFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('componentFeedback', JSON.stringify(existingFeedback));

    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSubmitted(false);
      setRating(0);
      setComment('');
    }, 1500);
  };

  return (
    <>
      {/* Feedback button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`absolute ${positionClasses[position]} z-10 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors`}
        title={`Give feedback on ${componentName}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="3" cy="3" r="1"/>
          <circle cx="3" cy="8" r="1"/>
          <circle cx="3" cy="13" r="1"/>
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            {!isSubmitted ? (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  Feedback for {componentName}
                </h3>
                
                {/* Star rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What could be improved?"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFeedback}
                    disabled={rating === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-green-600 text-4xl mb-2 font-bold">DONE</div>
                <p className="text-lg font-medium">Thank you for your feedback!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}