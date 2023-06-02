import { useEffect, useRef, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import newcontract from './Newcontract.json';
import { useAlert } from 'react-alert';
import wallets from './updated.json';
import { keccak256 } from 'ethers/lib/utils';
import { MerkleTree } from 'merkletreejs'
import { Spinner } from 'reactstrap';



const newcontractAddress = "0xb85eeb713b876a25f16604887cc6b8997ef1b9dd";
const url = "http://localhost:3319/api"


const Claim = ({ accounts }) => {
    const alert = useAlert();
    const [loading, setLoading] = useState(false);
    const [userWallet, setUserWallet] = useState({
        claimed: false,
        amountInTokens: 0
    });


    async function handleClaim() {
        const addresses = wallets.map(w => w.address);
        const leaves = addresses.map(x => keccak256(x))
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
        const buf2hex = x => '0x' + x.toString('hex')      
        const leaf = keccak256(accounts[0])
        const proof = tree.getProof(leaf).map(x => buf2hex(x.data))

        setLoading(true);

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                newcontractAddress,
                newcontract,
                signer
            );
            try {
                const response = await contract.claimTokens(ethers.utils.parseUnits(`${userWallet.amountInTokens}`, "ether"),  proof);
                // make API Call
                sendClaim();
                console.log(response);
            } catch (err) {
                alert.error(err?.reason);
                console.log("error: ", err)
                setLoading(false);
            };
        };
    };

    const sendClaim = () => {
        fetch(`${url}/claim/${accounts[0]}`)
        .then((value) => {
            return value.json();
        })
        .then(data => {
            if(data.success){
                setUserWallet(data.wallet);
                alert.success("You have successfully claimed your tokens");
                getWalletInfo();
            }else{
                alert.error(data.msg)
            }
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setTimeout(()=>{
                getWalletInfo();
            }, 3000)
            setLoading(false);
        })
    }
    

    const getWalletInfo = () => {
        console.log(accounts[0])
        fetch(`${url}/get_info/${accounts[0]}`)
        .then((value) => {
            return value.json();
        })
        .then(data => {
            if(data.success){
                setUserWallet(data.wallet);
            }
        })
        .catch(err => {
            console.log(err);
            setTimeout(()=>{
                getWalletInfo();
            }, 3000)
        })
    }


    useEffect(()=> {
        if(accounts[0]) getWalletInfo();
    }, [accounts])

    return (
        <>
        <div className='claim-wrap'>
            <p>{userWallet.amountInTokens.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <button
            onClick={
                userWallet.claimed 
                ? false
                : handleClaim
            }
            >
                {
                    loading
                    ? <Spinner
                        color="white"
                        >
                    </Spinner>
                    : userWallet.claimed
                    ?"CLAIMED"
                    :"CLAIM"
                }
            </button>
        </div>
        </>
    )
}

export default Claim;