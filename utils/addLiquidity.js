import { Contract, utils } from 'ethers'
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from '../constants'

/**
 * addLiquidity helps add liquidity to the exchange,
 * If the user is adding initial liquidity, user decides the ether and GOU tokens he wants to add
 * to the exchange. If he is adding the liquidity after the initial liquidity has already been added
 * then we calculate the GOU tokens he can add, given the Eth he wants to add by keeping the ratios
 * constant
 */
export const addLiquidity = async (
  signer,
  addGouAmountWei,
  addEtherAmountWei,
) => {
  try {
    // create a new instance of the token contract
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer,
    )
    // create a new instance of the exchange contract
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer,
    )
    // Because GOU tokens are an ERC20, user would need to give the contract allowance
    // to take the required number GOU tokens out of his contract
    let tx = await tokenContract.increaseAllowance(
      EXCHANGE_CONTRACT_ADDRESS,
      addGouAmountWei.toString(),
    )
    await tx.wait()
    // After the contract has the approval, add the ether and Gou tokens in the liquidity
    tx = await exchangeContract.addLiquidity(addGouAmountWei, {
      value: addEtherAmountWei,
    })
    await tx.wait()
  } catch (err) {
    console.error(err)
  }
}

/**
 * calculateGOU calculates the GOU tokens that need to be added to the liquidity
 * given `_addEtherAmountWei` amount of ether
 */
export const calculateGOU = async (
  _addEther = '0',
  etherBalanceContract,
  gouTokenReserve,
) => {
  // `_addEther` is a string, we need to convert it to a Bignumber before we can do our calculations
  // We do that using the `parseEther` function from `ethers.js`
  const _addEtherAmountWei = utils.parseEther(_addEther)

  // Ratio needs to be maintained when we add liquidty.
  // We need to let the user know for a specific amount of ether how many `GOU` tokens
  // He can add so that the price impact is not large
  // The ratio we follow is (amount of GOU tokens to be added) / (GOU tokens balance) = (Eth that would be added) / (Eth reserve in the contract)
  // So by maths we get (amount of GOU tokens to be added) = (Eth that would be added * GOU tokens balance) / (Eth reserve in the contract)

  const gouTokenAmount = _addEtherAmountWei
    .mul(gouTokenReserve)
    .div(etherBalanceContract)

  return gouTokenAmount
}
