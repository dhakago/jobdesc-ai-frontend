import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { Building2, FileText, Sparkles, FileCheck, TrendingUp, Clock, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [companiesStats, setCompaniesStats] = useState([])
  const [departmentsStats, setDepartmentsStats] = useState([])
  const [levelsStats, setLevelsStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllStats()
  }, [])

  const loadAllStats = async () => {
    try {
      const [statsRes, companiesRes, deptsRes, levelsRes, activityRes] = await Promise.all([
        apiService.getStats(),
        apiService.getStatsByCompany(),
        apiService.getStatsByDepartment(),
        apiService.getStatsByLevel(),
        apiService.getRecentActivity()
      ])

      setStats(statsRes.data)
      setCompaniesStats(companiesRes.data)
      setDepartmentsStats(deptsRes.data)
      setLevelsStats(levelsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<FileText className="w-8 h-8" />}
          value={stats?.total || 0}
          label="Total Job Descriptions"
          color="bg-blue-500"
        />
        <StatsCard
          icon={<Sparkles className="w-8 h-8" />}
          value={stats?.aiGenerated || 0}
          label="AI Generated"
          color="bg-purple-500"
        />
        <StatsCard
          icon={<FileCheck className="w-8 h-8" />}
          value={stats?.approved || 0}
          label="Approved"
          color="bg-green-500"
        />
        <StatsCard
          icon={<TrendingUp className="w-8 h-8" />}
          value={stats?.draft || 0}
          label="Draft / Pending"
          color="bg-yellow-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Recent Activity
          </h3>
        </div>
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
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No recent activity</p>
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {activity.jobCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{activity.posisi}</span>
                        {activity.aiGenerated && (
                          <Sparkles className="w-4 h-4 text-purple-500" title="AI Generated" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {activity.company?.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activity.action === 'Created' ? 'bg-blue-100 text-blue-800' :
                        activity.action === 'Updated' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.action} (v{activity.version})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {activity.changedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Company/SBU */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Job Descriptions by SBU/PT
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companiesStats.map((company) => (
              <div
                key={company.id}
                className="p-4 bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {company.code}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {company.count}
                </div>
                <div className="text-sm text-gray-600">
                  {company.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* By Department & Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">By Department</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {departmentsStats.slice(0, 8).map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{dept.name}</div>
                    <div className="text-sm text-gray-500">{dept.company}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {dept.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Level */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">By Job Level</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {levelsStats.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-semibold text-gray-900">{level.name}</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {level.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ icon, value, label, color }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  )
}
