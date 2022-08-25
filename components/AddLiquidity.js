import { useEffect, useState } from 'react'
import Image from 'next/image'
import eth from '../public/eth.png'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiOutlineArrowLeft, HiPlus } from 'react-icons/hi'
import { BigNumber, utils } from 'ethers'
import {
  getGouTokensBalance,
  getEtherBalance,
  getReserveOfGouTokens,
} from '../utils/getAmounts'
import { addLiquidity, calculateGOU } from '../utils/addLiquidity'

function AddLiquidity(props) {
  const zero = BigNumber.from(0)
  const [showEthbal, setShowethbal] = useState('')
  const [showGoubal, setShowgoubal] = useState('')
  const [firstvalue, setFirstvalue] = useState('')
  const [secondvalue, setSecondvalue] = useState('')
  const [ethReserve, setEthReserve] = useState(zero)
  const [reservedGOU, setReserveGOU] = useState(zero)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (props.provider) {
      ;(async () => {
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
    setShowethbal(showEth)
    setShowgoubal(showGou)
  }

  const toAdd = async (value) => {
    if (value.toUpperCase() != value.toLowerCase()) {
    } else {
      setFirstvalue(value)

      try {
        const amountToAdd = await calculateGOU(value, ethReserve, reservedGOU)
        setSecondvalue(utils.formatEther(amountToAdd))
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  const onLiquidity = async () => {
    try {
      setLoading(true)
      const etherAmountWei = utils.parseUnits(firstvalue, 'ether')
      const gouAmountWei = utils.parseUnits(secondvalue, 'ether')

      await addLiquidity(
        props.provider.getSigner(),
        gouAmountWei,
        etherAmountWei,
      )
      toAdd('')
      setLoading(false)
      setFirstvalue('')
      setSecondvalue('')
    } catch (err) {
      console.log(err.message)
      setLoading(false)
      setFirstvalue('')
      setSecondvalue('')
    }
  }

  const goBack = (value) => {
    props.goBack(value)
  }

  return (
    <div className="flex justify-center">
      <div className=" h-fit w-fit bg-white mt-14 p-3 rounded-2xl drop-shadow-2xl lg:mt-4">
        <div className="mb-3 w-full">
          <button onClick={() => goBack(false)} className="text-2xl">
            <HiOutlineArrowLeft />
          </button>
          <span className="flex justify-center -mt-6 font-semibold">
            Liquidity
          </span>
        </div>
        <div className="flex flex-row bg-gray-50 w-full rounded-2xl">
          <input
            className="bg-transparent px-3 focus:outline-none w-full text-xl"
            placeholder="0.0"
            onChange={(e) => toAdd(e.target.value)}
            value={firstvalue}
          />
          <div className="flex flex-col">
            <div className="flex flex-row bg-gray-100 mx-2 my-4 mb-4 px-3 py-1 rounded-3xl">
              <div className="h-7 w-7">
                <Image src={eth} />
              </div>
              <span className="text-lg mt-0">ETH</span>
            </div>
            <span className="text-xs mb-2 text-end pr-3">
              bal: {showEthbal ? showEthbal : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <span className="bg-gray-50 p-2 -mt-4 rounded-xl border-4 border-white text-lg">
            <HiPlus />
          </span>
        </div>
        <div className="flex flex-row bg-gray-50 w-full rounded-2xl -mt-4">
          <input
            className="bg-transparent px-3 focus:outline-none w-full text-xl"
            placeholder="0.0"
            disabled={true}
            value={secondvalue}
          />
          <div className="flex flex-col">
            <div className="flex flex-row bg-gray-100 mx-2 my-4 mb-4 px-3 py-1 rounded-3xl">
              <div className="h-7 w-7">
                <Image src={eth} />
              </div>
              <span className="text-lg mt-0">GOU</span>
            </div>
            <span className="text-xs mb-2 text-end pr-3">
              bal: {showGoubal ? showGoubal : '0.0'}
            </span>
          </div>
        </div>
        <button
          onClick={onLiquidity}
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
          Add Liquidity
        </button>
      </div>
    </div>
  )
}

export default AddLiquidity
