pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED

// This will be where wizards receive ecosystem tokens
import "./interfaces/IERC20.sol";
//import "./interfaces/IERC721.sol";
import "./RelativeTimeVault.sol";
import "./WizardTower.sol";
//import "./Wizards.sol";


contract WizardBattle is Ownable {

    uint256 floors = 10000;
    IERC20 ecosystemToken;
    Wizards wizardToken;
    WizardTower wizardTower;
    uint256 DAOShare = 100; // out of 10,000 (100%) => 1%

    constructor(address _ecosystemToken, address _wizardToken, address _wizardTower) {
        ecosystemToken = IERC20(_ecosystemToken);
        wizardToken = Wizards(_wizardToken);
        wizardTower = WizardTower(_wizardTower);
    }

    ////////////////////
    ////    Get       //
    ////////////////////


    ////////////////////
    ////    Battle    //
    ////////////////////

    // todo -- default victory if defender  is not active
    function attack(uint256 _attackerId, uint256 _floor) external {
        // get both wizard ids

        require(wizardToken.ownerOf(_attackerId)==msg.sender, "must be NFT holder");
        require(wizardTower.isOnTheTower(_attackerId), "attacker must be on the tower");
        require(wizardToken.isActive(_attackerId), "must be active");
        require(_floor <= wizardTower.activeFloors(), "must valid floor");
        uint256 occupyingWizard = wizardTower.getWizardOnFloor(_floor);
        uint256 tokensOnFloor = wizardTower.floorBalance(_floor);
        uint256 tokensWaged = wizardTower.floorBalance(_floor)*(10000 - DAOShare)/10/10000;
        uint256 attackingFromFloor = wizardTower.wizardIdToFloor(_attackerId);
        require(ecosystemToken.balanceOf(msg.sender) > _floor/10, "insuffcient tokens to attack"); // only if other user is valid
        require(ecosystemToken.transferFrom(msg.sender, address(this), _floor/10), "transfer failed"); // only if other user is valid
        require(ecosystemToken.transfer(wizardToken.ownerOf(occupyingWizard), tokensWaged), "transfer failed"); // only if other user is valid

        // todo -- randomness, battle dynamics
        uint256 won = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, block.difficulty, _floor))) % 2;
        if(won!=0) {
            // withdraw tokens before leaving floor
            if(wizardTower.floorBalance(_floor) > 0) {
                wizardTower.withdraw(_floor);
            }
            // switch places
            wizardTower.switchFloors(attackingFromFloor, _floor);
            // withdraw tokens at new floor
            if(wizardTower.floorBalance(attackingFromFloor) > 0) {
                wizardTower.withdraw(attackingFromFloor);
            }
           // update NFT stats for wons/loses/tokens
        }
        else {
            // nothing else to do
        }

        wizardToken.reportBattle(_attackerId, occupyingWizard, won, tokensOnFloor, tokensWaged);
    }

    // for use when wizard has deserted
    function capture(uint256 floor) external {
        require(true, "must be NFT holder");
        require(true, "must be on the tower");
        require(true, "must be active");

        require(true, "must valid floor");
        require(true, "insuffcient tokens to attack"); // only if other user is valid
        require(true, "must be NFT holder");
        // automatically clean out BOTH floors if successful
    }


    ////////////////////
    ////    Admin     //
    ////////////////////
    function withdraw() external onlyOwner {
        uint256 tokens = wizardToken.balanceOf(address(this));
        require(ecosystemToken.transfer(msg.sender,tokens), "transfer failed"); // only if other user is valid
    }



}
