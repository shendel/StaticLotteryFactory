import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"
import { textsGroups } from "../../helpers/textsGroups"
import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'


const useStateColor = useStateUri

export default function TabTexts(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageData
  } = options

  const [ newTexts, setNewTexts ] = useState(storageData.texts)
  const [ isSaveTexts, setIsSaveTexts ] = useState(false)

  const doSaveTexts = () => {
    openConfirmWindow({
      title: `Save texts`,
      message: `Save changes to storage config?`,
      onConfirm: () => {
        setIsSaveTexts(true)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction for save changed texts`)
          },
          onReady: () => {
            addNotify(`Texts successfull saved`, `success`)
            setIsSaveTexts(false)
          },
          onError: (err) => {
            addNotify(`Fail save texts`, `error`)
            setIsSaveTexts(false)
          },
          newData: {
            texts: newTexts,
          }
        })
      }
    })
  }

  const updateStorageText = (code, newValue) => {
    setNewTexts((prev) => {
      return {
        ...prev,
        [`${code}`]: newValue,
      }
    })
  }
  const renderStorageTextArea = (options) => {
    const {
      code,
      desc,
      value,
      defValue,
      multiline,
      multilineView,
      markdown,
    } = options

    return (
      <div className={styles.adminStorageTextArea}>
        <label>
          {desc} ({code}) {markdown && (<b>(MarkDown)</b>)} {multiline && (<b>(Multiline)</b>)}
        </label>
        {(multiline || multilineView) ? (
          <textarea
            value={newTexts[code] !== undefined ? newTexts[code] : defValue}
            onChange={(e) => { updateStorageText(code, e.target.value) }}
          ></textarea>
        ) : (
          <input
            type="text"
            value={newTexts[code] !== undefined ? newTexts[code] : defValue}
            onChange={(e) => { updateStorageText(code, e.target.value) }}
          />
        )}
      </div>
    )
  }

  const [ isGroupOpened, setIsGroupOpened ] = useState({})
  
  const onGroupToggle = (groupKey) => {
    setIsGroupOpened((prev) => {
      return {
        ...prev,
        [`${groupKey}`]: isGroupOpened[groupKey] !== undefined ? !isGroupOpened[groupKey] : true
      }
    })
  }
  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
          {Object.keys(textsGroups).map((groupKey) => {
            return toggleGroup({
              title: textsGroups[groupKey].title,
              isOpened: isGroupOpened[groupKey],
              onToggle: () => { onGroupToggle(groupKey) },
              key: groupKey,
              content: (
                <div className={styles.adminFormTextGroup}>
                  {textsGroups[groupKey].items.map((itemInfo, itemKey) => {
                    const {
                      code,
                      desc,
                      value,
                      multiline,
                      markdown,
                      multilineView,
                    } = itemInfo
                    return (
                      <div key={itemKey}>
                        {renderStorageTextArea({
                          code: code,
                          desc: desc,
                          defValue: value,
                          multiline,
                          multilineView,
                          markdown,
                        })}
                      </div>
                    )
                  })}
                </div>
              )
            })
          })}
          <div className={styles.actionsRowMain}>
            <button disabled={isSaveTexts} onClick={doSaveTexts}>
              {isSaveTexts ? `Saving...` : `Save changes`}
            </button>
          </div>
        </div>
      )
    }
  }
}