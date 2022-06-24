import { useEffect, useState } from "react";
import { ethers } from "ethers";


function MyWizards(props) {
  const connected = props.connected;
  const numWizards = props.numWizards;
  const address = props.address;
//  let [connected, setConnected] = useState(false);
  const [wizardIDs, setWizardIDs] = useState([]);
  const [wizards, setWizards] = useState([]);
  const [myNumWizards, setMyNumWizards] = useState(0);

  const [time, setTime] = useState(Date.now());

  // contracts
  const { ethereum } = window;
  const ecosystemTokenContract = window.ecosystemToken;
  const wizardNFTContract = window.wizardNFTContract;
  const wizardTowerContract =window.wizardTowerContract;
  const wizardBattleContract =window.wizardBattleContract;
  const signer = window.signer;
  const ELEMENTS = ["Fire", "Wind", "Water", "Earth"]
  let isLoadingMyWizards = false;

//        uint256 hp;
//        uint256 mp;
//        uint256 wins;
//        uint256 losses;
//        uint256 battles;
//        uint256 tokensClaimed;
//        uint256 goodness;
//        uint256 badness;
//        uint256 initiationTimestamp; // 0 if uninitiated
//        uint256 protectedUntilTimestamp; // after this timestamp, NFT can be crushed
//        ELEMENT element;
    async function processWizardStruct(wiz, id) {
        let processedWizard = {};
        processedWizard.id = parseInt(id);
        processedWizard.hp = parseInt(wiz.hp);
        processedWizard.mp = parseInt(wiz.mp);
        processedWizard.wins = parseInt(wiz.wins);
        processedWizard.losses = parseInt(wiz.losses);
        processedWizard.battles = parseInt(wiz.battles);
        processedWizard.tokensClaimed = parseInt(wiz.tokensClaimed);
        processedWizard.goodness = parseInt(wiz.goodness);
        processedWizard.badness = parseInt(wiz.badness);
        processedWizard.initiationTimestamp = parseInt(wiz.initiationTimestamp);
        processedWizard.protectedUntilTimestamp = parseInt(wiz.protectedUntilTimestamp);
        processedWizard.element = ELEMENTS[parseInt(wiz.element)];
        return processedWizard;
    }


    async function LoadMyWizards() {
      if(isLoadingMyWizards == true){
          return;
      }
      else {
        isLoadingMyWizards = true;
      }

      setWizardIDs([]);
      setWizards([]);
      let newWizArray = [];
      if(address !== undefined) {
          let bal = await wizardNFTContract.balanceOf(address);
          setMyNumWizards(parseInt(bal));
          console.log("bal: ", parseInt(bal))
          setWizardIDs([]);
          // iterate through balance
          for(let i=0; i< bal; i++) {
                let id = await wizardNFTContract.tokenOfOwnerByIndex(address, i);
                let wiz = await wizardNFTContract.tokenIdToStats(id);
                await processWizardStruct(wiz, id).then( (processed) => {
                    newWizArray.push(processed);
                });
            }
            setWizards(newWizArray);
      }
      else {
        console.log("Not connected.");
      }
        isLoadingMyWizards = false;
    }

    useEffect(() => {
      const interval = setInterval(() => {
        LoadMyWizards();
      }, 60000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      LoadMyWizards();
    }, [connected, numWizards, address]);

    useEffect(() => {
      LoadMyWizards();
    }, []);


  return (
    <div className="">
      <p className="DoubleBordered">I own {wizards.length} wizards:</p>
        {wizards && wizards.map(wizard =>
            <tr key={wizard.id} className="Double">
                <div className="DoubleBordered">
                    <td>ID: {wizard.id}</td>
                    <td>element: {wizard.element}</td>
                    <td>HP: {wizard.hp}</td>
                    <td>MP: {wizard.mp}</td>
                    <td>Tokens Claimed: {wizard.tokensClaimed}</td>
                </div>
            </tr>
        )}
        {wizards.length != myNumWizards && 'loading...'}
        {myNumWizards == 0 && "you have no wizards."}
    </div>
  );
}

export default MyWizards;
