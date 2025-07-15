import { useState, useEffect, useCallback } from 'react'
import './App.css'

// IndexedDB utilities
const DB_NAME = 'TallyCounterDB'
const DB_VERSION = 1
const STORE_NAME = 'counter'

interface CounterData {
  count: number
  limit: number
}

interface CatExplosion {
  id: string
  x: number
  y: number
  cats: Array<{
    id: string
    x: number
    y: number
    svgPath: string
  }>
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

const saveToIndexedDB = async (data: CounterData): Promise<void> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.put(data, 'counterData')
      request.onsuccess = () => {
        resolve()
      }
      request.onerror = () => {
        console.error('Error saving to IndexedDB:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error)
  }
}

const loadFromIndexedDB = async (): Promise<CounterData | null> => {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve) => {
      const request = store.get('counterData')
      request.onsuccess = () => {
        const result = request.result
        resolve(result || null)
      }
      request.onerror = () => {
        console.error('Error loading from IndexedDB:', request.error)
        resolve(null)
      }
    })
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error)
    return null
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [limit, setLimit] = useState(108)
  const [showSettings, setShowSettings] = useState(false)
  const [tempLimitInput, setTempLimitInput] = useState('108')
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [catExplosions, setCatExplosions] = useState<CatExplosion[]>([])

  // Calculate cycles and remainder based on count and limit
  const cycles = Math.floor(count / limit)
  const remainder = count % limit
  const displayCount = remainder === 0 && count > 0 ? limit : remainder

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      const savedData = await loadFromIndexedDB()
      if (savedData) {
        setCount(savedData.count)
        setLimit(savedData.limit)
        setTempLimitInput(savedData.limit.toString())
      }
      setIsDataLoaded(true)
    }
    loadData()
  }, [])

  // Save to IndexedDB whenever count or limit changes (only after initial load)
  useEffect(() => {
    if (!isDataLoaded) return // Don't save until we've loaded from IndexedDB
    
    const saveData = async () => {
      const dataToSave = { count, limit }
      await saveToIndexedDB(dataToSave)
    }
    
    saveData()
  }, [count, limit, isDataLoaded])

  // Vibrate function
  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      // More noticeable vibration pattern: long-short-long-short-long
      navigator.vibrate([300, 100, 300, 100, 300])
    }
  }, [])

  // Create cat explosion at touch location
  const createCatExplosion = useCallback((clientX: number, clientY: number) => {
    const catSvgs = ['/angry-cat.svg', '/cute-cat.svg', '/japanese-cat.svg']
    const explosionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const numCats = 12 // More cats for better effect
    const cats = Array.from({ length: numCats }, (_, i) => {
      const angle = (i * (360 / numCats)) * (Math.PI / 180) // Evenly distribute around circle
      const distance = 60 + Math.random() * 40 // Random distance between 60-100px
      const randomVariation = (Math.random() - 0.5) * 20 // Add some randomness
      
      return {
        id: `cat-${explosionId}-${i}`,
        x: Math.cos(angle) * distance + randomVariation,
        y: Math.sin(angle) * distance + randomVariation,
        svgPath: catSvgs[Math.floor(Math.random() * catSvgs.length)]
      }
    })
    
    const explosion: CatExplosion = {
      id: explosionId,
      x: clientX,
      y: clientY,
      cats
    }
    
    setCatExplosions(prev => [...prev, explosion])
    
    // Remove explosion after animation completes
    setTimeout(() => {
      setCatExplosions(prev => prev.filter(exp => exp.id !== explosionId))
    }, 2500)
  }, [])

  // Increment counter
  const increment = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1
      const newRemainder = newCount % limit
      // Vibrate only when completing a full cycle (remainder becomes 0)
      if (newRemainder === 0 && newCount > 0) {
        vibrate()
      }
      return newCount
    })
  }, [limit, vibrate])

  // Decrement counter
  const decrement = useCallback(() => {
    setCount(prev => Math.max(0, prev - 1))
  }, [])

  // Reset counter
  const reset = useCallback(() => {
    setCount(0)
  }, [])

  // Handle screen click (but not on buttons)
  const handleScreenClick = useCallback((e: React.MouseEvent) => {
    // Don't increment if clicking on buttons or settings
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('.settings') ||
        (e.target as HTMLElement).closest('.controls')) {
      return
    }
    
    // Create cat explosion at touch location
    createCatExplosion(e.clientX, e.clientY)
    
    increment()
  }, [increment, createCatExplosion])

  // Save limit settings
  const saveLimit = useCallback(() => {
    const newLimit = tempLimitInput === '' ? 1 : parseInt(tempLimitInput) || 1
    setLimit(newLimit)
    setTempLimitInput(newLimit.toString())
    setShowSettings(false)
  }, [tempLimitInput])

  // Handle input change for limit
  const handleLimitInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string or valid numbers (no leading zeros except for just "0")
    if (value === '' || (value === '0') || (/^[1-9]\d*$/.test(value))) {
      setTempLimitInput(value)
    }
  }, [])

  // Handle when settings modal opens
  const openSettings = useCallback(() => {
    setTempLimitInput(limit.toString())
    setShowSettings(true)
  }, [limit])

  return (
    <div className="app" onClick={handleScreenClick}>
      {/* Cat Explosions */}
      {catExplosions.map((explosion) => (
        <div
          key={explosion.id}
          className="cat-explosion"
          style={{
            left: explosion.x,
            top: explosion.y,
          }}
        >
          {explosion.cats.map((cat) => (
            <div
              key={cat.id}
              className="cat-item"
              style={{
                '--cat-x': `${cat.x}px`,
                '--cat-y': `${cat.y}px`
              } as React.CSSProperties}
            >
              <img 
                src={cat.svgPath} 
                alt="cat" 
                className="cat-svg"
                draggable={false}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings" onClick={(e) => e.stopPropagation()}>
          <div className="settings-content">
            <h3>Settings</h3>
            <div className="setting-item">
              <label htmlFor="limit">Limit:</label>
              <input
                id="limit"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={tempLimitInput}
                onChange={handleLimitInputChange}
                placeholder="Enter limit"
              />
            </div>
            <div className="settings-buttons">
              <button onClick={saveLimit}>Save</button>
              <button onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Display */}
      <div className="counter-display">
        {/* Luxury Cycles Display at Top */}
        <div className="cycles-luxury">
          <span className="cycles-label">CYCLES</span>
          <span className="cycles-number">{cycles}</span>
        </div>
        
        <div className="count">{displayCount}</div>
        
        <div className="limit-minimal">
          / {limit} {remainder === 0 && count > 0 && <span className="cycle-complete">●</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="controls" onClick={(e) => e.stopPropagation()}>
        <button className="minus-btn" onClick={decrement}>-</button>
        <button className="reset-btn" onClick={reset}>Reset</button>
        <button className="settings-btn" onClick={openSettings}>⚙️</button>
      </div>

      {/* Tap instruction */}
      <div className="instruction">Tap anywhere to count</div>
    </div>
  )
}

export default App
