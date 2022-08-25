import { Contract } from 'ethers'
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from '../constants'

/**
 * removeLiquidity: Removes the `removeLPTokensWei` amount of LP tokens from
 * liquidity and also the calculated amount of `ether` and `GOU` tokens
 */
export const removeLiquidity = async (signer, removeLPTokensWei) => {
  // Create a new instance of the exchange contract
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer,
    )
    const tx = await exchangeContract.removeLiquidity(removeLPTokensWei)
    await tx.wait()
  } catch (err) {
    console.log(err.message)
  }
}

/**
 * getTokensAfterRemove: Calculates the amount of `Eth` and `GOU` tokens
 * that would be returned back to user after he removes `removeLPTokenWei` amount
 * of LP tokens from the contract
 */
export const getTokensAfterRemove = async (
  provider,
  removeLPTokenWei,
  _ethReserve,
  gouTokenReserve,
) => {
  try {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider,
    )
    // Get the total supply of `GOU` LP tokens
    const _totalSupply = await exchangeContract.totalSupply()
    // Here we are using the BigNumber methods of multiplication and division
    // The amount of Eth that would be sent back to the user after he withdraws the LP token
    // is calculated based on a ratio,

    // Ratio is -> (amount of Eth that would be sent back to the user / Eth reserve) = (LP tokens withdrawn) / (total supply of LP tokens)
    // By some maths we get -> (amount of Eth that would be sent back to the user) = (Eth Reserve * LP tokens withdrawn) / (total supply of LP tokens)

    // Similarly we also maintain a ratio for the `GOU` tokens, so here in our case
    // Ratio is -> (amount of GOU tokens sent back to the user / GOU Token reserve) = (LP tokens withdrawn) / (total supply of LP tokens)
    // Then (amount of GOU tokens sent back to the user) = (GOU token reserve * LP tokens withdrawn) / (total supply of LP tokens)
    const _removeEther = (_ethReserve * removeLPTokenWei) / _totalSupply
    const _removeGOU = (gouTokenReserve * removeLPTokenWei) / _totalSupply
    return {
      _removeEther,
      _removeGOU,
    }
  } catch (err) {
    console.error(err)
  }
}
