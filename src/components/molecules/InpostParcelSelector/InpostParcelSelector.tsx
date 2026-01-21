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
  const [showMap, setShowMap] = useState(true)
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

  // Auto-load map when modal opens on Map tab
  useEffect(() => {
    if (isModalOpen && showMap && tokenStatus.geowidgetTokenAvailable && !geowidgetLoaded && !geowidgetLoading) {
      loadGeowidget()
    }
  }, [isModalOpen, showMap, tokenStatus.geowidgetTokenAvailable, geowidgetLoaded, geowidgetLoading, loadGeowidget])

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
        <div className="p-4 border border-amber-200 bg-amber-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-amber-900">{selectedParcel.machineName}</p>
              <p className="text-sm text-amber-700">{selectedParcel.machineAddress}</p>
              <p className="text-sm text-amber-700">{selectedParcel.machinePostCode} {selectedParcel.machineCity}</p>
            </div>
            <button
              onClick={handleOpenModal}
              className="text-sm text-plum hover:text-plum-light underline underline-offset-2 transition-colors shrink-0"
            >
              Zmień
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="inpost-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="inpost-modal-backdrop fixed inset-0 bg-black/60" onClick={handleCloseModal} />
          <div className="inpost-modal-container bg-cream-50 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-cream-200 bg-cream-100">
              <h2 className="text-lg font-medium text-plum tracking-wide">Wybierz paczkomat InPost</h2>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center text-plum-muted hover:text-plum hover:bg-cream-200 transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="inpost-modal-content flex-1 overflow-auto">
              {/* Tab Navigation */}
              <div className="flex border-b border-cream-200 bg-cream-100/50">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    showMap 
                      ? 'text-plum border-b-2 border-plum bg-cream-50' 
                      : 'text-plum-muted hover:text-plum'
                  } ${!tokenStatus.geowidgetTokenAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleTabSwitch(true)}
                  disabled={!tokenStatus.geowidgetTokenAvailable}
                >
                  Mapa
                  {!tokenStatus.geowidgetTokenAvailable && ' (niedostępna)'}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    !showMap 
                      ? 'text-plum border-b-2 border-plum bg-cream-50' 
                      : 'text-plum-muted hover:text-plum'
                  }`}
                  onClick={() => handleTabSwitch(false)}
                >
                  Wyszukiwanie
                </button>
              </div>

              {/* Search section */}
              {!showMap && (
                <div className="p-6">
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder="np. Warszawa, Kraków, 00-001, ul. Marszałkowska"
                        className="flex-1 px-4 py-3 bg-cream-50 border border-cream-300 text-plum placeholder:text-plum-muted focus:outline-none focus:border-plum transition-colors"
                        disabled={isLoading}
                      />
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-plum text-cream-50 text-sm font-medium hover:bg-plum-dark transition-colors disabled:bg-plum-muted disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        {isLoading ? <Spinner /> : "Szukaj"}
                      </button>
                    </div>
                  </form>
                  
                  <button 
                    className="w-full py-3 px-4 border border-plum text-plum text-sm font-medium hover:bg-plum hover:text-cream-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    onClick={handleFindNearby}
                    disabled={isLoadingNearby}
                  >
                    {isLoadingNearby ? <Spinner /> : "Znajdź paczkomaty w pobliżu"}
                  </button>

                  <div className="inpost-search-results">
                    {isLoading && (
                      <div className="flex justify-center items-center h-32 text-plum-muted">
                        <Spinner />
                        <p className="ml-2">Szukanie paczkomatów...</p>
                      </div>
                    )}
                    
                    {!isLoading && parcelList.length === 0 && !error && (
                      <div className="text-center py-12 text-plum-muted">
                        <div className="text-5xl mb-4">📦</div>
                        <div className="text-base font-medium mb-1">Wyszukaj paczkomaty</div>
                        <div className="text-sm">Wprowadź miasto, kod pocztowy lub adres</div>
                      </div>
                    )}
                    
                    {parcelList.length > 0 && (
                      <>
                        <div className="mb-4 text-sm text-plum-muted">
                          Znaleziono {parcelList.length} paczkomatów
                        </div>
                        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                          {parcelList.map(parcel => (
                            <li 
                              key={parcel.machineId} 
                              className="border border-cream-300 p-4 cursor-pointer transition-all duration-200 hover:border-plum hover:bg-cream-100"
                              onClick={() => handleSelectParcel(parcel)}
                            >
                              <div className="font-medium text-plum">{parcel.machineName}</div>
                              <div className="text-sm text-plum-muted mt-1">{parcel.machineAddress}</div>
                              <div className="text-sm text-plum-muted">{parcel.machinePostCode} {parcel.machineCity}</div>
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
                <div className="flex flex-col flex-1 min-h-0">
                  {geowidgetLoading && (
                    <div className="flex items-center justify-center flex-1 text-plum-muted">
                      <Spinner />
                      <span className="ml-2">Ładowanie mapy...</span>
                    </div>
                  )}
                  
                  {!geowidgetLoaded && !geowidgetLoading && (
                    <div className="flex items-center justify-center flex-1">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🗺️</div>
                        <button 
                          className="px-6 py-3 bg-plum text-cream-50 text-sm font-medium hover:bg-plum-dark transition-colors disabled:bg-plum-muted"
                          onClick={loadGeowidget}
                          disabled={geowidgetLoading}
                        >
                          Załaduj mapę
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {geowidgetLoaded && (
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="mx-4 mt-4 mb-2 p-3 bg-amber-50 border border-amber-200 text-sm text-amber-800 shrink-0">
                        <strong>Jak wybrać paczkomat:</strong> Kliknij na paczkomat na mapie, a następnie kliknij przycisk &quot;Wybierz&quot; w okienku informacyjnym.
                      </div>
                      <div className="relative flex-1 min-h-[600px] m-4 mt-2">
                        <InpostGeowidget
                          token={tokenStatus.geowidgetToken}
                          language="pl"
                          config="parcelcollect,modern,fullscreen"
                          onpoint="onPointSelect"
                          className="w-full h-full absolute inset-0"
                          style={{ border: '1px solid #DDD4C7' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
                  <div className="font-medium text-sm">Uwaga</div>
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