import React from 'react'

const ReactPanel = ({
    selectedInfo,
    selectedId,
}) => {
    console.log('selectedInfo', selectedInfo)
  return (
    <div>
        <div className="mt-6">
          <h3 className="text-lg font-medium">Selected Cube</h3>
           <p className="text-sm text-gray-500 mt-2">You will have to select color first before selecting cube for a color change</p>
          {!selectedInfo ? (
            <p className="text-sm text-gray-500 mt-2">Click any cube in the canvas or select one from the list.</p>
          ) : (
                <div className="text-sm text-gray-700 mb-1">
                    <h1>{selectedId}</h1>
                    <h1>{selectedInfo.title}</h1>
                    
                </div>
           
          )}
        </div>
    </div>
  )
}

export default ReactPanel