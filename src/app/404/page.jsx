import React from "react";

const Custom404 = () => {
    return (
        <div
            className="flex justify-center items-center h-screen flex-col"
            style={{
                backgroundImage: 'url("/404.gif")', // Set the background GIF
                backgroundSize: '300px', // Ensure the image covers the entire container
                backgroundPosition: 'center', // Center the background
            }}
        >
        </div>
    );
};

export default Custom404;
