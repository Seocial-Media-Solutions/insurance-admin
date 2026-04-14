import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

const CreateSubAdmin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await authService.createSubAdmin(data);
      if (response.success) {
        toast.success('Sub-admin created successfully!');
        reset();
      } else {
        toast.error(response.message || 'Creation failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Sub-Admin</h1>
              <p className="text-blue-100 text-sm">Add a new manager to the portal</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 text-gray-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  type="email"
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="manager@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 text-gray-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  type="password"
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-gray-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Assign Role & Create</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 border-t border-gray-100 p-6">
          <div className="flex items-start space-x-3 text-sm text-gray-500">
            <div className="mt-0.5 p-1 bg-yellow-100 text-yellow-700 rounded-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p>
              New sub-admins will have "SUB_ADMIN" privileges. They can access manager routes but cannot create other users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubAdmin;
