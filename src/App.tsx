import { useEffect, useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  // Initialize state from localStorage immediately
  const getInitialState = () => {
    try {
      const lastSentStr = localStorage.getItem('edping_lastSent')
      const nextSendStr = localStorage.getItem('edping_nextSend')
      
      if (lastSentStr && nextSendStr) {
        const lastSent = new Date(lastSentStr)
        const nextSend = new Date(nextSendStr)
        const now = new Date()
        
        // If nextSend has passed, return null to trigger immediate send
        if (nextSend.getTime() <= now.getTime()) {
          return { lastSent: null, nextSend: null }
        }
        
        return { lastSent, nextSend }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return { lastSent: null, nextSend: null }
  }

  const initialState = getInitialState()
  const [isReady, setIsReady] = useState(false)
  const [lastSentTime, setLastSentTime] = useState<Date | null>(initialState.lastSent)
  const [nextSendTime, setNextSendTime] = useState<Date | null>(initialState.nextSend)
  const [countdown, setCountdown] = useState<string>('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveToStorage = (lastSent: Date, nextSend: Date) => {
    try {
      localStorage.setItem('edping_lastSent', lastSent.toISOString())
      localStorage.setItem('edping_nextSend', nextSend.toISOString())
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const lastSentStr = localStorage.getItem('edping_lastSent')
      const nextSendStr = localStorage.getItem('edping_nextSend')
      
      if (lastSentStr && nextSendStr) {
        const lastSent = new Date(lastSentStr)
        const nextSend = new Date(nextSendStr)
        return { lastSent, nextSend }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
    return null
  }

  const sendMessage = useCallback(() => {
    const message = 'че там по проекту?'
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Haptic feedback
      tg.HapticFeedback.impactOccurred('light')
      
      // Send message to bot
      tg.sendData(message)
      
      // Update timestamps
      const now = new Date()
      const next = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes
      setLastSentTime(now)
      setNextSendTime(next)
      saveToStorage(now, next)
    } else {
      // For development/testing outside Telegram
      console.log('Message to send:', message)
      const now = new Date()
      const next = new Date(now.getTime() + 15 * 60 * 1000)
      setLastSentTime(now)
      setNextSendTime(next)
      saveToStorage(now, next)
    }
  }, [])

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Expand the app to full height
      tg.expand()
      
      // Set theme colors
      tg.setHeaderColor(tg.themeParams.bg_color || '#ffffff')
      tg.setBackgroundColor(tg.themeParams.bg_color || '#ffffff')
      
      // Mark app as ready
      tg.ready()
      setIsReady(true)

      // Setup Back Button
      tg.BackButton.onClick(() => {
        tg.close()
      })
      tg.BackButton.show()

      // Listen to theme changes
      tg.onEvent('themeChanged', () => {
        tg.setHeaderColor(tg.themeParams.bg_color || '#ffffff')
        tg.setBackgroundColor(tg.themeParams.bg_color || '#ffffff')
      })
    } else {
      // For development/testing outside Telegram
      setIsReady(true)
    }

    // Load persisted state from localStorage
    const stored = loadFromStorage()
    const now = new Date()

    const scheduleNextSend = () => {
      // Clear any existing timeouts/intervals
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (stored) {
        const { nextSend } = stored
        
        // Check if the next send time has passed
        if (nextSend.getTime() <= now.getTime()) {
          // Time has passed, send immediately and set new timer
          sendMessage()
          // Schedule the next send in 15 minutes
          timeoutRef.current = setTimeout(() => {
            sendMessage()
            // After first send, set up interval for subsequent sends
            intervalRef.current = setInterval(() => {
              sendMessage()
            }, 15 * 60 * 1000)
          }, 15 * 60 * 1000)
        } else {
          // Continue from stored time - calculate remaining time
          const remainingTime = nextSend.getTime() - now.getTime()
          
          // Schedule send at the stored nextSend time
          timeoutRef.current = setTimeout(() => {
            sendMessage()
            // After first send, set up interval for subsequent sends
            intervalRef.current = setInterval(() => {
              sendMessage()
            }, 15 * 60 * 1000)
          }, remainingTime)
        }
      } else {
        // No stored data, send first message immediately
        sendMessage()
        // Schedule the next send in 15 minutes
        timeoutRef.current = setTimeout(() => {
          sendMessage()
          // After first send, set up interval for subsequent sends
          intervalRef.current = setInterval(() => {
            sendMessage()
          }, 15 * 60 * 1000)
        }, 15 * 60 * 1000)
      }
    }

    scheduleNextSend()

    // Cleanup interval on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [sendMessage])

  // Update countdown timer every second
  useEffect(() => {
    if (!nextSendTime) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = nextSendTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown('Sending soon...')
        return
      }
      
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    // Update immediately
    updateCountdown()

    // Update every second
    countdownRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [nextSendTime])

  if (!isReady) {
    return (
      <div className="app">
        <div className="loading">Initializing...</div>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }


  return (
    <div className="app">
      <div className="welcome-container">
        <div className="icon-wrapper">
          <span className="icon">👋</span>
        </div>
        <h1 className="welcome-title">Welcome!</h1>
        <p className="main-text">This application is created to ping Ed</p>
        <div className="divider"></div>
        <div className="status-section">
          <div className="status-item">
            <span className="status-label">Auto-sending:</span>
            <span className="status-value active">Active</span>
          </div>
          {lastSentTime && (
            <div className="status-item">
              <span className="status-label">Last sent:</span>
              <span className="status-value">{formatTime(lastSentTime)}</span>
            </div>
          )}
          {nextSendTime && (
            <div className="status-item">
              <span className="status-label">Next in:</span>
              <span className="status-value countdown">{countdown || 'Calculating...'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
