import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import adminFormRow from "../adminFormRow"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import callLotteryMethod from "../../helpers/callLotteryMethod"


export default function TabGameRules(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData,
    getStorageData,
  } = options

  console.log('>>> storageData', storageData)

  const [ newTotalSum, setNewTotalSum ] = useState(0)
  const [ newUndist, setNewUndist ] = useState(0)
  const [ newBallsCount, setNewBallsCount ] = useState(6)
  const [ newMatchRules, setNewMatchRules ] = useState(storageData.matchRules || {
    match_1: 39.2,
    match_2: 58.8,
    match_3: 6.125,
    match_4: 12.25,
    match_5: 24.5,
    match_6: 49,
  })
  const [ matchArray, setMatchArray ] = useState([1,2,3,4,5,6])
  const [ isSaveBallsCount, setIsSaveBallsCount ] = useState(true)
  const [ isSaveMatches, setIsSaveMatches ] = useState(false)

  const [ newBurn, setNewBurn ] = useState(storageData.burn)

  const onChangeBallsCount = (newCount) => {
    if (newCount<2) newCount = 2
    if (newCount>6) newCount = 6
    setNewBallsCount(newCount)
    setMatchArray((prev) => {
      return [1,2,3,4,5,6].filter((matchCount) => matchCount <= parseInt(newCount) )
    })
  }

  const doRecalcSum = () => {
    let _totalSum = 0
    for(let match_count = 1; match_count <= 6; match_count++) {
      if (match_count <= newBallsCount) _totalSum = _totalSum + newMatchRules[`match_${match_count}`]
    }
    setNewTotalSum(_totalSum)
    setNewUndist(100 - _totalSum)
  }

  useEffect(() => {
    doRecalcSum()
  }, [newBallsCount, newMatchRules ])

  const doFillUndist = (ballsCount) => {
    setNewMatchRules((prev) => {
      return {
        ...prev,
        [`match_${ballsCount}`]: prev[`match_${ballsCount}`] + newUndist,
      }
    })
  }

  
  const doSaveBallsCount = () => {
    const storage = getStorageData()
    console.log(storage)
    callLotteryMethod({
      isCall: true,
      chainId: storage.chainId,
      contractAddress: storage.lotteryAddress,
      method: 'numbersCount',
      args: []
    }).then((res) => {
      console.log('>>> res', res)
    })
  }

  const doSaveMatches = () => {
    openConfirmWindow({
      title: `Save match rules`,
      message: `Save winning balls match rules to storage config?`,
      onConfirm: () => {
        setIsSaveMatches(true)
        addNotify(`Saving winning rules...`)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction`)
          },
          onReady: () => {
            setIsSaveMatches(false)
            addNotify(`Changed saved`, `success`)
          },
          onError: (err) => {
            setIsSaveMatches(false)
            addNotify(`Fail save changes. ${err.message ? err.message : ''}`, `error`)
          },
          newData: {
            matchRules: newMatchRules,
            burn: newBurn,
          }
        })
      }
    })
  }

  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
          <div className={styles.subFormInfo}>
            <h3>Lottery rules</h3>
            <div className={styles.subForm}>
              <div className={styles.infoRow}>
                <label>Balls count:</label>
                <div>
                  <div>
                    <input type="number" min="2" max="6" step="1" value={newBallsCount} onChange={(e) => { onChangeBallsCount(e.target.value) }} />
                    {iconButton({
                      title: `Save to contract`,
                      onClick: doSaveBallsCount,
                      icon: 'save',
                    })}
                  </div>
                </div>
              </div>
            </div>
            <h3>Distribution of prizes %</h3>
            <div className={styles.subForm}>
              <h4>Distribute the winning percentage based on the number of matched balls</h4>
              {matchArray.map((match_count) => {
                return (
                  <div className={styles.infoRow} key={match_count}>
                    <label>Match {match_count} ball:</label>
                    <div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newMatchRules[`match_${match_count}`]}
                          onChange={(e) => {
                            let count = 0
                            try {
                              count = parseFloat(e.target.value)
                            } catch (e) { count = 0 }
                            if (count<0) count = 0
                            if (count>100) count = 100

                            setNewMatchRules((prev) => {
                              return {
                                ...prev,
                                [`match_${match_count}`]: count,
                              }
                            })
                          }}
                        />
                        <strong>%</strong>
                        <a className={styles.buttonWithIcon} onClick={() => { doFillUndist(match_count) }}>
                          <FaIcon icon="arrow-left" />
                          Equalize the remainder
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className={styles.infoRow}>
                <label>Burn (From 2 to 30):</label>
                <div>
                  <div>
                    <input type="number" min="2" max="30" value={newBurn} onChange={(e) => { setNewBurn(e.target.value) }} />
                    <strong>%</strong>
                  </div>
                  <div>How many percents of the band in a round will be burned</div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Sum:</label>
                <div>
                  <b>{newTotalSum}</b><strong>%</strong>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Undistributed:</label>
                <div>
                  {(newUndist) !== 0 ? (
                    <>
                      <b className={styles.hasError}>
                        {newUndist} %
                      </b>
                    </>
                  ) : (
                    <>
                      <b>{newUndist}</b><strong>%</strong>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.actionsRow}>
                <button disabled={newUndist !== 0 || isSaveMatches} onClick={doSaveMatches}>
                  {isSaveMatches ? 'Saving...' : 'Save match rules and burn amount'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}