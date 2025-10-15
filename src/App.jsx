import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './components/Dashboard/Dashboard'
import CreateJobDesc from './components/CreateJobDesc/CreateJobDesc'
import Library from './components/Library/Library'
import Settings from './components/Settings/Settings'
import { LayoutDashboard, PlusCircle, BookOpen, Settings as SettingsIcon } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', name: 'Create Job Desc', icon: PlusCircle },
    { id: 'library', name: 'Library', icon: BookOpen },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Job Description AI System</h1>
          <p className="text-primary-100 mt-1">ATT Group</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'create' && <CreateJobDesc onNavigateToSettings={() => setActiveTab('settings')} />}
        {activeTab === 'library' && <Library />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
