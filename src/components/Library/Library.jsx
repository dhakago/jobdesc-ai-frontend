import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import api from '../../services/api'
import { Search, Filter, Download, Eye, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, Sparkles, Upload, FileText, FileDown, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import DetailModal from '../DetailModal'
import EditModal from '../EditModal'
import BulkUploadModal from '../BulkUploadModal'
import ActionDropdown, { DropdownItem } from '../ActionDropdown'

export default function Library() {
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])
  const [levels, setLevels] = useState([])
  const [jobDescs, setJobDescs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    companyId: '',
    departemen: '',
    level: '',
    status: '',
    search: ''
  })
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const loadCompanies = useCallback(async () => {
    try {
      const res = await apiService.getCompanies()
      setCompanies(res.data)
    } catch (_error) {
      console.error('Error loading companies:', _error)
    }
  }, [])

  const loadDepartments = useCallback(async (companyId) => {
    try {
      const res = await apiService.getDepartments(companyId)
      setDepartments(res.data)
    } catch (_error) {
      console.error('Error loading departments:', _error)
    }
  }, [])

  const loadLevels = useCallback(async () => {
    try {
      const res = await apiService.getJobLevels()
      setLevels(res.data)
    } catch (_error) {
      console.error('Error loading levels:', _error)
    }
  }, [])

  const loadJobDescriptions = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 100 }
      if (filters.companyId) params.companyId = filters.companyId
      if (filters.departemen) params.departemen = filters.departemen
      if (filters.level) params.level = filters.level
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const res = await apiService.getJobDescriptions(params)
      setJobDescs(res.data.data || [])
    } catch {
      toast.error('Failed to load job descriptions')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadCompanies()
    loadLevels()
    loadJobDescriptions()
  }, [loadCompanies, loadLevels, loadJobDescriptions])

  useEffect(() => {
    if (filters.companyId) {
      loadDepartments(filters.companyId)
    }
  }, [filters.companyId, loadDepartments])

  useEffect(() => {
    loadJobDescriptions()
  }, [loadJobDescriptions])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleViewDetail = async (id) => {
    try {
      const res = await apiService.getJobDescriptionById(id)
      setSelectedJob(res.data.data)
      setShowDetail(true)
    } catch {
      toast.error('Failed to load details')
    }
  }

  const handleEdit = async (id) => {
    try {
      const res = await apiService.getJobDescriptionById(id)
      setSelectedJob(res.data.data)
      setShowEdit(true)
    } catch {
      toast.error('Failed to load job description')
    }
  }

  const handleApprove = async (id) => {
    if (!confirm(`Approve job description?`)) return

    const toastId = toast.loading('Approving...')
    try {
      await apiService.approveJobDescription(id, 'Admin')
      toast.success('Job description approved!', { id: toastId })
      loadJobDescriptions()
    } catch {
      toast.error('Failed to approve', { id: toastId })
    }
  }

  const handleReject = async (id) => {
    const reason = prompt(`Reject job description? Enter reason:`)
    if (!reason) return

    const toastId = toast.loading('Rejecting...')
    try {
      await apiService.rejectJobDescription(id, reason)
      toast.success('Job description rejected', { id: toastId })
      loadJobDescriptions()
    } catch {
      toast.error('Failed to reject', { id: toastId })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Archive job description?`)) return

    const toastId = toast.loading('Archiving...')
    try {
      await apiService.deleteJobDescription(id)
      toast.success('Job description archived!', { id: toastId })
      loadJobDescriptions()
    } catch {
      toast.error('Failed to archive', { id: toastId })
    }
  }

  const handleExportPDF = (id) => {
    toast.loading('Generating PDF...', { id: 'export' })
    
  // Open in new window (use configured API base URL)
  const url = `${api.defaults.baseURL.replace(/\/api$/, '')}/api/job-descriptions/${id}/export/pdf`
  window.open(url, '_blank')
    
    setTimeout(() => {
      toast.success('PDF opened in new tab!', { id: 'export' })
    }, 500)
  }

  const handleExportDOCX = (id) => {
    toast.loading('Generating DOCX...', { id: 'export' })
    
  // Open in new window (use configured API base URL)
  const url = `${api.defaults.baseURL.replace(/\/api$/, '')}/api/job-descriptions/${id}/export/docx`
  window.open(url, '_blank')
    
    setTimeout(() => {
      toast.success('DOCX download started!', { id: 'export' })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Job Description Library
            </h2>
            <p className="text-gray-600 mt-1">Browse and manage all job descriptions</p>
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.code}
                </option>
              ))}
            </select>

            <select
              name="departemen"
              value={filters.departemen}
              onChange={handleFilterChange}
              className="input"
              disabled={!filters.companyId}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level.id} value={level.name}>
                  {level.name}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={loadJobDescriptions}
              className="btn btn-secondary flex items-center gap-2 justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Job Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Version
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : jobDescs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No job descriptions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jobDescs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {job.jobCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{job.posisi}</span>
                        {job.aiGenerated && (
                          <Sparkles className="w-4 h-4 text-purple-500" title="AI Generated" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.company?.code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.departemen || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'approved' ? 'bg-green-100 text-green-800' :
                        job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      v{job.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center gap-2">
                        {/* View/Edit Dropdown */}
                        <ActionDropdown
                          trigger={
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          }
                        >
                          <DropdownItem
                            icon={Eye}
                            label="View Details"
                            onClick={() => handleViewDetail(job.id)}
                            variant="primary"
                          />
                          <DropdownItem
                            icon={Edit2}
                            label="Edit"
                            onClick={() => handleEdit(job.id)}
                            variant="primary"
                          />
                        </ActionDropdown>

                        {/* Download Dropdown */}
                        <ActionDropdown
                          trigger={
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          }
                        >
                          <DropdownItem
                            icon={FileDown}
                            label="Export PDF"
                            onClick={() => handleExportPDF(job.id, job.jobCode)}
                            variant="success"
                          />
                          <DropdownItem
                            icon={FileText}
                            label="Export DOCX"
                            onClick={() => handleExportDOCX(job.id, job.jobCode)}
                            variant="success"
                          />
                        </ActionDropdown>

                        {/* More Actions Dropdown */}
                        <ActionDropdown
                          trigger={
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                        >
                          {job.status === 'draft' && (
                            <DropdownItem
                              icon={CheckCircle}
                              label="Approve"
                              onClick={() => handleApprove(job.id, job.jobCode)}
                              variant="success"
                            />
                          )}
                          {job.status === 'approved' && (
                            <DropdownItem
                              icon={XCircle}
                              label="Reject"
                              onClick={() => handleReject(job.id, job.jobCode)}
                              variant="danger"
                            />
                          )}
                          <DropdownItem
                            icon={Trash2}
                            label="Archive"
                            onClick={() => handleDelete(job.id, job.jobCode)}
                            variant="danger"
                          />
                        </ActionDropdown>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showDetail && selectedJob && (
        <DetailModal
          jobDesc={selectedJob}
          onClose={() => {
            setShowDetail(false)
            setSelectedJob(null)
          }}
        />
      )}

      {showEdit && selectedJob && (
        <EditModal
          jobDesc={selectedJob}
          onClose={() => {
            setShowEdit(false)
            setSelectedJob(null)
          }}
          onSaved={loadJobDescriptions}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onSuccess={loadJobDescriptions}
        />
      )}
    </div>
  )
}
