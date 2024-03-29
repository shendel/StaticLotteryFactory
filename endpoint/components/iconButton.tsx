import FaIcon from "./FaIcon"
import styles from "../styles/Home.module.css"

export default function iconButton(options) {
  const {
    href,
    title,
    icon,
    onClick,
    target,
    disabled,
  } = {
    href: ``,
    title: ``,
    icon: `up-right-from-square`,
    onClick: () => {},
    ...options,
  }

  const aAttrs = {
    className: `${styles.iconButton} ${(disabled) ? styles.iconButtonDisabled : ''}`,
    alt: title,
    title,
  }
  if (href) aAttrs.href = href
  if (target) aAttrs.target = target
 
  return (
    <a {...aAttrs} onClick={() => { if (!disabled) onClick() }}>
      <FaIcon icon={icon} />
    </a>
  )
}