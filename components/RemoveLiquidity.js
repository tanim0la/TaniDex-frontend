import { useState, useEffect } from 'react'
import Image from 'next/image'
import eth from '../public/eth.png'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BigNumber, utils } from 'ethers'
import { getEtherBalance, getReserveOfGouTokens } from '../utils/getAmounts'
import { removeLiquidity, getTokensAfterRemove } from '../utils/removeLiquidity'

function RemoveLiquidity(props) {
  const zero = BigNumber.from(0)
  const [ethReserve, setEthReserve] = useState(zero)
  const [reservedGOU, setReserveGOU] = useState(zero)
  const [firstvalue, setFirstvalue] = useState('')
  const [showEth, setShowEth] = useState('')
  const [showGou, setShowGou] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (props.provider) {
      ;(async () => {
        getAmounts()
      })()
    }
  }, [props.provider, loading])

  const getAmounts = async () => {
    const _ethReserve = await getEtherBalance(props.provider, null, true)
    const _reserveGOU = await getReserveOfGouTokens(props.provider)

    setEthReserve(_ethReserve)
    setReserveGOU(_reserveGOU)
  }

  const toReceive = async (value) => {
    if (value.toUpperCase() != value.toLowerCase()) {
    } else {
      setFirstvalue(value)
      try {
        const valueToWei = utils.parseUnits(value, 'ether')
        const removeTokens = await getTokensAfterRemove(
          props.provider,
          valueToWei,
          ethReserve.toString(),
          reservedGOU.toString(),
        )
        let _showEth = (removeTokens._removeEther / 1e18).toFixed(5)
        let _showGou = (removeTokens._removeGOU / 1e18).toFixed(2)

        setShowEth(_showEth)
        setShowGou(_showGou)
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  const onRemove = async () => {
    try {
      setLoading(true)
      const valueToWei = utils.parseUnits(firstvalue, 'ether')

      await removeLiquidity(props.provider.getSigner(), valueToWei)
      setLoading(false)
      setFirstvalue('')
    } catch (err) {
      setLoading(false)
      setFirstvalue('')
      console.log(err.message)
    }
  }

  return (
    <div className="flex justify-center">
      <div className=" h-fit w-full bg-white p-3  rounded-2xl drop-shadow-2xl lg:mt-4">
        <span className="flex justify-center font-semibold">
          Remove Liquidity
        </span>
        <div className="flex flex-row bg-gray-50 w-full rounded-2xl mt-3">
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
              <span className="text-lg mt-0">GOULP</span>
            </div>
            <span className="text-xs mb-2 text-end pr-3">
              bal: {props.lpBalance > 0 ? props.lpBalance : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex px-2 my-7 justify-center">
          <span className="text-sm text-center">
            You will receive {showEth ? showEth : '0.00000'} ETH and{' '}
            {showGou ? showGou : '0.00'} GOU tokens
          </span>
        </div>
        <button
          onClick={onRemove}
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
          Remove
        </button>
      </div>
    </div>
  )
}

export default RemoveLiquidity
