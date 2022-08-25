import { Contract } from 'ethers'
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants'

/*
    getAmountOfTokensReceivedFromSwap:  Returns the number of Eth/GOU tokens that can be received 
    when the user swaps `_swapAmountWei` amount of Eth/GOU tokens.
*/
export const getAmountOfTokensReceivedFromSwap = async (
  _swapAmountWei,
  provider,
  ethSelected,
  ethReserve,
  reservedGOU,
) => {
  // Create a new instance of the exchange contract
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider,
  )
  let amountOfTokens
  // If `Eth` is selected this means our input value is `Eth` which means our input amount would be
  // `_swapAmountWei`, the input reserve would be the `ethBalance` of the contract and output reserve
  // would be the `GOU` token reserve
  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethReserve,
      reservedGOU,
    )
  } else {
    // If `Eth` is not selected this means our input value is `GOU` tokens which means our input amount would be
    // `_swapAmountWei`, the input reserve would be the `GOU` token reserve of the contract and output reserve
    // would be the `ethBalance`
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedGOU,
      ethReserve,
    )
  }

  return amountOfTokens
}

/*
  swapTokens: Swaps `swapAmountWei` of Eth/GOU tokens with `tokenToBeReceivedAfterSwap` amount of Eth/GOU tokens.
*/
export const swapTokens = async (
  signer,
  swapAmountWei,
  tokenToBeReceivedAfterSwap,
  ethSelected,
) => {
  // Create a new instance of the exchange contract
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer,
  )
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer,
  )
  let tx
  // If Eth is selected call the `ethToGouToken` function else
  // call the `gouTokenToEth` function from the contract
  // As you can see you need to pass the `swapAmount` as a value to the function because
  // it is the ether we are paying to the contract, instead of a value we are passing to the function
  if (ethSelected) {
    tx = await exchangeContract.ethToGouToken(tokenToBeReceivedAfterSwap, {
      value: swapAmountWei,
    })
  } else {
    // User has to approve `swapAmountWei` for the contract because `GOU` token
    // is an ERC20
    tx = await tokenContract.increaseAllowance(
      EXCHANGE_CONTRACT_ADDRESS,
      swapAmountWei.toString(),
    )
    await tx.wait()
    // call cryptoDevTokenToEth function which would take in `swapAmountWei` of `GOU` tokens and would
    // send back `tokenToBeReceivedAfterSwap` amount of `Eth` to the user
    tx = await exchangeContract.gouTokenToEth(
      swapAmountWei,
      tokenToBeReceivedAfterSwap,
    )
  }
  await tx.wait()
}
