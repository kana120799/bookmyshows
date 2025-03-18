import React from "react";

function Loader() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default Loader;

// <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//   <div className="flex flex-col items-center space-y-4">
//     <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
//     <p className="text-white text-lg font-semibold">Loading...</p>
//   </div>
// </div>
