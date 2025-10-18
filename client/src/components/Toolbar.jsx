import { FaPaintbrush, FaArrowRight, FaShapes, FaCaretDown } from "react-icons/fa6";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";

const Toolbar = ({ tool, setTool, handleColorClick, handleColorChange, color, colorInputRef, elements, history, undo, redo, clearCanvas, colors, darkmode }) => {

  // Icon color
  const iconColor = darkmode ? colors.darkText : colors.lightText;
  const lightHover = colors.lightAccent;
  const darkHover = colors.darkAccent;
  const [currentHoverColor, setCurrentHoverColor] = useState(`${darkHover}`);

  useEffect(() => {
    if (!darkmode) setCurrentHoverColor(`${darkHover}`);
    else setCurrentHoverColor(`${lightHover}`);
  }, [darkmode]);

  // Helper: compute border color dynamically for tool buttons
  const getToolBorderColor = (buttonTool) => {
    // Selected Tool & Unselected Tool
    if (tool === buttonTool) return darkmode ? colors.lightAccent : colors.darkAccent;
    else return darkmode ? colors.darkText : colors.lightText;
  };

  return (
    <div className="w-full h-16 flex mb-6 justify-between px-6">
      {/* Left Side Buttons */}
      <div className="flex items-center space-x-2">
        {/* Paint Brush */}
        <button className="border-2 p-1 rounded-md cursor-pointer" onClick={() => setTool("pencil")} style={{ borderColor: `#${getToolBorderColor("pencil")}` }} >
          <FaPaintbrush style={{ color: iconColor }} />
        </button>
        {/* Line Draw */}
        <button className="border-2 p-1 rounded-md cursor-pointer" onClick={() => setTool("line")} style={{ borderColor: `#${getToolBorderColor("line")}` }} >
          <FaArrowRight style={{ color: iconColor }} />
        </button>
        {/* Square Draw */}
        <button className="border-2 p-1 rounded-md cursor-pointer" onClick={() => setTool("shape")} style={{ borderColor: `#${getToolBorderColor("shape")}` }} >
          <FaShapes style={{ color: iconColor }} />
        </button>
        {/* Color picker */}
        <div className={`flex items-center relative cursor-pointer px-2 py-[2px] border-2 rounded-md border`} onClick={handleColorClick} style={{ borderColor: `#${darkmode ? colors.darkText : colors.lightText}` }} >
          <div className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: color, borderColor: `#${darkmode ? colors.darkText : colors.lightText}` }} />
          <FaCaretDown className="ml-2" style={{ color: `#${darkmode ? colors.darkText : colors.lightText}` }} />
          <input type="color" ref={colorInputRef} value={color} onChange={handleColorChange} className="absolute top-2 inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>
      
      {/* Right Side Buttons */}
      <div className="flex items-center space-x-2">
        {/* Undo Button */}
        <button disabled={elements.length === 0} onClick={undo} onMouseEnter={(e) => e.currentTarget.firstChild.style.color = `#${currentHoverColor}`} onMouseLeave={(e) => e.currentTarget.firstChild.style.color = `#${iconColor}`} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: `#${iconColor}` }} >
          <FaUndo style={{ color: `#${iconColor}` }} />
        </button>
        {/* Redo Button */}
        <button disabled={history.length < 1} onClick={redo} onMouseEnter={(e) => e.currentTarget.firstChild.style.color = `#${currentHoverColor}`} onMouseLeave={(e) => e.currentTarget.firstChild.style.color = `#${iconColor}`} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: `#${iconColor}` }} >
          <FaRedo style={{ color: `#${iconColor}` }} />
        </button>
        {/* Delete Button */}
        <button disabled={elements.length === 0} onClick={clearCanvas} onMouseEnter={(e) => e.currentTarget.firstChild.style.color = "red" } onMouseLeave={(e) => e.currentTarget.firstChild.style.color = `#${iconColor}`} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: `#${iconColor}` }} >
          <FaTrash style={{ color: `#${iconColor}` }} />
        </button>
      </div>

    </div>
  );
};

export default Toolbar;
