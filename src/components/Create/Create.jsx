import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { Sparkles, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Create() {
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])
  const [levels, setLevels] = useState([])
  const [formData, setFormData] = useState({
    companyId: '',
    posisi: '',
    divisi: '',
    departemen: '',
    level: '',
    atasan_structural: 'Director'
  })
  const [similarJobs, setSimilarJobs] = useState([])
  const [checking, setChecking] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)

  useEffect(() => {
    loadCompanies()
    loadLevels()
  }, [])

  useEffect(() => {
    if (formData.companyId) {
      loadDepartments(formData.companyId)
    }
  }, [formData.companyId])

  const loadCompanies = async () => {
    try {
      const res = await apiService.getCompanies()
      setCompanies(res.data)
    } catch {
      toast.error('Failed to load companies')
    }
  }

  const loadDepartments = async (companyId) => {
    try {
      const res = await apiService.getDepartments(companyId)
      setDepartments(res.data)
    } catch {
      toast.error('Failed to load departments')
    }
  }

  const loadLevels = async () => {
    try {
      const res = await apiService.getJobLevels()
      setLevels(res.data)
    } catch {
      toast.error('Failed to load levels')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCheckSimilarity = async () => {
    if (!formData.companyId || !formData.posisi) {
      toast.error('Please select company and enter position')
      return
    }

    setChecking(true)
    try {
      const res = await apiService.checkSimilarity({
        companyId: formData.companyId,
        posisi: formData.posisi,
        departemen: formData.departemen,
        level: formData.level
      })
      
      setSimilarJobs(res.data.similar || [])
      setShowSimilar(true)
      
      if (res.data.similar.length > 0) {
        toast.success(`Found ${res.data.similar.length} similar job descriptions`)
      } else {
        toast.success('No similar jobs found. Ready to generate new one!')
      }
    } catch {
      toast.error('Failed to check similarity')
    } finally {
      setChecking(false)
    }
  }

  const handleGenerate = async () => {
    if (!formData.companyId || !formData.posisi || !formData.departemen || !formData.level) {
      toast.error('Please fill all required fields')
      return
    }

    setGenerating(true)
    const toastId = toast.loading('Generating with AI...')

    try {
      await apiService.generateJobDescription(formData)
      toast.success('Job description generated!', { id: toastId })
      
      // Reset form
      setFormData({
        companyId: formData.companyId,
        posisi: '',
        divisi: '',
        departemen: '',
        level: '',
        atasan_structural: 'Director'
      })
      setSimilarJobs([])
      setShowSimilar(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed', { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            Create New Job Description with AI
          </h2>
          <p className="text-gray-600 mt-1">
            AI will check for similar positions and help generate professional job descriptions
          </p>
        </div>

        <div className="p-6">
          {/* Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">AI will check database first</p>
                <p className="text-sm text-blue-700 mt-1">
                  If similar job descriptions exist, system will show them for your reference
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Company Selection */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Company / SBU <span className="text-red-500">*</span>
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- Select Company --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    [{company.code}] {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Position Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="posisi"
                  value={formData.posisi}
                  onChange={handleChange}
                  placeholder="e.g., Senior Data Analyst"
                  className="input"
                  required
                />
              </div>

              {/* Division */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Division
                </label>
                <input
                  type="text"
                  name="divisi"
                  value={formData.divisi}
                  onChange={handleChange}
                  placeholder="e.g., Technology"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={!formData.companyId}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Job Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">-- Select Level --</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.name}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Structural Superior */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Structural Superior
              </label>
              <input
                type="text"
                name="atasan_structural"
                value={formData.atasan_structural}
                onChange={handleChange}
                placeholder="e.g., Director"
                className="input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCheckSimilarity}
                disabled={checking || !formData.companyId || !formData.posisi}
                className="btn btn-secondary flex items-center gap-2"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Check Similarity
                  </>
                )}
              </button>

              <button
                onClick={handleGenerate}
                disabled={generating || !formData.companyId || !formData.posisi}
                className="btn btn-primary flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Jobs Result */}
      {showSimilar && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-600" />
              Similarity Check Results
            </h3>
          </div>
          <div className="p-6">
            {similarJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Similar Job Descriptions Found
                </h3>
                <p className="text-gray-600 mb-4">
                  This is a unique position. Click "Generate with AI" to create a new job description.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Found {similarJobs.length} similar job description(s). You can reference these or generate a new one.
                </p>
                {similarJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{job.jobInformation.posisi}</h4>
                        <p className="text-sm text-gray-600">
                          {job.department?.name} • {job.level?.name}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {job.similarity}% Match
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {job.mainPurpose}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Code: {job.jobCode}</span>
                      <span>•</span>
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
