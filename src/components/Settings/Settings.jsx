import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import { Building2, Users, FileText, Plus, Edit2, Trash2, Loader2, Layers, Search, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('companies')
  
  // Filters for divisions/departments
  const [filters, setFilters] = useState({
    companyId: '',
    search: '',
    isActive: ''
  })
  
  // Company form
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyForm, setCompanyForm] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  })

  // Division/Department form
  const [showAddDivDept, setShowAddDivDept] = useState(false)
  const [editingDivDept, setEditingDivDept] = useState(null)
  const [divDeptForm, setDivDeptForm] = useState({
    type: 'division', // 'division' or 'department'
    companyId: '',
    code: '',
    name: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...departments]
    
    if (filters.companyId) {
      filtered = filtered.filter(d => d.companyId === filters.companyId)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.code.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.isActive !== '') {
      const isActive = filters.isActive === 'true'
      filtered = filtered.filter(d => d.isActive === isActive)
    }
    
    return filtered
  }, [departments, filters])

  useEffect(() => {
    if (activeTab === 'divisions') {
      applyFilters()
    }
  }, [filters, activeTab, applyFilters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [companiesRes, deptsRes] = await Promise.all([
        apiService.getCompanies(),
        apiService.getDepartments(),
      ])
      
      setCompanies(companiesRes.data)
      
      // Separate divisions and departments
      const allDepts = deptsRes.data
      
      setDepartments(allDepts)
      
      try {
        const templatesRes = await apiService.getTemplates()
        setTemplates(templatesRes.data)
      } catch {
        setTemplates([{
          id: 'default',
          name: 'ATT Standard Template',
          description: 'Default job description template',
          isDefault: true
        }])
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      companyId: '',
      search: '',
      isActive: ''
    })
  }

  // Company handlers
  const handleAddCompany = async () => {
    if (!companyForm.code || !companyForm.name) {
      toast.error('Code and name are required')
      return
    }

    try {
      await apiService.createCompany(companyForm)
      toast.success('Company added successfully!')
      setShowAddCompany(false)
      setCompanyForm({ code: '', name: '', description: '', isActive: true })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add company')
    }
  }

  const handleUpdateCompany = async () => {
    try {
      await apiService.updateCompany(editingCompany.id, companyForm)
      toast.success('Company updated successfully!')
      setEditingCompany(null)
      setCompanyForm({ code: '', name: '', description: '', isActive: true })
      loadData()
    } catch {
      toast.error('Failed to update company')
    }
  }

  const handleDeleteCompany = async (id, name) => {
    if (!confirm(`Delete company "${name}"? This action cannot be undone.`)) return

    try {
      await apiService.deleteCompany(id)
      toast.success('Company deleted successfully!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete company')
    }
  }

  const startEditCompany = (company) => {
    setEditingCompany(company)
    setCompanyForm({
      code: company.code,
      name: company.name,
      description: company.description || '',
      isActive: company.isActive
    })
    setShowAddCompany(true)
  }

  // Division/Department handlers
  const handleAddDivDept = async () => {
    if (!divDeptForm.companyId || !divDeptForm.code || !divDeptForm.name) {
      toast.error('Company, code, and name are required')
      return
    }

    try {
      await apiService.createDepartment(divDeptForm)
      toast.success(`${divDeptForm.type === 'division' ? 'Division' : 'Department'} added successfully!`)
      setShowAddDivDept(false)
      setDivDeptForm({ type: 'division', companyId: '', code: '', name: '', description: '', isActive: true })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add')
    }
  }

  const handleUpdateDivDept = async () => {
    try {
      await apiService.updateDepartment(editingDivDept.id, {
        name: divDeptForm.name,
        description: divDeptForm.description,
        isActive: divDeptForm.isActive
      })
      toast.success('Updated successfully!')
      setEditingDivDept(null)
      setDivDeptForm({ type: 'division', companyId: '', code: '', name: '', description: '', isActive: true })
      loadData()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDeleteDivDept = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return

    try {
      await apiService.deleteDepartment(id)
      toast.success('Deleted successfully!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete')
    }
  }

  const startEditDivDept = (item, type) => {
    setEditingDivDept(item)
    setDivDeptForm({
      type,
      companyId: item.companyId,
      code: item.code,
      name: item.name,
      description: item.description || '',
      isActive: item.isActive
    })
    setShowAddDivDept(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    )
  }

  const filteredDivDepts = applyFilters()

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'companies'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Companies / SBU
            </button>
            <button
              onClick={() => setActiveTab('divisions')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'divisions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              Divisions & Departments
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'templates'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </button>
          </nav>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold">Companies / SBU Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage all companies in ATT Group</p>
              </div>
              <button
                onClick={() => {
                  setShowAddCompany(true)
                  setEditingCompany(null)
                  setCompanyForm({ code: '', name: '', description: '', isActive: true })
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>

            {showAddCompany && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold mb-4">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Company Code *
                    </label>
                    <input
                      type="text"
                      value={companyForm.code}
                      onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., ATT"
                      className="input"
                      disabled={editingCompany}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="e.g., PT Anugerah Tangkas Tama"
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    placeholder="Company description"
                    rows={2}
                    className="input resize-none"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={companyForm.isActive}
                    onChange={(e) => setCompanyForm({ ...companyForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-gray-700">Active</label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
                    className="btn btn-primary"
                  >
                    {editingCompany ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCompany(false)
                      setEditingCompany(null)
                      setCompanyForm({ code: '', name: '', description: '', isActive: true })
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-gray-900 text-lg">{company.code}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        company.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-gray-900 mt-1">{company.name}</div>
                    {company.description && (
                      <div className="text-sm text-gray-600 mt-1">{company.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditCompany(company)}
                      className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divisions & Departments Tab */}
        {activeTab === 'divisions' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold">Division & Department Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage all divisions and departments</p>
              </div>
              <button
                onClick={() => {
                  setShowAddDivDept(true)
                  setEditingDivDept(null)
                  setDivDeptForm({ type: 'division', companyId: '', code: '', name: '', description: '', isActive: true })
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Division/Department
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Filters</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    value={filters.companyId}
                    onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
                    className="input"
                  >
                    <option value="">All Companies</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Search name or code..."
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                    className="input"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {showAddDivDept && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold mb-4">
                  {editingDivDept ? 'Edit' : 'Add New'} Division/Department
                </h4>
                
                {/* Type Selection */}
                {!editingDivDept && (
                  <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="division"
                          checked={divDeptForm.type === 'division'}
                          onChange={(e) => setDivDeptForm({ ...divDeptForm, type: e.target.value })}
                          className="rounded"
                        />
                        <span>Division</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="department"
                          checked={divDeptForm.type === 'department'}
                          onChange={(e) => setDivDeptForm({ ...divDeptForm, type: e.target.value })}
                          className="rounded"
                        />
                        <span>Department</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Company *
                    </label>
                    <select
                      value={divDeptForm.companyId}
                      onChange={(e) => setDivDeptForm({ ...divDeptForm, companyId: e.target.value })}
                      className="input"
                      disabled={editingDivDept}
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.code} - {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={divDeptForm.code}
                      onChange={(e) => setDivDeptForm({ ...divDeptForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., HRD"
                      className="input"
                      disabled={editingDivDept}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={divDeptForm.name}
                      onChange={(e) => setDivDeptForm({ ...divDeptForm, name: e.target.value })}
                      placeholder={divDeptForm.type === 'division' ? 'e.g., Human Capital & General Affairs' : 'e.g., Human Resources'}
                      className="input"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={divDeptForm.description}
                    onChange={(e) => setDivDeptForm({ ...divDeptForm, description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="input resize-none"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={divDeptForm.isActive}
                    onChange={(e) => setDivDeptForm({ ...divDeptForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-gray-700">Active</label>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={editingDivDept ? handleUpdateDivDept : handleAddDivDept}
                    className="btn btn-primary"
                  >
                    {editingDivDept ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddDivDept(false)
                      setEditingDivDept(null)
                      setDivDeptForm({ type: 'division', companyId: '', code: '', name: '', description: '', isActive: true })
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredDivDepts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No divisions or departments found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or add a new one</p>
                </div>
              ) : (
                filteredDivDepts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-900">{item.code}</div>
                        <span className="text-sm text-gray-600">•</span>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {item.code.includes('DIV') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            Division
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Company: {item.company?.name || 'N/A'}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditDivDept(item, item.code.includes('DIV') ? 'division' : 'department')}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDivDept(item.id, item.name)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <h3 className="font-bold mb-4">Job Description Templates</h3>
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{template.name}</div>
                  {template.isDefault && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-semibold">
                      Default
                    </span>
                  )}
                </div>
                {template.description && (
                  <div className="text-sm text-gray-600 mb-3">{template.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <h3 className="font-bold mb-4">User Management</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-bold">Admin ATT</div>
                  <div className="text-sm text-gray-600">admin@att.co.id</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    Admin
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary">+ Add New User</button>
          </div>
        )}
      </div>
    </div>
  )
}
