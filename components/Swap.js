import { useEffect, useState } from 'react'
import Image from 'next/image'
import eth from '../public/eth.png'
import { HiSwitchVertical, HiOutlineCog } from 'react-icons/hi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BigNumber, utils } from 'ethers'
import {
  getEtherBalance,
  getGouTokensBalance,
  getReserveOfGouTokens,
} from '../utils/getAmounts'
import { getAmountOfTokensReceivedFromSwap, swapTokens } from '../utils/swap'

function Swap(props) {
  const zero = BigNumber.from(0)
  const [firsttoken, setFirsttoken] = useState('ETH')
  const [secondtoken, setSecondtoken] = useState('GOU')
  const [showEthbal, setShowethbal] = useState('')
  const [showGoubal, setShowgoubal] = useState('')
  const [ethReserve, setEthReserve] = useState(zero)
  const [reservedGOU, setReserveGOU] = useState(zero)
  const [firstvalue, setFirstvalue] = useState('')
  const [secondvalue, setSecondvalue] = useState('')
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (props.provider) {
      ;(async () => {
        setConnected(true)
        getAmounts()
      })()
    }
  }, [props.provider, loading])

  const getAmounts = async () => {
    const addy = await props.provider.listAccounts()

    const _ethBalance = await getEtherBalance(props.provider, addy[0])
    const _gouBalance = await getGouTokensBalance(props.provider, addy[0])
    const _ethReserve = await getEtherBalance(props.provider, null, true)
    const _reserveGOU = await getReserveOfGouTokens(props.provider)

    setEthReserve(_ethReserve)
    setReserveGOU(_reserveGOU)

    let showEth = (+utils.formatEther(_ethBalance)).toFixed(5)
    let showGou = (+utils.formatEther(_gouBalance)).toFixed(2)

    if (flip) {
      setShowethbal(showGou)
      setShowgoubal(showEth)
    } else {
      setShowethbal(showEth)
      setShowgoubal(showGou)
    }
  }

  const onConnect = () => {
    props.onSwapConnect()
  }

  const onSwap = async () => {
    try {
      setLoading(true)
      if (firsttoken == 'ETH') {
        if (firstvalue) {
          const firstvalueInWei = utils.parseUnits(firstvalue, 'ether')
          const secondvalueInWei = utils.parseUnits(secondvalue, 'ether')

          await swapTokens(
            props.provider.getSigner(),
            firstvalueInWei,
            secondvalueInWei,
            true,
          )
        }
      } else {
        const firstvalueInWei = utils.parseUnits(firstvalue, 'ether')
        const secondvalueInWei = utils.parseUnits(secondvalue, 'ether')

        await swapTokens(
          props.provider.getSigner(),
          firstvalueInWei,
          secondvalueInWei,
          false,
        )
      }
      setLoading(false)
      setFirstvalue('')
      setSecondvalue('')
    } catch (err) {
      setLoading(false)
      setFirstvalue('')
      setSecondvalue('')
      console.log(err.message)
    }
  }

  const toReceive = async (value) => {
    if (value.toUpperCase() != value.toLowerCase()) {
    } else {
      setFirstvalue(value)

      try {
        const valueToWei = utils.parseUnits(value, 'ether')
        if (firsttoken == 'ETH') {
          const amountToReceive = await getAmountOfTokensReceivedFromSwap(
            valueToWei,
            props.provider,
            true,
            ethReserve,
            reservedGOU,
          )

          setSecondvalue(utils.formatEther(amountToReceive))
        } else {
          const amountToReceive = await getAmountOfTokensReceivedFromSwap(
            valueToWei,
            props.provider,
            false,
            ethReserve,
            reservedGOU,
          )
          setSecondvalue(utils.formatEther(amountToReceive))
        }
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  const onFlip = () => {
    setFlip(!flip)
    setFirsttoken(secondtoken)
    setSecondtoken(firsttoken)
    setFirstvalue(secondvalue)
    setSecondvalue(firstvalue)
    setShowethbal(showGoubal)
    setShowgoubal(showEthbal)
  }

  return (
    <div className="flex justify-center">
      <div className=" h-fit w-fit bg-white mt-14 p-3 rounded-2xl drop-shadow-2xl lg:mt-4">
        <div className="flex justify-between mb-3 px-2">
          <span className="font-semibold">Swap</span>
          <span className="text-2xl">
            <HiOutlineCog />
          </span>
        </div>
        <div className="flex flex-row bg-gray-50 w-full rounded-2xl">
          <input
            className="bg-transparent px-3 focus:outline-none w-full text-xl"
            placeholder="0.0"
            onChange={(e) => toReceive(e.target.value)}
            value={firstvalue}
          />
          <div className="flex flex-col">
            <div className="flex flex-row bg-gray-100 mx-2 my-4 mb-4 px-3 py-1 rounded-3xl">
              <div className="h-7 w-7">
                <Image src={eth} />
              </div>
              <span className="text-lg mt-0">{firsttoken}</span>
            </div>
            <span className="text-xs mb-2 text-end pr-3">
              bal: {showEthbal ? showEthbal : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <button
            onClick={onFlip}
            className=" bg-gray-50 p-2 -mt-4 rounded-xl border-4 border-white text-lg"
          >
            <HiSwitchVertical />
          </button>
        </div>
        <div className="flex flex-row bg-gray-50 w-full rounded-2xl -mt-4">
          <input
            className="bg-transparent px-3 focus:outline-none w-full text-xl"
            placeholder="0.0"
            disabled={true}
            onChange={(e) => setSecondvalue(e.target.value)}
            value={secondvalue}
          />
          <div className="flex flex-col">
            <div className="flex flex-row bg-gray-100 mx-2 my-4 mb-4 px-3 py-1 rounded-3xl">
              <div className="h-7 w-7">
                <Image src={eth} />
              </div>
              <span className="text-lg mt-0">{secondtoken}</span>
            </div>
            <span className="text-xs mb-2 text-end pr-3">
              bal: {showGoubal ? showGoubal : '0.0'}
            </span>
          </div>
        </div>
        {connected ? (
          <button
            onClick={onSwap}
            className="flex flex-row justify-center text-center w-full bg-red-200 text-red-700 my-3 py-4 rounded-2xl hover:bg-red-300"
          >
            <svg
              className={
                loading
                  ? 'animate-spin h-5 w-5 mr-3 font-bold'
                  : 'animate-spin h-5 w-5 mr-3 font-bold hidden'
              }
              viewBox="0 0 16 16"
            >
              <AiOutlineLoading3Quarters />
            </svg>
            <span>Swap</span>
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="text-center w-full bg-red-200 text-red-700 my-3 py-4 rounded-2xl hover:bg-red-300"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  )
}

export default Swap
