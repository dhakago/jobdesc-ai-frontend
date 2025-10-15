import { useState } from 'react'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkUpload() {
  const [files, setFiles] = useState([])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
    toast.success(`${selectedFiles.length} file(s) selected`)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary-600" />
            Bulk Upload Job Descriptions
          </h2>
          <p className="text-gray-600 mt-1">
            Upload multiple Word documents to import job descriptions
          </p>
        </div>

        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept=".doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Word documents only (.doc, .docx)
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">{files.length} file(s) selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
