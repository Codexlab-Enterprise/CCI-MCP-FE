import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="flex  items-center justify-center w-full backdrop-blur-sm h-screen">
      <div className="bg-white p-2 flex items-center gap-2">
        <Loader2 className="animate-spin" />
        Loading...
      </div>
    </div>
  );
};

export default Loader;
