const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CEToken Contract", function () {
    async function deployCETokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const ceTokenFactory = await ethers.getContractFactory("CEToken");
        const ceToken = await ceTokenFactory.deploy(owner.address);
        await ceToken.waitForDeployment();
        const ceTokenAddress = await ceToken.getAddress();
        return { ceToken, ceTokenAddress, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { ceToken, owner } = await loadFixture(deployCETokenFixture);
            expect(await ceToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { ceToken, owner } = await loadFixture(deployCETokenFixture);
            const ownerBalance = await ceToken.balanceOf(owner.address);
            const expectedSupply = ethers.parseUnits("1000000000", 18); // 1 billion tokens with 18 decimals
            expect(await ceToken.totalSupply()).to.equal(expectedSupply);
            expect(ownerBalance).to.equal(expectedSupply);
        });

        it("Should have correct name and symbol", async function () {
            const { ceToken } = await loadFixture(deployCETokenFixture);
            expect(await ceToken.name()).to.equal("CE Token");
            expect(await ceToken.symbol()).to.equal("CE");
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            const { ceToken, owner, addr1, addr2 } = await loadFixture(deployCETokenFixture);
            const amount = ethers.parseUnits("100", 18);

            // Transfer 100 tokens from owner to addr1
            await expect(ceToken.transfer(addr1.address, amount))
                .to.emit(ceToken, "Transfer")
                .withArgs(owner.address, addr1.address, amount);
            expect(await ceToken.balanceOf(addr1.address)).to.equal(amount);

            // Transfer 50 tokens from addr1 to addr2
            await expect(ceToken.connect(addr1).transfer(addr2.address, ethers.parseUnits("50", 18)))
                .to.emit(ceToken, "Transfer")
                .withArgs(addr1.address, addr2.address, ethers.parseUnits("50", 18));
            expect(await ceToken.balanceOf(addr2.address)).to.equal(ethers.parseUnits("50", 18));
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const { ceToken, owner, addr1 } = await loadFixture(deployCETokenFixture);
            const initialOwnerBalance = await ceToken.balanceOf(owner.address);
            const amount = ethers.parseUnits("1", 18);

            await expect(
                ceToken.connect(addr1).transfer(owner.address, amount) // addr1 has 0 tokens
            ).to.be.revertedWithCustomError(ceToken, "ERC20InsufficientBalance");

            expect(await ceToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const { ceToken, owner, addr1 } = await loadFixture(deployCETokenFixture);
            const amount = ethers.parseUnits("500", 18);
            const initialTotalSupply = await ceToken.totalSupply();

            await expect(ceToken.mint(addr1.address, amount))
                .to.emit(ceToken, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, amount);

            expect(await ceToken.balanceOf(addr1.address)).to.equal(amount);
            expect(await ceToken.totalSupply()).to.equal(initialTotalSupply + amount);
        });

        it("Should not allow non-owner to mint tokens", async function () {
            const { ceToken, addr1, addr2 } = await loadFixture(deployCETokenFixture);
            const amount = ethers.parseUnits("100", 18);
            await expect(
                ceToken.connect(addr1).mint(addr2.address, amount)
            ).to.be.revertedWithCustomError(ceToken, "OwnableUnauthorizedAccount")
            .withArgs(addr1.address);
        });
    });

    describe("Burning", function () {
        it("Should allow users to burn their tokens", async function () {
            const { ceToken, owner } = await loadFixture(deployCETokenFixture);
            const burnAmount = ethers.parseUnits("100", 18);
            const initialOwnerBalance = await ceToken.balanceOf(owner.address);
            const initialTotalSupply = await ceToken.totalSupply();

            await expect(ceToken.burn(burnAmount))
                .to.emit(ceToken, "Transfer")
                .withArgs(owner.address, ethers.ZeroAddress, burnAmount);

            expect(await ceToken.balanceOf(owner.address)).to.equal(initialOwnerBalance - burnAmount);
            expect(await ceToken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
        });

        it("Should not allow burning more tokens than balance", async function () {
            const { ceToken, addr1 } = await loadFixture(deployCETokenFixture);
            const burnAmount = ethers.parseUnits("100", 18);
            await expect(
                ceToken.connect(addr1).burn(burnAmount) // addr1 has 0 tokens
            ).to.be.revertedWithCustomError(ceToken, "ERC20InsufficientBalance");
        });

        it("Should allow approved address to burnFrom", async function () {
            const { ceToken, owner, addr1 } = await loadFixture(deployCETokenFixture);
            const transferAmount = ethers.parseUnits("200", 18);
            const burnAmount = ethers.parseUnits("100", 18);
            await ceToken.transfer(addr1.address, transferAmount); // Give addr1 some tokens

            const initialAddr1Balance = await ceToken.balanceOf(addr1.address);
            const initialTotalSupply = await ceToken.totalSupply();

            await ceToken.connect(addr1).approve(owner.address, burnAmount); // addr1 approves owner to spend
            await expect(ceToken.connect(owner).burnFrom(addr1.address, burnAmount))
                .to.emit(ceToken, "Transfer")
                .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

            expect(await ceToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance - burnAmount);
            expect(await ceToken.totalSupply()).to.equal(initialTotalSupply - burnAmount);
        });

        it("Should not allow burnFrom without allowance", async function () {
            const { ceToken, owner, addr1 } = await loadFixture(deployCETokenFixture);
            const transferAmount = ethers.parseUnits("100", 18);
            await ceToken.transfer(addr1.address, transferAmount);
            const burnAmount = ethers.parseUnits("50", 18);

            await expect(
                ceToken.connect(owner).burnFrom(addr1.address, burnAmount)
            ).to.be.revertedWithCustomError(ceToken, "ERC20InsufficientAllowance");
        });
    });

    describe("Withdraw Stuck Tokens", function () {
        it("Should allow owner to withdraw stuck CE tokens", async function () {
            const { ceToken, ceTokenAddress, owner } = await loadFixture(deployCETokenFixture);
            const stuckAmount = ethers.parseUnits("100", 18);
            await ceToken.transfer(ceTokenAddress, stuckAmount); // Send tokens to the contract itself

            expect(await ceToken.balanceOf(ceTokenAddress)).to.equal(stuckAmount);
            const ownerInitialBalance = await ceToken.balanceOf(owner.address);

            await expect(ceToken.withdrawStuckCE())
                .to.emit(ceToken, "Transfer")
                .withArgs(ceTokenAddress, owner.address, stuckAmount);

            expect(await ceToken.balanceOf(ceTokenAddress)).to.equal(0);
            expect(await ceToken.balanceOf(owner.address)).to.equal(ownerInitialBalance + stuckAmount);
        });

        it("Should not allow non-owner to withdraw stuck CE tokens", async function () {
            const { ceToken, ceTokenAddress, addr1 } = await loadFixture(deployCETokenFixture);
            const stuckAmount = ethers.parseUnits("100", 18);
            await ceToken.transfer(ceTokenAddress, stuckAmount);

            await expect(
                ceToken.connect(addr1).withdrawStuckCE()
            ).to.be.revertedWithCustomError(ceToken, "OwnableUnauthorizedAccount")
            .withArgs(addr1.address);
        });

        it("Should allow owner to withdraw other stuck ERC20 tokens", async function () {
            const { ceToken, ceTokenAddress, owner, addr1 } = await loadFixture(deployCETokenFixture);

            // Deploy a dummy ERC20 token
            const DummyERC20 = await ethers.getContractFactory("CEToken"); // Using CEToken as a generic ERC20
            const dummyToken = await DummyERC20.deploy(owner.address);
            await dummyToken.waitForDeployment();
            const dummyTokenAddress = await dummyToken.getAddress();

            const stuckAmount = ethers.parseUnits("50", 18);
            await dummyToken.transfer(ceTokenAddress, stuckAmount); // Send dummy tokens to CEToken contract

            expect(await dummyToken.balanceOf(ceTokenAddress)).to.equal(stuckAmount);
            const ownerInitialDummyBalance = await dummyToken.balanceOf(owner.address);

            await expect(ceToken.withdrawStuckERC20(dummyTokenAddress))
                .to.emit(dummyToken, "Transfer") // Event from dummyToken
                .withArgs(ceTokenAddress, owner.address, stuckAmount);

            expect(await dummyToken.balanceOf(ceTokenAddress)).to.equal(0);
            expect(await dummyToken.balanceOf(owner.address)).to.equal(ownerInitialDummyBalance + stuckAmount);
        });
    });
});