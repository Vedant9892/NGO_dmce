import { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { createNGOCoordinator, deleteNGOCoordinator } from '../../services/eventService';
import Loader from '../../components/ui/Loader';

export default function ManageCoordinatorsTab({ coordinators, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenModal = () => {
    setFormData({ name: '', email: '', password: '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.password) {
      setFormError('Name, email, and password are required');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await createNGOCoordinator({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      handleCloseModal();
      setRefreshing(true);
      await onRefresh?.();
      setRefreshing(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create coordinator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this coordinator?')) return;
    setDeletingId(id);
    try {
      await deleteNGOCoordinator(id);
      onRefresh?.();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = refreshing;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Coordinators</h2>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Coordinator
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader size="md" />
          </div>
        ) : coordinators.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coordinators.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {c.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.email ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No coordinators yet.</p>
            <p className="text-sm mt-1">Add coordinators to manage event attendance.</p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Coordinator
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} aria-hidden />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Coordinator</h3>
              <form onSubmit={handleSubmit}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>
                )}
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="coord-name" className="block text-sm font-semibold text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="coord-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Coordinator name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="coord-email" className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="coord-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="coordinator@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="coord-password" className="block text-sm font-semibold text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="coord-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Add Coordinator'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
