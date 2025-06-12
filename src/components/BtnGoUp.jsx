import React from 'react'

const BtnGoUp = ({isVisible,scrollToTop}) => {
    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className='btnGoUp'
                    aria-label="Volver arriba"
                >
                    ↑
                </button>
            )}
      </>
    )
}

export default BtnGoUp