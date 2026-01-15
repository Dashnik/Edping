import { useEffect, useState, useRef } from 'react'
import './App.css'

function App() {
  const [isReady, setIsReady] = useState(false)
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null)
  const [nextSendTime, setNextSendTime] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const sendMessage = () => {
    const message = 'че там по проекту?'
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Haptic feedback
      tg.HapticFeedback.impactOccurred('light')
      
      // Send message to bot
      tg.sendData(message)
      
      // Update timestamps
      const now = new Date()
      setLastSentTime(now)
      const next = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes
      setNextSendTime(next)
    } else {
      // For development/testing outside Telegram
      console.log('Message to send:', message)
      const now = new Date()
      setLastSentTime(now)
      const next = new Date(now.getTime() + 15 * 60 * 1000)
      setNextSendTime(next)
    }
  }

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

    // Send first message immediately
    sendMessage()

    // Set up interval to send message every 15 minutes (900000 ms)
    intervalRef.current = setInterval(() => {
      sendMessage()
    }, 15 * 60 * 1000)

    // Calculate next send time
    const next = new Date(Date.now() + 15 * 60 * 1000)
    setNextSendTime(next)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

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
