"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Star, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/shared/common/show-toast";
import { CustomerReview } from "@/types/business-profile";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  services?: string[]; // List of services to choose from
  onSubmit?: (review: Partial<CustomerReview>) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  businessName,
  services = [],
  onSubmit,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      title: "",
      comment: "",
      visitDate: "",
      serviceUsed: "",
    },
  });

  const onFormSubmit = (data: any) => {
    if (rating === 0) {
      showToast.error("Please select a rating");
      return;
    }

    const review: Partial<CustomerReview> = {
      ...data,
      rating,
      wouldRecommend: wouldRecommend ?? undefined,
      isApproved: false, // Requires admin approval
      createdAt: new Date().toISOString(),
    };

    console.log("Submitting review:", review);

    // Call parent handler or API
    onSubmit?.(review);

    showToast.success(
      "Thank you for your review! It will be published after approval."
    );

    // Reset form
    reset();
    setRating(0);
    setWouldRecommend(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Business Name */}
          <div className="text-center pb-4 border-b">
            <p className="text-gray-600">You're reviewing</p>
            <h3 className="text-xl font-semibold text-orange-600">
              {businessName}
            </h3>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Title *
            </label>
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Sum up your experience in one sentence"
                />
              )}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review *
            </label>
            <Controller
              name="comment"
              control={control}
              rules={{
                required: "Review comment is required",
                minLength: {
                  value: 20,
                  message: "Review must be at least 20 characters",
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={5}
                  placeholder="Share your experience - what did you like? what could be improved?"
                />
              )}
            />
            {errors.comment && (
              <p className="text-red-600 text-sm mt-1">
                {errors.comment.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">Minimum 20 characters</p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name *
              </label>
              <Controller
                name="customerName"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input {...field} placeholder="John Doe" />
                )}
              />
              {errors.customerName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <Controller
                name="customerEmail"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                  />
                )}
              />
              {errors.customerEmail && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.customerEmail.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                We'll never share your email
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number (Optional)
              </label>
              <Controller
                name="customerPhone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="+1 (555) 123-4567" />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Visit Date (Optional)
              </label>
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </div>
          </div>

          {/* Service Used */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Which service did you use? (Optional)
              </label>
              <Controller
                name="serviceUsed"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a service</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}

          {/* Would Recommend */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Would you recommend this business to others?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                  wouldRecommend === true
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-500"
                }`}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                  wouldRecommend === false
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-500"
                }`}
              >
                👎 No
              </button>
            </div>
          </div>

          {/* Photo Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload photos of your experience
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB (Coming soon)
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              By submitting this review, you agree that it will be public and
              visible to all visitors. Your review will be reviewed by the
              business owner before being published.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
