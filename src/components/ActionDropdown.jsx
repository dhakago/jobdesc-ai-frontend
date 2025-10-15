import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ActionDropdown({ trigger, children, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}>
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ icon: Icon, label, onClick, variant = 'default' }) {
  const variants = {
    default: 'text-gray-700 hover:bg-gray-50',
    success: 'text-green-700 hover:bg-green-50',
    danger: 'text-red-700 hover:bg-red-50',
    primary: 'text-blue-700 hover:bg-blue-50'
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left flex items-center gap-3 ${variants[variant]} transition-colors`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
