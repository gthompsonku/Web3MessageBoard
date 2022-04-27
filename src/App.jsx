import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/MessageBoard.json";

const App = () => {
  //state variables
  const [currentAccount, setCurrentAccount] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [allMessages, setAllMessages] =useState([]);
  const [loading, setLoading] = useState(false);
  
  //variables that holds the contract address and ABI
  const contractAddress = "0xd449A9Cd387C13fdbD177bb7af7d0Ee1a42d57fa";
  const contractABI = abi.abi; 

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("make sure you have metamask");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      //check if we are authorized to access users wallet
      const accounts = await ethereum.request({ method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }  

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }
      
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  
  const getTotalMessageCount = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messageBoardContract = new ethers.Contract(contractAddress, contractABI, signer);
    
        let count = await messageBoardContract.getTotalMessages();
        console.log("Retrieved total message count... ", count.toNumber());
        setMessageCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
        console.log(error);
    }
  }
  
  const message = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messageBoardContract = new ethers.Contract(contractAddress, contractABI, signer);
    
        const messageTxn = await messageBoardContract.message(newMessage);
        console.log("Mining... ", messageTxn.hash);
        
        await messageTxn.wait();
        console.log("Mined -- ", messageTxn.hash);
        
        setNewMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllMessages = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messageBoardContract = new ethers.Contract(contractAddress, contractABI, signer);
      
        const messages = await messageBoardContract.getAllMessages();
        
        let messagesCleaned = [];
        messages.forEach(message => {
          messagesCleaned.push({
            address: message.user,
            timestamp: new Date(message.timestamp *1000),
            message: message.message
          });
        });   
        setAllMessages(messagesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  
  //run the function when page loads
  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalMessageCount();
    getAllMessages();
    }, [])
  
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Hello!
        </div>

        <div className="bio">
          I am Grant and I am learning solidity. I have {messageCount} messages. Connect your Ethereum wallet and drop a message. You may even win some ETH! 
        </div>
        <br></br>
        
        <textarea cols="4" rows="5" value={newMessage} onChange={(event) => setNewMessage(event.target.value)}> 
        </textarea>
        <button className="messageButton" onClick={message}> Submit </button>
        
     
          {/* If there is no currentAccount render this button*/}
        {!currentAccount && (
          <button className="messageButton" onClick={connectWallet}>
            Connect Wallet
            </button>
        )}

        {allMessages.map((message, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {message.address}</div>
              <div>Time: {message.timestamp.toString()}</div>
              <div>Message: {message.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App