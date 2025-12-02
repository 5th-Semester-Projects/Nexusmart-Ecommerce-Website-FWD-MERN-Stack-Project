import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiCamera, FiX, FiThumbsUp, FiThumbsDown, 
  FiCheck, FiAlertCircle, FiFilter, FiChevronDown, FiImage
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Star Rating Input Component
export const StarRatingInput = ({ rating, setRating, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`${sizes[size]} transition-transform hover:scale-110`}
        >
          <FiStar
            className={`transition-colors ${
              (hoverRating || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-500'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ images, setImages, maxImages = 5 }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Add Photos (Optional)
      </label>
      
      <div className="flex flex-wrap gap-3">
        {/* Image Previews */}
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.preview}
              alt="Review"
              className="w-20 h-20 rounded-xl object-cover border border-white/10"
            />
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-500 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <FiCamera className="text-xl mb-1" />
            <span className="text-xs">Add</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Add up to {maxImages} images. Max 5MB each.
      </p>
    </div>
  );
};

// Review Form Component
export const ReviewForm = ({ productId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('comment', comment);
      formData.append('pros', pros);
      formData.append('cons', cons);
      formData.append('recommend', recommend);
      
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      await api.post(`/products/${productId}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Review submitted successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 space-y-6"
    >
      <h3 className="text-xl font-bold text-white">Write a Review</h3>

      {/* Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-4">
          <StarRatingInput rating={rating} setRating={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-lg font-medium text-yellow-400">
              {ratingLabels[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
        />
      </div>

      {/* Review Comment */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike? How was the quality?"
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
        />
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-green-400">
            <FiThumbsUp className="inline mr-1" />
            Pros
          </label>
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="What did you like?"
            rows={2}
            className="w-full px-4 py-3 bg-green-900/20 border border-green-500/30 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-red-400">
            <FiThumbsDown className="inline mr-1" />
            Cons
          </label>
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="What could be better?"
            rows={2}
            className="w-full px-4 py-3 bg-red-900/20 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
          />
        </div>
      </div>

      {/* Image Upload */}
      <ImageUpload images={images} setImages={setImages} />

      {/* Recommend */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">Would you recommend this product?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRecommend(true)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              recommend
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <FiThumbsUp />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setRecommend(false)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              !recommend
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <FiThumbsDown />
            No
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiCheck />
          )}
          Submit Review
        </button>
      </div>
    </motion.form>
  );
};

// Single Review Card
export const ReviewCard = ({ review, onVote }) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  const isLongReview = review.comment?.length > 300;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold">
            {review.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{review.user?.name || 'Anonymous'}</span>
              {review.verified && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                  <FiCheck className="text-xs" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString('en-PK', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>

        {/* Recommend Badge */}
        {review.recommend !== undefined && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            review.recommend 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {review.recommend ? <FiThumbsUp /> : <FiThumbsDown />}
            {review.recommend ? 'Recommends' : "Doesn't Recommend"}
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-bold text-white mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      <p className={`text-gray-300 ${!showFullReview && isLongReview ? 'line-clamp-3' : ''}`}>
        {review.comment}
      </p>
      {isLongReview && (
        <button
          onClick={() => setShowFullReview(!showFullReview)}
          className="text-cyan-400 text-sm mt-2 hover:underline"
        >
          {showFullReview ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Pros & Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {review.pros && (
            <div className="bg-green-900/20 rounded-xl p-3">
              <p className="text-sm font-medium text-green-400 mb-1 flex items-center gap-1">
                <FiThumbsUp /> Pros
              </p>
              <p className="text-sm text-gray-300">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-900/20 rounded-xl p-3">
              <p className="text-sm font-medium text-red-400 mb-1 flex items-center gap-1">
                <FiThumbsDown /> Cons
              </p>
              <p className="text-sm text-gray-300">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {review.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setImageModal(img.url || img)}
              className="flex-shrink-0"
            >
              <img
                src={img.url || img}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 rounded-xl object-cover border border-white/10 hover:border-cyan-500 transition-colors"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <span className="text-sm text-gray-400">Was this review helpful?</span>
        <div className="flex gap-2">
          <button
            onClick={() => onVote?.(review._id, 'helpful')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors ${
              review.userVote === 'helpful'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <FiThumbsUp />
            Yes ({review.helpfulCount || 0})
          </button>
          <button
            onClick={() => onVote?.(review._id, 'not-helpful')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors ${
              review.userVote === 'not-helpful'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <FiThumbsDown />
            No
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setImageModal(null)}
          >
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
            >
              <FiX />
            </button>
            <img
              src={imageModal}
              alt="Review"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Rating Summary Component
export const RatingSummary = ({ reviews = [], averageRating = 0 }) => {
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={`text-xl ${
                  star <= Math.round(averageRating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400">{reviews.length} reviews</p>
        </div>

        {/* Rating Bars */}
        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-400 w-3">{rating}</span>
              <FiStar className="text-yellow-400 fill-yellow-400 text-sm" />
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: rating * 0.1 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
