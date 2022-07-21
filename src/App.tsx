import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import Navbar from './components/Navbar'
import Shop from './components/Shop'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Send from './Pages/Send'
import Custom from './Pages/Custom';
import Raffles from './Pages/Raffles';
import Auctions from './Pages/Auctions';
import BulkSend from './Pages/BulkSend';
import Cleaner from './Pages/Cleaner';
import Gallery from './Pages/Gallery';
import Slots from './Pages/Slots';
import Dashboard from './Pages/Dashboard';
import Home from './Pages/Home';
import Navbar2 from './components/Navbar2'
import CarotMarket from './Pages/CarotMarket';
import CansMarket from './Pages/CansMarket';


require('./App.css')
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {

    
    const [screenWidth, setScreenWidth] = useState(window.innerWidth)

    useEffect(() => {
        const changeWidth = () => {
          setScreenWidth(window.innerWidth);
        }
        window.addEventListener('resize', changeWidth)
        return () => {
          window.removeEventListener('resize', changeWidth)
        }
      }, [])

      

    return (
        <div className='App'>
            <HashRouter>
                <Context>
                    { (screenWidth > 755) ? (<Navbar2 />) : (<Navbar/>)}
                    
                    <Content/>    
                </Context>
            </HashRouter>
        </div>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Shop" element={<Shop />} />
                <Route path="/Send" element={<Send />} />
                <Route path="/BulkSend" element={<BulkSend />} />
                <Route path="/Cleaner" element={<Cleaner />} />
                <Route path="/Custom" element={<Custom />} />
                <Route path="/Raffles" element={<Raffles />} />
                <Route path="/Auctions" element={<Auctions />} />
                <Route path="/Slots" element={<Slots />} />
                <Route path="/Gallery" element={<Gallery />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Carot-Market" element={<CarotMarket />} />
                <Route path="/Cans-Market" element={<CansMarket />} />
            </Routes>
        </>
    );
};
