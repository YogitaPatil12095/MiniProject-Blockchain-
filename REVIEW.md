# REVIEW.md — Review Checklists

> Run the relevant section before ending each phase, and the full document before submission. Record results in the log at the bottom. Mark **PASS / FAIL / N/A** with evidence (command output or a screenshot).
> Reviewers: the agent (self-review), then the human team.

## A. Smart contract review (Phase 1)

**Correctness**
- [ ] Structs match the paper's Fig 2 (`EHR` 4 fields, `User` 9 fields)
- [ ] `setUserData` reverts `"Already registered"` on a second call; sets `user_address = msg.sender`
- [ ] `grantAccess` accepts only `"v"`, `"c"`, `"m"` and reverts `"Access Role Not Valid"` otherwise
- [ ] `grantAccess` reverts `"User not found"` for unregistered targets
- [ ] Duplicate grants revert with the exact messages (`Already Granted As Viewer/Creator/Master`)
- [ ] Master grant adds to both lists and both mappings
- [ ] `revokeAccess` removes from arrays (swap-and-pop) and clears mappings; patient can't revoke own viewer access
- [ ] `viewEHR` requires the target registered and the caller a viewer; exact messages
- [ ] `createEHR` requires the target registered and the caller a creator; `createdAt = block.timestamp`
- [ ] `getUserData` and `getMyAccessList` behave as specified

**Security**
- [ ] All role checks use `msg.sender`, never a caller-supplied "who am I" parameter
- [ ] No unbounded loops in state-changing functions except bounded array removal; note the cost
- [ ] No `tx.origin`, no `selfdestruct`, no delegatecall, no external calls to unknown contracts
- [ ] No ETH is held or transferable by the contract
- [ ] Events emitted for every state change
- [ ] Solidity version pinned (`0.8.24`); compiler warnings resolved or explained
- [ ] Comments do not claim data is "private". Note that on-chain storage is publicly readable

**Quality**
- [ ] NatSpec on all public/external functions
- [ ] Names consistent with the paper
- [ ] No dead code

## B. Test review (Phase 1)

- [ ] 20 paper-derived tests present (5 sections × 4 cases) and named after the paper's cases
- [ ] ≥ 3 extra tests: revoke viewer, revoke creator, duplicate registration
- [ ] Negative tests check the **exact revert message**
- [ ] Uses `loadFixture` (no cross-test state leakage)
- [ ] `npx hardhat test` fully green; output pasted in `MEMORY.md`
- [ ] Gas report shows min/max/avg for `setUserData`, `grantAccess`, `createEHR`
- [ ] Gas comparison table vs the paper is filled in (paper avg: 206,029 / 75,142 / 203,904)

## C. Frontend review (Phase 3)

**Functionality**
- [ ] Connect wallet works; missing MetaMask handled
- [ ] Wrong network detected with a switch prompt
- [ ] `accountsChanged` and `chainChanged` handled without a manual reload
- [ ] Unregistered → registration form; registered → dashboard
- [ ] FR-1 to FR-7 each work as in `PRD.md`
- [ ] Views use a **signer-connected** contract
- [ ] `Result` structs and BigInt values converted before rendering
- [ ] Address inputs validated with `ethers.isAddress`
- [ ] File upload has a size limit and shows progress

**UX**
- [ ] Gas badge beside every write action
- [ ] Loading, success (tx hash) and error states everywhere
- [ ] Reverts mapped per `DESIGN.md` section 6
- [ ] Demo banner always visible
- [ ] Empty states present
- [ ] Layout OK at 360 px, 768 px, 1280 px
- [ ] Keyboard navigation and focus rings work

**Hygiene**
- [ ] No console errors or unhandled promise rejections
- [ ] No secrets in the source; `.env.example` exists; `.env` git-ignored
- [ ] Pinata call verified against the **current** Pinata docs

## D. Integration and E2E review

Run `MILESTONES.md` E2E script and confirm:
- [ ] Register patient and doctor
- [ ] Patient grants doctor Master
- [ ] Doctor uploads a file; CID appears on-chain; MetaMask confirmation shown
- [ ] Patient sees the record; IPFS link opens the file
- [ ] Non-granted account is blocked on both view and create
- [ ] Revoke works and the doctor is blocked afterwards
- [ ] Restarting the local node and redeploying regenerates `contract.json` and the UI works after clearing MetaMask activity data

## E. Documentation review (Phase 4)

- [ ] README lets a new person run everything from scratch
- [ ] Env vars documented; no real secrets
- [ ] MetaMask local network settings documented (RPC, chainId 31337)
- [ ] "Deviations from the paper" section matches `PRD.md` section 9
- [ ] "Limitations" section matches `PRD.md` section 10
- [ ] Screenshots included: tests, gas table, each screen, MetaMask confirmations
- [ ] Sepolia steps included, or clearly marked optional

## F. Paper-conformance matrix

| Paper item | Implemented | Evidence |
|---|---|---|
| Fig 1 architecture (User → App → IPFS/MetaMask → Ethereum) | ☐ | |
| Fig 2 data structures | ☐ | |
| UC-1 Login (`setUserData`) | ☐ | |
| UC-2 View Health Record | ☐ | |
| UC-3 View Access List | ☐ | |
| UC-4 Grant Access (v/c/m) | ☐ | |
| UC-5 View Patient Record | ☐ | |
| UC-6 Create Patient Record | ☐ | |
| 20 test cases | ☐ | |
| Gas table (Fig 22) reproduced | ☐ | |
| Declared deviations documented | ☐ | |

## G. Pre-submission checklist

- [ ] Fresh clone → follow README → app runs
- [ ] `git log -p` contains no keys or JWTs
- [ ] `MEMORY.md` is up to date
- [ ] Report contains: architecture, contract walkthrough, test results, gas comparison, demo screenshots, deviations, limitations, future work
- [ ] Team can explain: why IPFS + on-chain CID, what `msg.sender` does in view calls, why on-chain data is still public, what the gas badge means

## Review log

Copy this block for each review.

```
### Review — Phase <N> — <date> — Reviewer: <name/agent>
| Section | Result | Notes / Evidence |
|---|---|---|
| A Contract |  |  |
| B Tests |  |  |
| C Frontend |  |  |
| D E2E |  |  |
| E Docs |  |  |
| F Paper matrix |  |  |

Issues found:
1.
Actions:
1.
Decision: ☐ Approve next phase  ☐ Fix and re-review
```
