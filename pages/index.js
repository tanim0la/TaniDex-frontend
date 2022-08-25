import { useState, useRef } from 'react'
import Body from '../components/Body'
import Header from '../components/Header'

export default function Home() {
  const [tab, setTab] = useState('')
  const [provider, setProvider] = useState()
  const childRef = useRef(null)

  const getTab = (tab) => {
    setTab(tab)
  }

  const getProvider = (provider) => {
    setProvider(provider)
  }

  const onConnect = () => {
    childRef.current.headerConnect()
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-red-100 via-red-50 p-5 font-mono">
      <Header tab={getTab} provider={getProvider} ref={childRef} />
      <Body tab={tab} provider={provider} onIndexConnect={onConnect} />
    </div>
  )
}
