import LiquidityOverview from './LiquidityOverview'
import Swap from './Swap'

function Body(props) {
  let connect
  if (props.provider) {
    ;(async () => {
      connect = true
    })()
  } else {
    connect = false
  }

  const onConnect = () => {
    props.onIndexConnect()
  }

  return (
    <div>
      {props.tab == 'swap' ? (
        <Swap onSwapConnect={onConnect} provider={props.provider} />
      ) : null}
      {props.tab == 'liquidity' ? (
        <LiquidityOverview
          onLpConnect={onConnect}
          provider={props.provider}
          connected={connect}
        />
      ) : null}
    </div>
  )
}

export default Body
