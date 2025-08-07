'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  subject: string;
  description: string;
  file?: FileList;
}

const SubmitConcern: React.FC = () => {
  const { user } = useAuth(); // ✅ Only call this once
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const file = watch('file');

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error('User not logged in. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('created_by', user.id.toString());

      if (data.file?.[0]) {
        formData.append('file', data.file[0]);
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to create ticket');
      }

      toast.success('Concern submitted successfully!');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    reset();
    setStep(1);
  };

  // Framer Motion variants
  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Submit a Concern</h2>

      {/* Stepper */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className={step >= 1 ? 'text-indigo-600' : ''}>1. Details</div>
          <div className={step >= 2 ? 'text-indigo-600' : ''}>2. Attachment</div>
          <div className={step >= 3 ? 'text-indigo-600' : ''}>3. Review</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded mt-2">
          <motion.div
            className="bg-indigo-600 h-2 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Subject</label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Enter subject"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your concern details"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <button
                type="button"
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Optional Attachment</label>
                <input
                  type="file"
                  {...register('file')}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Review</h3>
              <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>Subject:</strong> {watch('subject')}</p>
              <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>Description:</strong> {watch('description')}</p>
              {file?.[0] && (
                <p className="mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText size={16} /> {file[0].name}
                </p>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* ✅ Success Modal with dark/light blur */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 transition-all duration-300"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg z-50 w-full max-w-md text-center"
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Success!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your concern has been submitted.</p>
            <button
              onClick={closeSuccessModal}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubmitConcern;
