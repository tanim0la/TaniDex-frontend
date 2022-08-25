import { useEffect, useState } from 'react'
import { utils } from 'ethers'
import { HiOutlineExclamation } from 'react-icons/hi'
import AddLiquidity from './AddLiquidity'
import RemoveLiquidity from './RemoveLiquidity'
import { getLPTokensBalance } from '../utils/getAmounts'

function LiquidityOverview(props) {
  const [lpBalance, setLpBalance] = useState('')
  const [connected, setConnected] = useState(props.connected)
  const [addlp, setAddlp] = useState(false)

  useEffect(() => {
    if (props.provider) {
      ;(async () => {
        setConnected(true)
        getAmounts()
      })()
    }
  }, [props.provider])

  const getAmounts = async () => {
    const addy = await props.provider.listAccounts()

    const _lpBalance = await getLPTokensBalance(props.provider, addy[0])

    let showGoulp = (+utils.formatEther(_lpBalance)).toFixed(5)
    setLpBalance(showGoulp)
  }

  const onConnect = () => {
    props.onLpConnect()
  }

  const onAddLp = (value) => {
    setAddlp(value)
  }

  return (
    <>
      {connected ? (
        <div>
          {addlp ? (
            <AddLiquidity goBack={onAddLp} provider={props.provider} />
          ) : (
            <div className="flex justify-center">
              <div className="flex flex-col sm:w-1/2">
                <div className="flex justify-between w-full mt-12 px-3 py-2">
                  <span className="mt-3 text-lg font-semibold">Overview</span>
                  <button
                    onClick={() => onAddLp(true)}
                    className="bg-red-500 text-white font-semibold rounded-xl p-2 hover:bg-red-700"
                  >
                    + Add Liquidity
                  </button>
                </div>
                <div>
                  {lpBalance > 0 ? (
                    <RemoveLiquidity
                      lpBalance={lpBalance}
                      provider={props.provider}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl drop-shadow-2xl lg:mt-4">
                      <div className="flex flex-col  p-10 items-center p gap-y-5">
                        <span className="text-5xl">
                          <HiOutlineExclamation />
                        </span>
                        <span className="text-center">
                          You have no Liquidity Positions.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col sm:w-1/2">
            <div className="flex justify-between w-full mt-12 px-3 py-2">
              <span className="mt-3 text-lg font-semibold">Overview</span>
              <button
                disabled={!connected}
                className="bg-red-500 text-white font-semibold rounded-xl p-2 hover:bg-red-600"
              >
                + Add Liquidity
              </button>
            </div>
            <div className="bg-white rounded-2xl drop-shadow-2xl lg:mt-4">
              <div className="flex flex-col p-10 items-center gap-y-5">
                <span className="text-5xl">
                  <HiOutlineExclamation />
                </span>
                <span className="text-center">
                  You have no Liquidity Positions.
                </span>
                <button
                  onClick={onConnect}
                  className="bg-red-500 w-full p-3 text-white font-semibold rounded-xl hover:bg-red-600"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LiquidityOverview
