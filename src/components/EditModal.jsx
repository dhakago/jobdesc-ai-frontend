import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export default function EditModal({ jobDesc, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    posisi: '',
    divisi: '',
    departemen: '',
    level: '',
    mainPurpose: '',
    changedBy: 'Admin',
    changeDescription: ''
  })

  useEffect(() => {
    if (jobDesc) {
      setFormData({
        posisi: jobDesc.jobInformation.posisi,
        divisi: jobDesc.jobInformation.divisi,
        departemen: jobDesc.jobInformation.departemen,
        level: jobDesc.level?.name || '',
        mainPurpose: jobDesc.mainPurpose,
        changedBy: 'Admin',
        changeDescription: ''
      })
    }
  }, [jobDesc])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    if (!formData.changeDescription) {
      toast.error('Please provide change description')
      return
    }

    setSaving(true)
    const toastId = toast.loading('Saving changes...')

    try {
      await apiService.updateJobDescription(jobDesc.id, formData)
      toast.success('Job description updated!', { id: toastId })
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save changes', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Job Description</h2>
            <p className="text-sm text-gray-600 mt-1">{jobDesc.jobCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Saving will create a new version (v{jobDesc.version + 1})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Position Name
              </label>
              <input
                type="text"
                name="posisi"
                value={formData.posisi}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Division
              </label>
              <input
                type="text"
                name="divisi"
                value={formData.divisi}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="departemen"
                value={formData.departemen}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Level
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Main Purpose
            </label>
            <textarea
              name="mainPurpose"
              value={formData.mainPurpose}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Change Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="changeDescription"
              value={formData.changeDescription}
              onChange={handleChange}
              placeholder="e.g., Updated position title and main purpose"
              className="input"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
