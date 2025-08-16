const CanvasComp = ({
    mountRef,
    colorChangeHandler,
    selectedColor
}) => {
    // Default export React component
    const activeStyle = {
        backgroundColor: 'black',
        color: 'white'
    }
    const nonActiveStyle = {
        backgroundColor: 'white',
         color: 'black'
    }
    return (<>
        <div>
            <button id='yellow' style={selectedColor === 'yellow' ? activeStyle : nonActiveStyle} onClick={(e) =>{colorChangeHandler(e.target.id)}}>Yellow</button>
            <button id='green' style={selectedColor === 'green' ? activeStyle : nonActiveStyle} onClick={(e) =>{colorChangeHandler(e.target.id)}}>Green</button>
            <button id='blue' style={selectedColor === 'blue' ? activeStyle : nonActiveStyle} onClick={(e) =>{colorChangeHandler(e.target.id)}}>Blue</button>

        </div>
        <div ref={mountRef} style={{ minHeight: '90vh' }} />
        {/* <div>
            <button onClick={moveBoxUp}>Move Up</button>
            <button onClick={moveBoxDown}>Move Down</button>
        </div> */}
        </>
    )

}

export default CanvasComp
