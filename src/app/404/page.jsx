import React from "react";

const Custom404 = () => {
    return (
        <div
            className="flex justify-center items-center h-screen flex-col"
            style={{
                backgroundImage: 'url("/404.gif")', 
                backgroundSize: '300px', 
                backgroundPosition: 'center',
            }}
        >
        </div>
    );
};

export default Custom404;
