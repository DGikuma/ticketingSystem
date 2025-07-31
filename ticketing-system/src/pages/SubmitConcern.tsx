import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';
// import your auth hook
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  subject: string;
  description: string;
  file?: FileList;
  confirmation?: boolean;
}

export default function SubmitConcern() {
  const [step, setStep] = useState(1);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { user } = useAuth(); // ✅ get current user

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>();

  const file = watch('file');

  const handleNext = async () => {
    const valid = await trigger(step === 1 ? ['subject'] : ['description']);
    if (valid) setStep((s) => s + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFileInfo(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

    const onSubmit = async (data: FormData) => {
      try {
        const formData = new FormData();
        formData.append('subject', data.subject);
        formData.append('description', data.description);
        formData.append('priority', 'high');
        formData.append('created_by', user?.id || '');

        if (data.file && data.file[0]) {
          formData.append('file', data.file[0]);
        }

        const response = await fetch('/api/tickets', {
          method: 'POST',
          body: formData,
          credentials: 'include', // if your backend uses cookies
        });

        if (!response.ok) throw new Error('Failed to create ticket');

        toast.success('Ticket submitted successfully!', { icon: '📨' });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Submission error:', error);
        toast.error('Failed to submit Ticket. Please try again.');
      }
    };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Submit a Concern</h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
          <div className={step >= 1 ? 'text-indigo-600' : ''}>1. Subject</div>
          <div className={step >= 2 ? 'text-indigo-600' : ''}>2. Description</div>
          <div className={step >= 3 ? 'text-indigo-600' : ''}>3. Attachments</div>
          <div className={step >= 4 ? 'text-indigo-600' : ''}>4. Confirm</div>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2">
          <div
            className="h-2 bg-indigo-500 rounded transition-all"
            style={{ width: `${(step - 1) * 33.3}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div>
            <label className="block mb-1 text-sm font-medium">Subject</label>
            <input
              {...register('subject', { required: 'Subject is required.' })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block mb-1 text-sm font-medium">Description</label>
            <textarea
              {...register('description', { required: 'Description is required.' })}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
              rows={4}
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block mb-1 text-sm font-medium">Attachment (Optional)</label>
            <input
              type="file"
              {...register('file')}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:border-gray-300 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />

            <AnimatePresence>
              {filePreview && (
                <motion.img
                  key="preview"
                  src={filePreview}
                  alt="Preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 max-h-40 rounded shadow"
                />
              )}

              {!filePreview && fileInfo && (
                <motion.div
                  key="file-icon"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-300" /> {fileInfo.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                {...register('confirmation', {
                  required: 'Please confirm before submitting.',
                })}
                className="mt-1"
              />
              <label className="text-sm">
                I confirm that the above information is accurate and complete.
              </label>
            </div>
            {errors.confirmation && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmation.message}</p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
          >
            <motion.div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-md text-center">
              <h3 className="text-xl font-bold mb-2">Success 🎉</h3>
              <p className="text-sm mb-4">Your concern has been submitted successfully.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
