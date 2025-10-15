import { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2, X, Sparkles } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export default function BulkUploadModal({ onClose, onSuccess }) {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const res = await apiService.getCompanies()
      setCompanies(res.data)
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const wordFiles = selectedFiles.filter(file => 
      file.name.endsWith('.docx') || file.name.endsWith('.doc')
    )
    
    if (wordFiles.length < selectedFiles.length) {
      toast.error('Some files were skipped (only .doc/.docx allowed)')
    }
    
    setFiles(wordFiles)
  }

  const handleUpload = async () => {
    if (!selectedCompany) {
      toast.error('Please select a company')
      return
    }
    
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('files', file)
    })
    
    formData.append('companyCode', selectedCompany)
    formData.append('useAI', useAI)

    try {
      const response = await fetch('http://localhost:3000/api/bulk-upload/word-files', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results)
        toast.success(data.message)
        
        if (data.results.failed.length === 0) {
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 2000)
        }
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary-600" />
              Bulk Upload Job Descriptions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload multiple Word documents to import job descriptions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!results && (
            <>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h4 className="font-bold text-blue-900 mb-2">📝 Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Select the company/SBU for these job descriptions</li>
                  <li>Choose whether to use AI for parsing (recommended)</li>
                  <li>Select one or more Word files (.doc/.docx)</li>
                  <li>Click "Upload & Process" to import</li>
                </ol>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Select Company / SBU *
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="input"
                  disabled={uploading}
                >
                  <option value="">-- Select Company --</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.code}>
                      {company.code} - {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                  disabled={uploading}
                />
                <label htmlFor="useAI" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Use AI Parsing (Recommended)</div>
                    <div className="text-sm text-gray-600">
                      AI will intelligently extract and structure data from your documents
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Select Word Files *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Word documents only (.doc, .docx) • Max 50 files
                    </p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">{files.length} file(s) selected:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                          {!uploading && (
                            <button
                              onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedCompany || files.length === 0}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Process ({files.length})
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {results && (
            <div>
              <h3 className="text-lg font-bold mb-4">Upload Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                    <CheckCircle className="w-5 h-5" />
                    Success
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {results.success.length}
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-800 font-semibold mb-1">
                    <XCircle className="w-5 h-5" />
                    Failed
                  </div>
                  <div className="text-3xl font-bold text-red-900">
                    {results.failed.length}
                  </div>
                </div>
              </div>

              {results.success.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Successfully Imported:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.success.map((item, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg text-sm">
                        <div className="font-semibold">{item.jobCode}</div>
                        <div className="text-gray-600">{item.posisi}</div>
                        <div className="text-xs text-gray-500">{item.filename}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.failed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">❌ Failed to Import:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.failed.map((item, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg text-sm">
                        <div className="font-semibold text-red-900">{item.filename}</div>
                        <div className="text-red-700 text-xs mt-1">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  onClick={onClose}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
