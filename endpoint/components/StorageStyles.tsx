export default function StorageStyles(options) {
  const { getDesign } = options;
  const _d = getDesign
  
  const getBodyBgImage = () => {
    const bgImage = getDesign('backgroundImage', 'uri')
    if (bgImage) {
      return `
        background-image: url(${bgImage});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      `
    } else return ``
  }
  return (
    <style>
      {`
         BODY {
          background: ${getDesign('backgroundColor', 'color')};
          color: ${getDesign('baseTextColor', 'color')};
          ${getBodyBgImage()}
        }
        .logoAddParams A IMG {
          max-width: ${getDesign('logoMaxWidth', 'int')}px;
        }
      `}
    </style>
  )
}