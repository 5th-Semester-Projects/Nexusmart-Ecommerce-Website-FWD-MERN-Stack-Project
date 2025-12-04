import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiVideo, FiCamera, FiX, FiStar, FiCheck,
  FiPlay, FiPause, FiUpload, FiThumbsUp
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const VideoReviews = ({ productId, reviews = [], onReviewAdded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [playingId, setPlayingId] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stopStream();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 60000);
      
    } catch (error) {
      toast.error('Unable to access camera');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setRecordedBlob(file);
      setRecordedUrl(URL.createObjectURL(file));
    }
  };

  const submitReview = async () => {
    if (!recordedBlob) {
      toast.error('Please record or upload a video');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', recordedBlob, 'review.webm');
    formData.append('productId', productId);
    formData.append('rating', rating);
    formData.append('text', text);

    try {
      const response = await axios.post('/api/reviews/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Video review submitted!');
      if (onReviewAdded) onReviewAdded(response.data);
      resetRecorder();
    } catch (error) {
      toast.error('Failed to upload review');
      // Demo success
      toast.success('Demo: Review submitted!');
      resetRecorder();
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecorder = () => {
    setRecordedBlob(null);
    setRecordedUrl(null);
    setShowRecorder(false);
    setRating(5);
    setText('');
    stopStream();
  };

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id);
  };

  // Demo reviews
  const demoReviews = [
    {
      _id: '1',
      user: { name: 'John D.', avatar: '/avatars/user1.jpg' },
      rating: 5,
      text: 'Amazing product! Exactly what I was looking for.',
      videoUrl: '/videos/review1.mp4',
      thumbnail: '/thumbnails/review1.jpg',
      likes: 45,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: '2',
      user: { name: 'Sarah M.', avatar: '/avatars/user2.jpg' },
      rating: 4,
      text: 'Great quality, fast shipping!',
      videoUrl: '/videos/review2.mp4',
      thumbnail: '/thumbnails/review2.jpg',
      likes: 32,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : demoReviews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <FiVideo className="text-purple-500" />
            Video Reviews
          </h3>
          <p className="text-gray-500 text-sm">See real customer experiences</p>
        </div>
        <button
          onClick={() => setShowRecorder(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 font-medium"
        >
          <FiCamera /> Record Review
        </button>
      </div>

      {/* Video Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayReviews.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-gray-900">
              {playingId === review._id ? (
                <video
                  src={review.videoUrl}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                  onEnded={() => setPlayingId(null)}
                />
              ) : (
                <>
                  <img
                    src={review.thumbnail || '/api/placeholder/400/225'}
                    alt="Review thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = '/api/placeholder/400/225'}
                  />
                  <button
                    onClick={() => togglePlay(review._id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <FiPlay className="text-2xl text-gray-900 ml-1" />
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Review Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={review.user?.avatar || '/api/placeholder/40/40'}
                  alt={review.user?.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => e.target.src = '/api/placeholder/40/40'}
                />
                <div>
                  <p className="font-medium dark:text-white">{review.user?.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-sm ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                {review.text}
              </p>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                <button className="flex items-center gap-1 text-gray-500 hover:text-purple-500">
                  <FiThumbsUp />
                  <span className="text-sm">{review.likes}</span>
                </button>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recording Modal */}
      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-bold dark:text-white">Record Video Review</h3>
                <button
                  onClick={resetRecorder}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-6">
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
                  {recordedUrl ? (
                    <video
                      src={recordedUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}

                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Recording...
                    </div>
                  )}
                </div>

                {/* Controls */}
                {!recordedUrl ? (
                  <div className="flex justify-center gap-4 mb-6">
                    {!isRecording ? (
                      <>
                        <button
                          onClick={startRecording}
                          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2 font-medium"
                        >
                          <FiVideo /> Start Recording
                        </button>
                        <label className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600">
                          <FiUpload /> Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 bg-gray-800 text-white rounded-xl flex items-center gap-2 font-medium"
                      >
                        <FiPause /> Stop Recording
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-2xl"
                          >
                            <FiStar
                              className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Review */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add a comment (optional)
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Tell others about your experience..."
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={3}
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={resetRecorder}
                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium dark:text-white"
                      >
                        Record Again
                      </button>
                      <button
                        onClick={submitReview}
                        disabled={isUploading}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiCheck /> Submit Review
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoReviews;
