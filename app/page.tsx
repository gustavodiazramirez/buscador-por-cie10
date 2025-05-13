"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { ChevronDown, ChevronUp, Search, X, Check } from "lucide-react"

type Diagnosis = {
  id: string | number
  code: string
  description?: string
  [key: string]: any
}

function formatDiagnosisText(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export default function Home() {
  const [term, setTerm] = useState("")
  const [results, setResults] = useState<Diagnosis[]>([])
  const [selected, setSelected] = useState<Diagnosis | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchDiagnoses = async (query: string | number | boolean) => {
    if (!query) {
      setResults([])
      return
    }

    const res = await fetch(`/api/diagnosis?term=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data)
    setCurrentIndex(0)
  }

  const handleSelect = (item: Diagnosis | null) => {
    setSelected(item)
    setIsOpen(false)
    setTerm("")
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const navigateUp = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (results.length > 0) {
      setCurrentIndex(results.length - 1)
    }
  }

  const navigateDown = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  // Calculate which results to show based on current index
  const visibleResults = results.slice(currentIndex, currentIndex + 3)
  const hasMoreAbove = currentIndex > 0
  const hasMoreBelow = currentIndex + 3 < results.length

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-semibold mb-6 text-center text-white">Buscador CIE-10</h1>

        <div className="relative w-full" ref={dropdownRef}>
          {/* Dropdown Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 text-left rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="flex-1 truncate">
              {selected ? (
                <div className="flex items-center">
                  <span className="font-medium text-blue-400 mr-2">{selected.code.toUpperCase()}</span>
                  {selected.description && (
                    <span className="text-gray-300 truncate">{formatDiagnosisText(selected.description)}</span>
                  )}
                </div>
              ) : (
                <span className="text-gray-400">Seleccionar diagnóstico</span>
              )}
            </div>
            <div className="flex items-center">
              {selected && (
                <button
                  onClick={clearSelection}
                  className="p-1 rounded-full hover:bg-gray-600 mr-1 text-gray-400 hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* Dropdown Content */}
          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-xl z-10 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-600 relative">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={(e) => {
                      setTerm(e.target.value)
                      searchDiagnoses(e.target.value)
                    }}
                    placeholder="Buscar diagnóstico..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {results.length === 0 && term ? (
                  <div className="p-4 text-center text-gray-400">No se encontraron resultados</div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">Comienza a escribir para buscar</div>
                ) : (
                  <>
                    {hasMoreAbove && (
                      <button
                        onClick={navigateUp}
                        className="w-full flex justify-center py-1 hover:bg-gray-600 text-gray-400"
                      >
                        <ChevronUp size={16} />
                      </button>
                    )}

                    <ul>
                      {visibleResults.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-600 transition border-b border-gray-600 last:border-b-0 flex items-center"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-blue-400">{item.code.toUpperCase()}</div>
                            {item.description && (
                              <div className="text-sm text-gray-300">{formatDiagnosisText(item.description)}</div>
                            )}
                          </div>
                          {selected?.id === item.id && <Check size={16} className="text-blue-400 ml-2" />}
                        </li>
                      ))}
                    </ul>

                    {hasMoreBelow && (
                      <button
                        onClick={navigateDown}
                        className="w-full flex justify-center py-1 hover:bg-gray-600 text-gray-400"
                      >
                        <ChevronDown size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
