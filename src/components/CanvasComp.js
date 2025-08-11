
const CanvasComp = ({
    mountRef,
    colorChangeHander,
    moveBoxUp,
    moveBoxDown
}) => {
    // Default export React component
    return (<>
        <div>
            <button id='yellow' onClick={(e) =>{colorChangeHander(e.target.id)}}>Yellow</button>
            <button id='green' onClick={(e) =>{colorChangeHander(e.target.id)}}>Green</button>
            <button id='blue' onClick={(e) =>{colorChangeHander(e.target.id)}}>Blue</button>

        </div>
        <div ref={mountRef} style={{ minHeight: '80vh' }} />
        <div>
            <button onClick={moveBoxUp}>Move Up</button>
            <button onClick={moveBoxDown}>Move Down</button>
        </div>
        </>
    )

}

export default CanvasComp
