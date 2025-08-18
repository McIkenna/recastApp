const ReactPanel = ({
  selectedInfo,
  selectedId,
}) => {

  return (
    <div>
      <div >
        <h3>Selected Cube</h3>
        <p>You will have to select color first before selecting cube for a color change</p>
        {!selectedInfo ? (
          <p>Click any cube in the canvas</p>
        ) : (<div>
          <div className="info">
            <div className="text-headers">
              <h3>{selectedId} : {selectedInfo.title}</h3>
              <p>{selectedInfo.description}</p>
            </div>
            <div className="info-table">
            <table>
              <tbody>
              {Object.entries(selectedInfo?.mesh)?.map(([key, value]) => (
                // console.log(key, typeof value)
                typeof value !== 'object' ?
                  <tr>
                    <td>{key}</td>
                    <td>{String(value)}</td>
                  </tr> :
                  <tr>
                    <td>{key}</td>
                    <td>
                      {
                        Object.entries(value).map(([innerKey, innerValue]) => (
                          // console.log('innerValue', innerValue)
                          typeof innerValue !== 'object' ?
                            <tr>
                              <td>{innerKey}</td>
                              <td>{String(innerValue)}</td>
                            </tr> : null

                        ))
                      }
                    </td>
                  </tr>
              )
              )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default ReactPanel