import { X, Download, Clock, User } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export default function DetailModal({ jobDesc, onClose }) {
  const handleExport = () => {
    toast.loading('Preparing download...', { id: 'export' })
    apiService.exportJobDescriptionPDF(jobDesc.id)
    setTimeout(() => {
      toast.success('Download started!', { id: 'export' })
    }, 500)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {jobDesc.jobInformation.posisi}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {jobDesc.jobCode} • {jobDesc.jobInformation.departemen} • v{jobDesc.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              jobDesc.status === 'approved' ? 'bg-green-100 text-green-800' :
              jobDesc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {jobDesc.status.toUpperCase()}
            </span>
            {jobDesc.aiGenerated && (
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                🤖 AI Generated
              </span>
            )}
            {jobDesc.approvedAt && (
              <span className="text-sm text-gray-600">
                Approved: {formatDate(jobDesc.approvedAt)} by {jobDesc.approvedBy}
              </span>
            )}
          </div>

          {/* Job Info */}
          <section>
            <h3 className="text-lg font-bold text-primary-600 mb-3 pb-2 border-b-2 border-primary-600">
              I. INFORMASI JABATAN
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Kode Jabatan</p>
                <p className="font-semibold">{jobDesc.jobCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posisi</p>
                <p className="font-semibold">{jobDesc.jobInformation.posisi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Divisi</p>
                <p className="font-semibold">{jobDesc.jobInformation.divisi || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Departemen</p>
                <p className="font-semibold">{jobDesc.jobInformation.departemen || '-'}</p>
              </div>
            </div>
          </section>

          {/* Main Purpose */}
          <section>
            <h3 className="text-lg font-bold text-primary-600 mb-3 pb-2 border-b-2 border-primary-600">
              III. TUJUAN UTAMA JABATAN
            </h3>
            <p className="text-gray-700 text-justify leading-relaxed">
              {jobDesc.mainPurpose}
            </p>
          </section>

          {/* Job Descriptions */}
          <section>
            <h3 className="text-lg font-bold text-primary-600 mb-3 pb-2 border-b-2 border-primary-600">
              IV. URAIAN JABATAN
            </h3>
            <ol className="space-y-2">
              {jobDesc.jobDescriptions.map((desc) => (
                <li key={desc.no} className="flex gap-3">
                  <span className="font-semibold text-gray-600">{desc.no}.</span>
                  <span className="text-gray-700">{desc.description}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Relationships */}
          <section>
            <h3 className="text-lg font-bold text-primary-600 mb-3 pb-2 border-b-2 border-primary-600">
              V. HUBUNGAN KERJA
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Internal:</p>
                <ul className="space-y-1">
                  {jobDesc.relationships.internal.map((item, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-primary-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Eksternal:</p>
                <ul className="space-y-1">
                  {jobDesc.relationships.external.map((item, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-primary-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Requirements */}
          <section>
            <h3 className="text-lg font-bold text-primary-600 mb-3 pb-2 border-b-2 border-primary-600">
              VI. PERSYARATAN JABATAN
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2">A. Pendidikan</p>
                <ul className="space-y-1 ml-4">
                  <li className="text-gray-700">• Level: {jobDesc.jobRequirements.pendidikan.level}</li>
                  <li className="text-gray-700">
                    • Jurusan: {jobDesc.jobRequirements.pendidikan.major.join(', ')}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">B. Keterampilan</p>
                <ol className="space-y-1 ml-4">
                  {jobDesc.jobRequirements.keterampilan.map((skill, idx) => (
                    <li key={idx} className="text-gray-700">
                      {idx + 1}. {skill}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">C. Pelatihan yang Direkomendasikan</p>
                <ol className="space-y-1 ml-4">
                  {jobDesc.jobRequirements.pelatihan.map((training, idx) => (
                    <li key={idx} className="text-gray-700">
                      {idx + 1}. {training}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* Version History */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Version History
            </h3>
            
            {jobDesc.versions && jobDesc.versions.length > 0 ? (
              <div className="space-y-4">
                {jobDesc.versions.map((version, idx) => (
                  <div 
                    key={version.id} 
                    className={`relative pl-6 pb-4 ${
                      idx !== jobDesc.versions.length - 1 ? 'border-l-2 border-gray-300' : ''
                    }`}
                  >
                    <div className={`absolute left-0 top-0 -ml-2 w-4 h-4 rounded-full ${
                      version.version === jobDesc.version 
                        ? 'bg-primary-600 ring-4 ring-primary-100' 
                        : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            version.version === jobDesc.version ? 'text-primary-600' : 'text-gray-700'
                          }`}>
                            Version {version.version}
                          </span>
                          {version.version === jobDesc.version && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span>{version.changedBy}</span>
                      </div>
                      
                      {version.changeDescription && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {version.changeDescription}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No version history available</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
