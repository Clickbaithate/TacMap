import { FaPaintbrush, FaArrowRight, FaShapes, FaCaretDown } from "react-icons/fa6";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";

// TODO: Add disabled cursor icon when hovering over disabled button
const Toolbar = ({ tool, setTool, handleColorClick, handleColorChange, color, colorInputRef, elements, history, undo, redo, clearCanvas }) => {
  
  return(
    <div className="w-full h-16 flex mb-6 justify-between px-6">
      <div className="flex items-center space-x-2">
        <button className={`border-2 p-1 rounded-md cursor-pointer hover:text-yellow-500 ${tool === "pencil" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("pencil")}><FaPaintbrush /></button>
        <button className={`border-2 p-1 rounded-md cursor-pointer hover:text-purple-500 ${tool === "line" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("line")}><FaArrowRight /></button>
        <button className={`border-2 p-1 rounded-md cursor-pointer hover:text-green-500 ${tool === "shape" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("shape")}><FaShapes /></button>

        <div className="flex items-center cursor-pointer px-2 py-1 bg-white rounded-md border border-gray-400 hover:border-red-500" onClick={handleColorClick}>
          <div className="w-6 h-6 rounded-full border border-gray-400" style={{ backgroundColor: color }} />
          <FaCaretDown className="ml-2 text-gray-700" />
          <input type="color" ref={colorInputRef} value={color} onChange={handleColorChange} className="hidden" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button disabled={elements.length === 0} onClick={undo} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:hover:text-black border-gray-400 hover:text-blue-500"><FaUndo /></button>
        <button disabled={history.length < 1} onClick={redo} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:hover:text-black border-gray-400 hover:text-blue-500"><FaRedo /></button>
        <button disabled={elements.length === 0} onClick={clearCanvas} className="border-2 py-1 px-2 rounded-md cursor-pointer disabled:opacity-50 disabled:hover:text-black border-gray-400 hover:text-red-500"><FaTrash /></button>
      </div>
    </div>
  );

}

export default Toolbar;