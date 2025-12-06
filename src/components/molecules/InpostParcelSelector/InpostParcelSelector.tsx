"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/atoms"
import { Spinner } from "@/components/atoms/Spinner/Spinner"
import { InpostGeowidget } from "@/components/atoms/InpostGeowidget/InpostGeowidget"
import { 
  searchParcelMachines, 
  getNearbyParcelMachines, 
  InpostParcelData,
  getTokensStatus,
  loadGeowidgetResources,
  setupPointSelectionHandler,
  cleanupGeowidget
} from "@/lib/services/inpost-api"
import "./inpost-map.css"

type InpostParcelSelectorProps = {
  onSelect: (parcelData: InpostParcelData) => void
  initialValue?: InpostParcelData | null
}

export const InpostParcelSelector: React.FC<InpostParcelSelectorProps> = ({
  onSelect,
  initialValue,
}) => {
  const [selectedParcel, setSelectedParcel] = useState<InpostParcelData | null>(initialValue || null)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [parcelList, setParcelList] = useState<InpostParcelData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [geowidgetLoaded, setGeowidgetLoaded] = useState(false)
  const [geowidgetLoading, setGeowidgetLoading] = useState(false)
  
  const [tokenStatus] = useState(getTokensStatus())
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  const handleSelectParcel = useCallback((parcel: InpostParcelData) => {
  
    setSelectedParcel(parcel)
    onSelect(parcel)
    setIsModalOpen(false)
  }, [onSelect])

  const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError('Wprowadź nazwę miejscowości lub adres.')
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      const results = await searchParcelMachines(searchQuery)
      setParcelList(results)
      
      if (results.length === 0) {
        setError('Nie znaleziono paczkomatów. Spróbuj innego zapytania.')
      }
    } catch (error) {
      console.error('Error searching for parcel machines:', error)
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length > 2) {
        handleSearch({ preventDefault: () => {} } as any);
      }
    }, 500);
  }, [handleSearch]);

  const handleFindNearby = useCallback(async () => {
    setIsLoadingNearby(true)
    setError(null)
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })
      
      const results = await getNearbyParcelMachines(position.coords.latitude, position.coords.longitude)
      setParcelList(results)
      
      if (results.length === 0) {
        setError('Nie znaleziono paczkomatów w pobliżu.')
      }
    } catch (error) {
      console.error('Error finding nearby parcel machines:', error)
      setError('Nie udało się znaleźć paczkomatów w pobliżu. Sprawdź czy lokalizacja jest włączona.')
    } finally {
      setIsLoadingNearby(false)
    }
  }, [])

  const loadGeowidget = useCallback(async () => {
    if (geowidgetLoaded || geowidgetLoading || !tokenStatus.geowidgetTokenAvailable) {
      return
    }
    
    setGeowidgetLoading(true)
    setError(null)
    
    try {
      await loadGeowidgetResources()
      setupPointSelectionHandler((pointData: any) => {
        if (pointData && pointData.name) {
          const parcelData: InpostParcelData = {
            machineId: pointData.name,
            machineName: pointData.name,
            machineAddress: pointData.address.line1,
            machinePostCode: pointData.address.line2?.split(' ')[0] || '',
            machineCity: pointData.address.line2?.split(' ').slice(1).join(' ') || ''
            // Removed machineType as it's not in the interface
            // Additional data can be added to metadata if needed
          }
          handleSelectParcel(parcelData)
        }
      })
      setGeowidgetLoaded(true)
    } catch (error) {
      console.error('Error loading geowidget:', error)
      setError('Nie udało się załadować mapy. Spróbuj ponownie później.')
    } finally {
      setGeowidgetLoading(false)
    }
  }, [geowidgetLoaded, geowidgetLoading, tokenStatus.geowidgetTokenAvailable, handleSelectParcel])

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
    setError(null)
    setParcelList([])
    setSearchQuery('')
    setShowMap(false)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setError(null)
    setSearchQuery("")
    setParcelList([])
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const handleTabSwitch = useCallback((isMapTab: boolean) => {
    setShowMap(isMapTab)
    setError(null)
    
    if (isMapTab && tokenStatus.geowidgetTokenAvailable && !geowidgetLoaded) {
      loadGeowidget()
    }
  }, [tokenStatus.geowidgetTokenAvailable, geowidgetLoaded, loadGeowidget])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      cleanupGeowidget()
    }
  }, [])

  // No longer automatically opening modal - controlled by parent component
  
  return (
    <div className="mt-4">
      {selectedParcel && (
        <div className="p-4 border rounded mb-4 bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-green-800">📦 {selectedParcel.machineName}</p>
              <p className="text-sm text-green-700">{selectedParcel.machineAddress}</p>
              <p className="text-sm text-green-700">{selectedParcel.machinePostCode} {selectedParcel.machineCity}</p>
            </div>
            <Button
              variant="tonal"
              size="small"
              onClick={handleOpenModal}
            >
              Zmień
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="inpost-modal-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="inpost-modal-backdrop fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />
          <div className="inpost-modal-container bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10">
            <div className="inpost-modal-header flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Wybierz paczkomat InPost</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="inpost-modal-content flex-1 overflow-auto p-4">
              {/* Tab Navigation */}
              <div className="flex mb-3 border-b flex-shrink-0">
                <button
                  className={`px-4 py-2 font-medium ${!showMap ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => handleTabSwitch(false)}
                >
                  🔍 Wyszukiwanie
                </button>
                <button
                  className={`px-4 py-2 font-medium ${showMap ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => handleTabSwitch(true)}
                  disabled={!tokenStatus.geowidgetTokenAvailable}
                >
                  🗺️ Mapa
                  {!tokenStatus.geowidgetTokenAvailable && ' (niedostępna)'}
                </button>
              </div>

              {/* Search section */}
              {!showMap && (
                <div className="inpost-search-content">
                  <h3 className="text-lg font-medium mb-3">🔍 Wyszukaj paczkomat</h3>
                  
                  <form onSubmit={handleSearch} className="flex-shrink-0">
                    <div className="flex mb-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder="np. Warszawa, Kraków, 00-001, ul. Marszałkowska"
                        className="flex-1 p-3 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        variant="filled" 
                        className="rounded-l-none px-6"
                        disabled={isLoading}
                      >
                        {isLoading ? <Spinner /> : "Szukaj"}
                      </Button>
                    </div>
                  </form>
                  
                  <Button 
                    variant="tonal" 
                    className="w-full mb-4 flex-shrink-0"
                    onClick={handleFindNearby}
                    disabled={isLoadingNearby}
                  >
                    {isLoadingNearby ? <Spinner /> : "📍 Znajdź paczkomaty w pobliżu"}
                  </Button>

                  <div className="inpost-search-results">
                    {isLoading && (
                      <div className="flex justify-center items-center h-32">
                        <Spinner />
                        <p className="ml-2">Szukanie paczkomatów...</p>
                      </div>
                    )}
                    
                    {!isLoading && parcelList.length === 0 && !error && (
                      <div className="text-center my-8 text-gray-500">
                        <div className="text-6xl mb-4">📦</div>
                        <div className="text-lg font-medium mb-2">Wyszukaj paczkomaty</div>
                        <div className="text-sm">Wprowadź miasto, kod pocztowy lub adres</div>
                      </div>
                    )}
                    
                    {parcelList.length > 0 && (
                      <>
                        <div className="mb-3 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded">
                          📋 Znaleziono {parcelList.length} paczkomatów
                        </div>
                        <ul className="space-y-2">
                          {parcelList.map(parcel => (
                            <li 
                              key={parcel.machineId} 
                              className="border p-4 hover:bg-blue-50 cursor-pointer rounded-lg transition-all duration-200 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                              onClick={() => handleSelectParcel(parcel)}
                            >
                              <div className="font-bold text-blue-600 text-lg">📦 {parcel.machineName}</div>
                              <div className="text-sm text-gray-600 mt-1">📍 {parcel.machineAddress}</div>
                              <div className="text-sm text-gray-600">🏙️ {parcel.machinePostCode} {parcel.machineCity}</div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Map section */}
              {showMap && tokenStatus.geowidgetTokenAvailable && (
                <div className="inpost-map-content">
                  {geowidgetLoading && (
                    <div className="flex items-center justify-center h-96">
                      <Spinner />
                      <span className="ml-2">Ładowanie mapy...</span>
                    </div>
                  )}
                  
                  {!geowidgetLoaded && !geowidgetLoading && (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center text-gray-600">
                        <div className="text-3xl mb-2">🗺️</div>
                        <Button 
                          variant="filled" 
                          onClick={loadGeowidget}
                          disabled={geowidgetLoading}
                        >
                          Załaduj mapę
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {geowidgetLoaded && (
                    <div className="geowidget-container h-full flex flex-col">
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        💡 <strong>Jak wybrać paczkomat:</strong> Kliknij na paczkomat na mapie, a następnie kliknij przycisk &quot;Wybierz&quot; w okienku informacyjnym.
                      </div>
                      <div className="relative flex-1 min-h-[500px]">
                        <InpostGeowidget
                          token={tokenStatus.geowidgetToken}
                          language="pl"
                          config="parcelcollect,modern,fullscreen"
                          onpoint="onPointSelect"
                          className="w-full h-full absolute inset-0"
                          style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="text-red-600 p-3 bg-red-50 rounded border border-red-200 flex-shrink-0 mt-2">
                  <div className="font-medium">⚠️ Uwaga</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InpostParcelSelector