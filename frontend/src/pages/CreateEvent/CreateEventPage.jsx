import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, UserCheck } from 'lucide-react';
import { createEvent, getNGOCoordinators } from '../../services/eventService';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNGOCoordinators().then((list) => setCoordinators(Array.isArray(list) ? list : []));
  }, []);

  const handleAddSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB');
        return;
      }
      setError(null);
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setBannerFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.target;
    const eventDate = form.eventDate?.value;
    const eventTime = form.eventTime?.value;
    const dateISO = eventDate && eventTime
      ? `${eventDate}T${eventTime}:00`
      : eventDate || '';

    if (!bannerFile) {
      setError('Please upload an event banner image');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.eventName?.value || '');
    formData.append('description', form.description?.value || '');
    formData.append('detailedDescription', form.detailedDescription?.value || '');
    formData.append('location', form.location?.value || '');
    formData.append('mode', form.mode?.value || 'Offline');
    formData.append('date', dateISO);
    formData.append('registrationDeadline', form.registrationDeadline?.value || '');
    formData.append('volunteersRequired', form.maxVolunteers?.value || '0');
    formData.append('contactEmail', form.contactEmail?.value || '');
    formData.append('skills', JSON.stringify(skills));
    formData.append('roles', form.querySelector('#roles')?.value || '');
    formData.append('eligibility', form.querySelector('#eligibility')?.value || '');
    formData.append('perks', form.querySelector('#perks')?.value || '');
    const coordinatorId = form.querySelector('#coordinatorId')?.value;
    if (coordinatorId) formData.append('coordinatorId', coordinatorId);
    formData.append('bannerImage', bannerFile);

    try {
      await createEvent(formData);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      navigate('/ngo-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create event');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-lg text-gray-600">
            Fill in the details to post your volunteer opportunity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="eventName" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                required
                placeholder="e.g., Beach Cleanup Drive"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="ngoName" className="block text-sm font-semibold text-gray-700 mb-2">
                NGO Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ngoName"
                name="ngoName"
                required
                placeholder="Your organization name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={2}
                placeholder="Brief description for event cards (max 120 characters)"
                maxLength={120}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="detailedDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="detailedDescription"
                name="detailedDescription"
                required
                rows={6}
                placeholder="Provide a comprehensive description of the event, its goals, and what volunteers will do..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Banner <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerChange}
              />
              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="absolute bottom-2 left-2 text-sm text-white bg-black/60 px-2 py-1 rounded">
                    {bannerFile?.name}
                  </p>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(ev) => ev.key === 'Enter' && fileInputRef.current?.click()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WebP up to 5MB (Recommended: 1200x600px)
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  placeholder="e.g., Marina Beach, Chennai"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="mode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="mode"
                  name="mode"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select mode</option>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills Required <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type a skill and press Add"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-blue-700 hover:text-blue-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="coordinatorId" className="block text-sm font-semibold text-gray-700 mb-2">
                Assign Coordinator
              </label>
              <select
                id="coordinatorId"
                name="coordinatorId"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">None</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              {coordinators.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Add coordinators in Manage Coordinators to assign them to events.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxVolunteers" className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Volunteers <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="maxVolunteers"
                  name="maxVolunteers"
                  required
                  min="1"
                  placeholder="e.g., 50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="roles" className="block text-sm font-semibold text-gray-700 mb-2">
                Roles & Responsibilities
              </label>
              <textarea
                id="roles"
                name="roles"
                rows={4}
                placeholder="List the different roles and their responsibilities (one per line)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="eligibility" className="block text-sm font-semibold text-gray-700 mb-2">
                Eligibility Criteria
              </label>
              <textarea
                id="eligibility"
                name="eligibility"
                rows={3}
                placeholder="Specify eligibility requirements (one per line)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="perks" className="block text-sm font-semibold text-gray-700 mb-2">
                Perks & Benefits
              </label>
              <textarea
                id="perks"
                name="perks"
                rows={3}
                placeholder="List perks and benefits for volunteers (one per line)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                required
                placeholder="contact@yourorganization.org"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border-t pt-6 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/ngo-dashboard')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
