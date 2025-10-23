import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import { FileText, Sparkles, Loader2, AlertCircle, CheckCircle, Building2, Calendar, Clock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateJobDesc({ onNavigateToSettings }) {
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])
  const [levels, setLevels] = useState([])
  const [allDepartments, setAllDepartments] = useState([])
  
  const [formData, setFormData] = useState({
    companyId: '',
    posisi: '',
    divisi: '',
    departemen: '',
    levelId: '',
    atasan_structural: '',
    deskripsi_singkat: ''
  })
  
  const [checkingSimilarity, setCheckingSimilarity] = useState(false)
  const [similarJobs, setSimilarJobs] = useState([])
  const [showResults, setShowResults] = useState(false)

  const loadDepartmentsByCompany = useCallback((companyId) => {
    const filtered = allDepartments.filter(d => d.companyId === companyId && d.isActive)
    setDepartments(filtered)
  }, [allDepartments])

  useEffect(() => {
    loadMasterData()
  }, [])

  useEffect(() => {
    if (formData.companyId) {
      loadDepartmentsByCompany(formData.companyId)
    } else {
      setDepartments([])
      setFormData(prev => ({ ...prev, departemen: '' }))
    }
  }, [formData.companyId, loadDepartmentsByCompany])

  const loadMasterData = async () => {
    try {
      const [companiesRes, deptsRes, levelsRes] = await Promise.all([
        apiService.getCompanies(),
        apiService.getDepartments(),
        apiService.getJobLevels()
      ])
      
      setCompanies(companiesRes.data.filter(c => c.isActive))
      setAllDepartments(deptsRes.data)
      setLevels(levelsRes.data)
    } catch (error) {
      console.error('Error loading master data:', error)
      toast.error('Failed to load master data')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckSimilarity = async () => {
    if (!formData.posisi || !formData.departemen) {
      toast.error('Position name and department are required')
      return
    }

    setCheckingSimilarity(true)
    setSimilarJobs([])
    setShowResults(false)

    try {
      const response = await apiService.checkSimilarity({
        posisi: formData.posisi,
        departemen: formData.departemen,
        divisi: formData.divisi,
        companyId: formData.companyId
      })

      setSimilarJobs(response.data.similarJobs || [])
      setShowResults(true)

      if (response.data.similarJobs.length > 0) {
        toast.success(`Found ${response.data.similarJobs.length} similar job description(s)!`)
      } else {
        toast.success('No similar jobs found. Ready to create new one!')
      }
    } catch (error) {
      console.error('Error checking similarity:', error)
      toast.error('Failed to check similarity: ' + (error.response?.data?.message || error.message))
    } finally {
      setCheckingSimilarity(false)
    }
  }

  const handleUseTemplate = async (jobDescId) => {
    const toastId = toast.loading('Loading template...')
    try {
      const response = await apiService.getJobDescriptionById(jobDescId)
      toast.success('Template loaded! Redirecting to edit...', { id: toastId })
      // Here you can redirect to edit page or open modal
      console.log('Template loaded:', response.data.data)
    } catch {
      toast.error('Failed to load template', { id: toastId })
    }
  }

  const handleCreateNew = async () => {
    if (!formData.companyId || !formData.posisi || !formData.departemen) {
      toast.error('Please fill in required fields')
      return
    }

    const selectedCompany = companies.find(c => c.id === formData.companyId)
    const selectedLevel = levels.find(l => l.id === formData.levelId)

    const confirmed = confirm(
      `Create new job description?\n\n` +
      `Position: ${formData.posisi}\n` +
      `Company: ${selectedCompany?.name}\n` +
      `Department: ${formData.departemen}\n` +
      `Level: ${selectedLevel?.name || 'Not specified'}\n\n` +
      `AI will generate complete job description. Continue?`
    )

    if (!confirmed) return

    const toastId = toast.loading('🤖 Generating with AI... This may take 10-20 seconds')
    
    try {
      await apiService.generateJobDescription({
        companyId: formData.companyId,
        posisi: formData.posisi,
        divisi: formData.divisi,
        departemen: formData.departemen,
        level: selectedLevel?.name || 'Staff',
        atasan_structural: formData.atasan_structural,
        deskripsi_singkat: formData.deskripsi_singkat
      })

      toast.success('✅ Job description created successfully!', { id: toastId })
      
      // Reset form
      setFormData({
        companyId: '',
        posisi: '',
        divisi: '',
        departemen: '',
        levelId: '',
        atasan_structural: '',
        deskripsi_singkat: ''
      })
      setSimilarJobs([])
      setShowResults(false)
    } catch (error) {
      console.error('Error creating job description:', error)
      toast.error(error.response?.data?.message || 'Failed to create job description', { id: toastId })
    }
  }

  const getMatchColor = (similarity) => {
    if (similarity >= 90) return 'bg-green-100 text-green-800 border-green-300'
    if (similarity >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            {/* <FileText className="w-7 h-7 text-primary-600" /> */}
            <h2 className="text-2xl font-bold text-gray-900">
              Buat Job Description Baru
            </h2>
          </div>
          <p className="text-gray-600">
            Lengkapi informasi di bawah, sistem akan mengecek kesamaan dengan job desc yang sudah ada
          </p>
        </div>

        {/* Alert */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <strong>AI akan mengecek database terlebih dahulu</strong> - Jika ada job desc serupa, 
              sistem akan menampilkannya untuk Anda modifikasi.
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name - Dropdown */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Pilih Perusahaan</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.code} - {company.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada pilihan? 
                <button 
                  onClick={() => onNavigateToSettings()}
                  className="text-primary-600 hover:underline ml-1 font-medium"
                >
                  Tambah di Settings →
                </button>
              </p>
            </div>

            {/* Position Name - Text Input */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Nama Posisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="posisi"
                value={formData.posisi}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer"
                className="input"
                required
              />
            </div>

            {/* Division - Text Input */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Divisi
              </label>
              <input
                type="text"
                name="divisi"
                value={formData.divisi}
                onChange={handleChange}
                placeholder="e.g., HCGA"
                className="input"
              />
            </div>

            {/* Department - Dropdown */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="departemen"
                value={formData.departemen}
                onChange={handleChange}
                className="input"
                disabled={!formData.companyId}
                required
              >
                <option value="">Pilih Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {!formData.companyId && (
                <p className="text-xs text-gray-500 mt-1">
                  Pilih perusahaan terlebih dahulu
                </p>
              )}
              {formData.companyId && departments.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Tidak ada department. 
                  <button 
                    onClick={() => onNavigateToSettings()}
                    className="text-primary-600 hover:underline ml-1 font-medium"
                  >
                    Tambah di Settings →
                  </button>
                </p>
              )}
            </div>

            {/* Level - Dropdown */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="levelId"
                value={formData.levelId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Pilih Level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reports To - Text Input */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Reports To
              </label>
              <input
                type="text"
                name="atasan_structural"
                value={formData.atasan_structural}
                onChange={handleChange}
                placeholder="e.g., Manager POD"
                className="input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              name="deskripsi_singkat"
              value={formData.deskripsi_singkat}
              onChange={handleChange}
              placeholder="Tambahkan informasi spesifik atau requirement khusus yang ingin ditekankan..."
              rows={4}
              className="input resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCheckSimilarity}
              disabled={checkingSimilarity || !formData.posisi || !formData.departemen}
              className="btn btn-primary flex items-center gap-2 px-8"
            >
              {checkingSimilarity ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengecek Database...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Check dengan AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Similar Jobs Results */}
      {showResults && (
        <div className="card">
          {similarJobs.length > 0 ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  AI Menemukan Job Description Serupa!
                </h3>
                <p className="text-center text-gray-600 max-w-2xl mx-auto">
                  Sistem menemukan <strong>{similarJobs.length} job description</strong> dengan similarity tinggi. 
                  Anda bisa menggunakan salah satunya sebagai template untuk mempercepat proses.
                </p>
              </div>

              {/* Similar Jobs List */}
              <div className="p-6">
                <div className="space-y-4">
                  {similarJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="group border-2 border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-lg transition-all bg-white"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">
                              {job.posisi}
                            </h4>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getMatchColor(job.similarity)}`}>
                              {job.similarity}% Match
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{job.company?.code}</span>
                              <span>•</span>
                              <span>{job.departemen}</span>
                            </div>
                            {job.divisi && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500">Divisi: {job.divisi}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {job.jobCode}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Created: {formatDate(job.createdAt)}
                            </div>
                            {job.updatedAt && job.updatedAt !== job.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Updated: {formatDate(job.updatedAt)}
                              </div>
                            )}
                            <div>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                job.status === 'approved' ? 'bg-green-100 text-green-800' :
                                job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="text-gray-400">v{job.version}</div>
                          </div>

                          {/* Main Purpose Preview */}
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              <strong className="text-gray-900">Main Purpose:</strong> {job.mainPurpose}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleUseTemplate(job.id)}
                          className="flex-1 btn btn-primary text-sm flex items-center justify-center gap-2 group-hover:shadow-md transition-shadow"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Gunakan Template Ini
                        </button>
                        <button
                          onClick={() => window.open(`#preview-${job.id}`, '_blank')}
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create New Option */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                  <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-700 mb-4 font-medium">
                      💡 <strong>Tidak menemukan yang sesuai?</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      AI dapat membuat job description baru yang komprehensif berdasarkan informasi yang Anda berikan.
                    </p>
                    <button
                      onClick={handleCreateNew}
                      className="btn btn-primary flex items-center gap-2 mx-auto px-8"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate Job Description Baru
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No Similar Jobs Found */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Tidak Ada Job Description Serupa
                </h3>
                <p className="text-center text-gray-600 max-w-2xl mx-auto">
                  AI tidak menemukan job description yang serupa di database. 
                  Anda dapat membuat yang baru!
                </p>
              </div>

              <div className="p-8">
                <div className="text-center max-w-lg mx-auto">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full mb-6">
                    <FileText className="w-12 h-12 text-primary-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Siap Membuat Job Description Baru
                  </h4>
                  <p className="text-gray-600 mb-6">
                    AI akan membuat job description yang komprehensif dan profesional 
                    berdasarkan informasi yang telah Anda berikan.
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="btn btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate dengan AI Sekarang
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Proses ini memerlukan waktu sekitar 10-20 detik
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
