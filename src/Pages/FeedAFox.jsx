import { useState, useCallback, useEffect } from 'react'
import './FeedAFox.css'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import filter from '../foxfilter.json'
import filter2 from '../potionfilter.json'
import { useWalletNfts } from '@nfteyez/sol-rayz-react'
import { Grid, Paper, Button } from '@material-ui/core'
import Alert from '@mui/material/Alert';
import fieldcoin from '../images/fieldcoin.png'
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import * as spltoken from "@solana/spl-token";
import CircularProgress from '@mui/material/CircularProgress';


const FeedAFox = () => {

  let walletAddress = ''
  const wallet = useAnchorWallet()
  walletAddress = wallet?.publicKey.toString()
  const filterList = JSON.parse(JSON.stringify(filter))
  const filterList2 = JSON.parse(JSON.stringify(filter2))
  const connection = new Connection("https://bold-old-moon.solana-mainnet.quiknode.pro/ce6fe5d59cabd95814a4c61a6e69afbbfc625c9f/", "confirmed");

  const { nfts } = useWalletNfts({
    publicAddress: walletAddress

  })

  const [metadata, setMetadata] = useState({});

  const fetchMetadata = useCallback(async () => {
    for (const nft of nfts) {
      try {
        fetch(nft.data.uri)
          .then((response) => response.json())
          .then((meta) =>
            setMetadata((state) => ({ ...state, [nft.mint]: meta }))
          );
      } catch (error) {
        console.log(error)
      }

    }
  }, [nfts]);

  useEffect(() => {
    if (nfts?.length) fetchMetadata();
  }, [nfts, fetchMetadata]);

  const filterArray = Object.keys(metadata)
    .filter(key => filterList.includes(key))
    .reduce((obj, key) => {
      obj[key] = metadata[key];
      return obj;
    }, {});

    const filterArray2 = Object.keys(metadata)
    .filter(key => filterList2.includes(key))
    .reduce((obj, key) => {
      obj[key] = metadata[key];
      return obj;
    }, {});

  var result = Object.keys(filterArray).map((key) => [(key), filterArray[key]]);
  const [tx, setTx] = useState('')
  const [selected, setSelected] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  var result2 = Object.keys(filterArray2).map((key) => [(key), filterArray2[key]]);
  const [tx2, setTx2] = useState('')
  const [selected2, setSelected2] = useState([])
  const [isLoading2, setIsLoading2] = useState(false)

  const onClick = (e, index) => {
    setSelected(selected => selected.includes(result[index][0]) ? selected.filter(n => n !== selected[selected.indexOf(result[index][0])]) : [...selected, result[index][0]])
    e.target.classList.toggle('imagesClicked')
  }

  const onClick2 = (e, index) => {
    setSelected2(selected2 => selected2.includes(result2[index][0]) ? selected2.filter(n => n !== selected2[selected2.indexOf(result2[index][0])]) : [...selected2, result2[index][0]])
    e.target.classList.toggle('imagesClicked')
  }

  const { publicKey, sendTransaction } = useWallet();
  const fromWallet = wallet
  const mint = new PublicKey('61X22Z6QnRzeuaPjvdWN4npRBBFNpVdkdMgWvRNt5dfm')
  const toWallet = new PublicKey('edR77x2bsyLQvbynYQFxnKR5TL1eCrEMfyjuJBoqb76')

  const onSPLClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    setIsLoading(true)
    let nft1 = new PublicKey(selected[0])
    let nft2 = new PublicKey(selected[1])
    let fromTokenAccount = await connection.getParsedTokenAccountsByOwner(fromWallet.publicKey, { mint: mint, });
    let nftAccount1 = await connection.getParsedTokenAccountsByOwner(fromWallet.publicKey, { mint: nft1, });
    let nftAccount2 = await connection.getParsedTokenAccountsByOwner(fromWallet.publicKey, { mint: nft2, });

    let toTokenAccount = new PublicKey('GRTUAG6biTRTEQNCH7KrHQEdUq33cLpASQR8WhQzvM5K')
    let allowOwnerOffCurve = true

    const ataNft1 = await spltoken.getAssociatedTokenAddress(
      nft1,
      toWallet,
      allowOwnerOffCurve,
      spltoken.TOKEN_PROGRAM_ID,
      spltoken.ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const ataNft2 = await spltoken.getAssociatedTokenAddress(
      nft2,
      toWallet,
      allowOwnerOffCurve,
      spltoken.TOKEN_PROGRAM_ID,
      spltoken.ASSOCIATED_TOKEN_PROGRAM_ID
    );
   
    try {
      const transaction = new Transaction().add(
        spltoken.createTransferInstruction(
          fromTokenAccount.value[0].pubkey,
          toTokenAccount,
          fromWallet.publicKey,
          10,
          [],
          spltoken.TOKEN_PROGRAM_ID
        ),
        spltoken.createAssociatedTokenAccountInstruction(
          fromWallet.publicKey, // payer
          ataNft1, // ata
          toWallet, // owner
          nft1, // mint
          spltoken.TOKEN_PROGRAM_ID,
          spltoken.ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        spltoken.createTransferInstruction(
          nftAccount1.value[0].pubkey,
          ataNft1,
          fromWallet.publicKey,
          1,
          [],
          spltoken.TOKEN_PROGRAM_ID
        ),
        spltoken.createAssociatedTokenAccountInstruction(
          fromWallet.publicKey, // payer
          ataNft2, // ata
          toWallet, // owner
          nft2 // mint
        ),
        spltoken.createTransferInstruction(
          nftAccount2.value[0].pubkey,
          ataNft2,
          fromWallet.publicKey,
          1,
          [],
          spltoken.TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
      setTx(signature)
      console.log(signature)
      setIsLoading(false)
    } catch (error) {
      setTx('false')
      console.error(error);
      setIsLoading(false)
    }
  })

  return (

    <div className='CustomMain'>
      <div className='CustomHeader'>
        <h1 className='title' style={{marginBottom: "40px"}}>Feed Your Fox</h1>
      </div>


      <div className='MainContainer'>
        
        <div className='RabbitSelect'>
          <h2 className='SelectRabbits' style={{marginBottom: "30px"}}>Which Edd Fox would you like to feed?</h2>
          {selected.length > 1 && <h2 className='Warning' style={{marginTop: "-25px"}}>Please only select 1!</h2>}
          <Grid container spacing={1} className='rabbitGrid'>
            {result.map((nft, index) => {
              return (
                <Grid item key={index} md={6} lg={4}>
                  <Paper className='images' elevation={8}>
                    <img src={nft[1].image} className='BobbyRabbits' alt='rabbits' onClick={(e) => onClick(e, index)} />
                    {selected.includes(result[index][0]) &&
                      <div className='clicked'><h1 className='selectedText'>Selected</h1></div>}
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </div>

        <div className='RabbitSelect'>
          <h2 className='SelectRabbits' style={{marginBottom: "30px"}}>Which Potion?</h2>
          {selected2.length > 1 && <h2 className='Warning' style={{marginTop: "-25px"}}>Please only select 1!</h2>}
          <Grid container spacing={2} className='rabbitGrid'>
            {result2.map((nft, index) => {
              return (
                <Grid item key={index} md={6} lg={4}>
                  <Paper className='images' elevation={8}>
                    <img src={nft[1].image} className='BobbyRabbits' alt='rabbits' onClick2={(e) => onClick2(e, index)} />
                    {selected2.includes(result2[index][0]) &&
                      <div className='clicked'><h1 className='selectedText'>Selected</h1></div>}
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </div>


        <div className='completePurchase'>
          <img className='transactionCarot' src={fieldcoin} alt='field coin' />
          {(selected.length === 2) ? (<><h1 className='carots' style={{marginBottom: "10px"}}>Pay 10 $FIELD to feed your Fox a Potion and initiate a transformation!</h1><h3>After the transaction completes, your fox may go into temporary hibernation while he digests his meal.</h3>
            {!isLoading ? (<Button size="large" className='transactionBtn'  style={{marginBottom: "30px"}} onClick={onSPLClick} disabled={!publicKey} >Feed Your Fox!</Button>) :
              (<Button size="large" variant='outlined' className='transactionBtn'><CircularProgress /></Button>)}</>) :
            (<h1 className='carots' style={{marginBottom: "20px"}}>Make Your Selections</h1>)}
          {tx.length > 6 ?
            (<><Alert severity="success">
              Success - Transaction success <strong><a href={'https://solscan.io/tx/' + tx} target='_blank' rel='noreferrer'>Check Tx on Solscan</a></strong>
            </Alert>
              <h5 style={{ width: '90%' }}>Transaction: <a href={'https://solscan.io/tx/' + tx} target='_blank' rel='noreferrer'> Transaction Link</a></h5><h5 style={{ marginTop: '-10px' }}>Please copy the link above and share in the Fed Foxes thread in Discord!</h5></>) : tx === 'false' ?
              (<Alert severity="error">
                Error - Transaction was not confirmed-<strong>Please check wallet and try again</strong>
              </Alert>) : (<div></div>)
          }
        </div>
      </div>
    </div>
  )
}

export default FeedAFox