import React from 'react';

const ProgressBar = ({ message, progress }) => {

    return (
        <div id="progress-bar">
            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
            <span>{message} {progress && Math.round(progress) + "%"}</span>
        </div>
    )
}

export default ProgressBar;