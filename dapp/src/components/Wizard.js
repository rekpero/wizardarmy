import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useParams, Link } from "react-router-dom";

function Wizard(props) {
  const connected = props.connected;
  const numWizards = props.numWizards;
  const address = props.address;
  let params = useParams();
  const wizardId = params.id;

  const [myWizard, setMyWizard] = useState({});
  const [myFloor, setMyFloor] = useState(0);
  const [isInitiated, setIsInitiated] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isOnTheTower, setIsOnTheTower] = useState(false);
  const [myTowerTokens, setMyTowerTokens] = useState(0);
  const [totalTowerTokens, setTotalTowerTokens] = useState(0);
  const [totalWizards, setTotalWizards] = useState(0);

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
    // todo -- could combine this or import this function in MyWizards.js
    async function processWizardStruct(wiz, id) {
        let processedWizard = {};
        processedWizard.id = parseInt(id);
        processedWizard.level = parseInt(wiz.level);
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


    async function LoadMyWizard() {
        let wiz = await wizardNFTContract.tokenIdToStats(wizardId);
        await processWizardStruct(wiz, wizardId).then( (processed) => {
                setMyWizard(processed);
        });
        // set isInitiated
        // set isActivated / not a Deserter
    }

    async function LoadTotalWizards() {
        let total = parseInt(await wizardNFTContract.totalSupply());
        setTotalWizards(total);
    }


    async function SetIsOwner() {
        if(!connected || wizardId===undefined){
          setIsOwner(false);
        }
        else {
            const ownerAddress = await wizardNFTContract.ownerOf(wizardId);
            setIsOwner(ownerAddress==address);
        }
    }


    async function LoadMyFloor() {
        const _floor = parseInt(await wizardTowerContract.wizardIdToFloor(wizardId));
        if (_floor!= 0){
            setIsOnTheTower(true);
        }
        setMyFloor(_floor);
    }

    async function Initiate() {
        let tx = await wizardNFTContract.initiate(wizardId);
        let res = await tx.wait(1);
        if(res){
            myWizard.initiationTimestamp = res;
            setMyWizard(myWizard);
        }
        else {
          console.log("error.");
        }
    }

    async function LoadTowerTokens() {
        const towerBalance = parseInt(await ecosystemTokenContract.balanceOf(wizardTowerContract.address));
        setTotalTowerTokens(towerBalance);
        if(myFloor==0) {return;}

        const myBalance = parseInt(await wizardTowerContract.floorBalance(myFloor));
        setMyTowerTokens(myBalance);
    }


    async function WithdrawFromTower() {
        console.log("Withdrawiing from tower...")
        //
        const activeFloors = parseInt(await wizardTowerContract.activeFloors());
        console.log("myFloor: ", myFloor);
        console.log("activeFloors: ", activeFloors);


        const tx = await wizardTowerContract.withdraw(myFloor);
        const res = await tx.wait(1);
        if(res){
            console.log("Tokens have been withdrawn.");
        }
        else {
            console.log("Withdrawal failed.")
        }
    }

    async function GetOnTheTower() {
       const tx = await wizardTowerContract.claimFloor(wizardId);
       const res = await tx.wait();
       const floor = parseInt(res.events[0].args[1]);
       setMyFloor(floor)
    }



//    useEffect(() => {
//      const interval = setInterval(() => {
//        LoadMyWizards();
//      }, 60000);
//      return () => clearInterval(interval);
//    }, []);

    useEffect(() => {
      LoadTotalWizards();
      LoadMyWizard();
      LoadMyFloor();
      SetIsOwner();
      LoadTowerTokens();
    }, []);

    useEffect(() => {
      LoadTowerTokens();
    }, [myFloor]);

    useEffect(() => {
      SetIsOwner();
    }, [connected]);

    useEffect(() => {
    }, [isOwner]);


  return (
    <div className="">
      <p>{totalTowerTokens} TOKENS TOTAL </p>
      <p className="DoubleBordered">Wizard {wizardId} {isOnTheTower ? "is on floor " + myFloor : "not in the tower."}</p>
        {myWizard && wizardId < totalWizards &&
            <div className="Double">
                <div className="DoubleBordered">
                    <div>element: {myWizard.element}</div>
                    <div>Level: {myWizard.level}</div>
                    <div>HP: {myWizard.hp}</div>
                    <div>MP: {myWizard.mp}</div>
                    <div>Tokens Claimed: {myWizard.tokensClaimed}</div>
                    <div>wins: {myWizard.wins}</div>
                    <div>losses: {myWizard.losses}</div>
                    <div>goodness: {myWizard.goodness}</div>
                    <div>badness: {myWizard.badness}</div>
                    <div>Time Initiated: {myWizard.initiationTimestamp}</div>
                    <div>Protected Until: {myWizard.protectedUntilTimestamp}</div>
                </div>
            </div>
        }

        {wizardId >= totalWizards && 'Wizard does not exist.'}
        {!myWizard && 'loading...'}
        {isOwner &&
        <div>
          {isOnTheTower==false && <button onClick={GetOnTheTower}>Get on the tower</button> }
          {myWizard.initiationTimestamp === 0 && <button onClick={Initiate}>Initiate</button> }
          <button>Complete Task</button>
          {myTowerTokens} <button onClick={WithdrawFromTower}>Withdraw from Tower</button>
          <Link to={"battle/"}>
            <button>Battle (Wizard tower Floors)</button>
          </Link>
        </div>
        }
    </div>
  );
}

export default Wizard;
