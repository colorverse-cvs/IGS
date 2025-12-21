import React, { useState } from 'react';
import Modal from './Modal';
import Dropdown from './Dropdown';
import { sendCustomOrder } from '../utils/customOrderApi';

const initialForm = {
  name: '',
  lastName: '',
  email: '',
  mobile: '',
  category: '',
  material: '',
  size: '',
  message: '',
};

export default function CustomOrderModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last Name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Enter a valid email';
        break;
      case 'mobile':
        if (!value.trim()) error = 'Mobile number is required';
        break;
      case 'category':
        if (!value.trim()) error = 'Category is required';
        break;
      case 'material':
        if (!value.trim()) error = 'Material is required';
        break;
      case 'size':
        if (!value.trim()) error = 'Size is required';
        break;
      case 'message':
        if (!value.trim()) error = 'Message is required';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field) => (e) => {
    validateField(field, e.target.value);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.material.trim()) errs.material = 'Material is required';
    if (!form.size.trim()) errs.size = 'Size is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setStatusMessage('Sending....');
    try {
      await sendCustomOrder(form);
      setStatus('success');
      setStatusMessage('Thank you! Your message has been sent.');
      setForm(initialForm);
      setErrors({});
      // Close modal after success
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setStatusMessage('');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setStatusMessage('Something went wrong while sending your message. Please try again.');
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Order"
      className="max-w-2xl w-full m-4"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setForm((prev) => ({ ...prev, name: value }));
              }}
              onBlur={handleBlur('name')}
              className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setForm((prev) => ({ ...prev, lastName: value }));
              }}
              onBlur={handleBlur('lastName')}
              className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="text"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={form.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm((prev) => ({ ...prev, mobile: value }));
              }}
              onBlur={handleBlur('mobile')}
              className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500"
              placeholder="+91 987 654 3210"
            />
            {errors.mobile && (
              <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
            )}
          </div>
          <div onBlur={() => validateField('category', form.category)}>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Category
            </label>
            <Dropdown
              options={[
                { value: 'God Statues', label: 'God Statues' },
                { value: 'Mavale Statues', label: 'Mavale Statues' },
                { value: 'Home Decor', label: 'Home Decor' },
                { value: 'Motivational Statues', label: 'Motivational Statues' },
                { value: 'Other', label: 'Other' },
              ]}
              value={form.category}
              onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              placeholder="Select Category"
              className="w-full"
            />
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>
          <div onBlur={() => validateField('material', form.material)}>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Material
            </label>
            <Dropdown
              options={[
                { value: 'Resin', label: 'Resin' },
                { value: 'Marble', label: 'Marble' },
              ]}
              value={form.material}
              onChange={(value) => setForm((prev) => ({ ...prev, material: value }))}
              placeholder="Select Material"
              className="w-full"
            />
            {errors.material && (
              <p className="text-xs text-red-500 mt-1">{errors.material}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Size
          </label>
          <input
            type="text"
            value={form.size}
            onChange={handleChange('size')}
            onBlur={handleBlur('size')}
            className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500"
            placeholder="e.g., 12 inches height"
          />
          {errors.size && (
            <p className="text-xs text-red-500 mt-1">{errors.size}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Message
          </label>
          <textarea
            value={form.message}
            onChange={handleChange('message')}
            onBlur={handleBlur('message')}
            rows={4}
            className="w-full border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-transparent focus:outline-none focus:ring-0 focus:ring-purple-500 resize-none"
            placeholder="Write your message..."
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1">{errors.message}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {status !== 'idle' && statusMessage && (
            <p
              className={`text-xs ${
                status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {statusMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="ml-auto inline-flex items-center justify-center px-6 py-3 rounded-md text-sm font-semibold text-white bg-[#7b21b0] hover:bg-[#6a199c] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
