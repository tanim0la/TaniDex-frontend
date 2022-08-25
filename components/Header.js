import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import Web3Modal from 'web3modal'
import Head from 'next/head'
import { ethers } from 'ethers'
import Image from 'next/image'
import eth from '../public/eth.png'

const providerOptions = {}

const Header = forwardRef((props, ref) => {
  const [tab, setTab] = useState('swap')
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('Connect Wallet')
  const web3Modal = useRef()

  useEffect(() => {
    props.tab(tab)
    const onConnect = async () => {
      if (!connected) {
        web3Modal.current = new Web3Modal({
          cacheProvider: false,
          network: 'rinkeby',
          providerOptions,
        })
        if (
          typeof window !== 'undefined' &&
          typeof window.ethereum !== 'undefined'
        ) {
          let accounts = await ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts[0]) {
            connectWallet()
            setAddress(accounts[0])
            setConnected(true)
          }
        }
      }
    }
    onConnect()
  }, [connected])

  useImperativeHandle(ref, () => ({
    headerConnect() {
      connectWallet()
    },
  }))

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const web3ModalInstance = await web3Modal.current.connect()
      const web3ModalProvider = new ethers.providers.Web3Provider(
        web3ModalInstance,
      )
      const { chainId } = await web3ModalProvider.getNetwork()
      if (chainId !== 4) {
        window.alert('Change the network to Rinkeby')
        throw new Error('Change network to Rinkeby')
      }

      if (needSigner) {
        const signer = web3ModalProvider.getSigner()
        return signer
      }
      return web3ModalProvider
    } catch (err) {
      console.log(err.message)
    }
  }

  const connectWallet = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      try {
        const provider = await getProviderOrSigner()

        props.provider(provider)
        const accounts = await provider.listAccounts()
        setAddress(accounts[0])
        setConnected(true)
      } catch (err) {
        console.log(err.message)
      }
    } else {
      console.log('No Metamask')
    }
  }

  const handleTab = (newTab) => {
    setTab(newTab)
    props.tab(newTab)
  }

  return (
    <div>
      <Head>
        <title>Tani DEX</title>
        <meta name="description" content="Tani DEX" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-between lg:pb-10">
        <div className="flex lg:flex-row">
          <div className="p-3 text-gray-700">
            <span>Tani</span>
            <span className="text-xl">DEX</span>
          </div>
          <div className="absolute bottom-0 right-0 px-10 pb-10 w-full flex justify-center lg:relative lg:justify-start lg:w-fit">
            <div className="flex flex-row py-1 justify-evenly text-gray-700 text-lg border bg-white w-72 rounded-2xl border-gray-300">
              <button
                onClick={() => handleTab('swap')}
                className={
                  tab == 'swap'
                    ? 'py-1 px-6 rounded-2xl bg-gray-200 font-semibold'
                    : 'py-1 px-6 rounded-2xl'
                }
              >
                Swap
              </button>
              <button
                onClick={() => handleTab('liquidity')}
                className={
                  tab == 'liquidity'
                    ? 'py-1 px-6 rounded-2xl bg-gray-200 font-semibold'
                    : 'py-1 px-6 rounded-2xl'
                }
              >
                Liquidity
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row lg:pb-10">
          <div className="flex flex-row bg-white mr-2 p-3 rounded-xl text-gray-700">
            <div className="h-7 w-7">
              <Image src={eth} />
            </div>
            <span className="hidden mt-1 sm:inline">Rinkeby</span>
          </div>
          {address.length > 40 ? (
            <button
              onClick={connectWallet}
              className="bg-red-200 p-2 border-2 rounded-2xl border-white text-red-700 hover:bg-red-300"
            >
              {address.slice(0, 5) + '...' + address.slice(37, 42)}
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-red-200 p-2 border-2 rounded-2xl border-white text-red-700 hover:bg-red-300"
            >
              {address}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default Header
