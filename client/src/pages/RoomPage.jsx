import { FaPaintbrush, FaArrowRight, FaShapes, FaCaretDown } from "react-icons/fa6";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import rough from "roughjs";
import { useParams } from "react-router-dom";

const RoomPage = ({ socket }) => {

  const colorInputRef = useRef(null);
  const { roomId } = useParams();

  const [color, setColor] = useState("#ff0000");
  const [tool, setTool] = useState("pencil");
  const [userCount, setUserCount] = useState(0);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [img, setImg] = useState(null);
  const [history, setHistory] = useState([]);

  const roughGenerator = rough.generator();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const handleColorClick = () => colorInputRef.current.click();
  const handleColorChange = (e) => setColor(e.target.value);

  const undo = () => {
    if (elements.length === 1) {
      setHistory((prev) => [...prev, elements[elements.length - 1]]);
      handleCanvasClear();
    } else {
      setElements((prev) => prev.slice(0, -1));
      setHistory((prev) => [...prev, elements[elements.length - 1]]);
    }
  }

  const redo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1]
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  }

  // Handle Canvas Clear
  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillRect = "white";
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
  }

  // Mouse Down
  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements, {
          type: "pencil",
          x: offsetX, 
          y: offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,

        }
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements, {
          type: "line",
          offsetX, 
          offsetY,
          width: offsetX, 
          height: offsetY, 
          stroke: color
        }
      ]);
    } else if (tool === "shape") {
      setElements((prevElements) => [
        ...prevElements, {
          type: "shape", 
          offsetX, 
          offsetY, 
          width: 0, 
          height: 0, 
          stroke: color
        }
      ]);
    }
    setIsDrawing(true);
  }

  // Mouse Move
  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) => 
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                path: newPath
              }
            } else {
              return ele;
            }
          })
        )
      } else if (tool === "line") {
        setElements((prevElements) => 
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY
              };
            } else {
              return ele;
            }
          })
        )
      } else if (tool === "shape") {
        setElements((prevElements) => 
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX, 
                height: offsetY - ele.offsetY
              };
            } else {
              return ele;
            }
          })
        )
      }
    }

  }
  const handleMouseUp = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(false);
  }

  // Assume you already have `roomId` from props or route params
  const handleSync = () => {
    const canvasImage = canvasRef.current.toDataURL("image/png");
    socket.emit("whiteboardData", { roomId, imgURL: canvasImage });
  };

  useLayoutEffect(() => {
    const roughCanvas = rough.canvas(canvasRef.current);
  
    if (elements.length > 0) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  
    elements.forEach((element) => {
      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, { stroke: element.stroke, strokeWidth: 5, roughness: 0 });
      } else if (element.type === "line") {
        roughCanvas.draw(
          roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height, { stroke: element.stroke, strokeWidth: 5 })
        );
      } else if (element.type === "shape") {
        roughCanvas.draw(
          roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height, { stroke: element.stroke, strokeWidth: 5 })
        );
      }
    });
  
    handleSync(); // send image to server
  }, [elements]);
  
  useEffect(() => {
    socket.emit("userJoined", { roomId });
  }, [socket, roomId]);  

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    socket.on("whiteboardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, []);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  return(
    <div className="w-full h-screen flex flex-col items-center">
      {/* Title */}
      <div className="flex flex-col items-center -space-y-6">
        <p className="text-6xl font-honk p-6">TacMap</p>
        <p className="text-sm font-lilita italic">Users Online: {userCount}</p>
      </div>
      {/* Options */}
      <div className="w-full h-full flex flex-col items-center justify-start">
        {/* Top Bar */}
        <div className="w-full h-16 flex mb-6">
          {/* Tools and Color */}
          <div className="w-full h-full flex items-center justify-start space-x-4 pl-2 md:pl-24">
            <div className="flex items-center space-x-2">
              <div className={`border-2 p-1 rounded-md ${tool === "pencil" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("pencil")}><FaPaintbrush/></div>
              <div className={`border-2 p-1 rounded-md ${tool === "line" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("line")}><FaArrowRight/></div>
              <div className={`border-2 p-1 rounded-md ${tool === "shape" ? "bg-gray-300 border-blue-500" : "border-gray-400"}`} onClick={() => setTool("shape")}><FaShapes/></div>
            </div>
            {/* Custom Color Picker */}
            <div className="flex items-center cursor-pointer px-2 py-1 bg-white rounded-md border border-gray-400" onClick={handleColorClick}>
              <div className="w-6 h-6 rounded-full border border-gray-400" style={{ backgroundColor: color }}/>
              <FaCaretDown className="ml-2 text-gray-700" />
            </div>
            {/* Invisible Color Picker */}
            <input type="color" ref={colorInputRef} value={color} onChange={handleColorChange} className="invisible absolute top-34" />
          </div>
          {/* Edits */}
          <div className="w-full h-full flex items-center justify-end space-x-4 pr-2 md:pr-24">
            <div className="flex items-center justify-center space-x-2">
              {/* Undo Button */}
              <button 
                className="border-2 py-1 px-2 rounded-md border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={elements.length === 0}
                onClick={() => undo()}
              >
                <FaUndo/>
              </button>
              {/* Redo Button */}
              <button 
                className="border-2 py-1 px-2 rounded-md border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={history.length < 1}
                onClick={() => redo()}
              >
                <FaRedo/>
              </button>
            </div>
            <div className="border-2 py-1 px-2 rounded-md border-gray-400 cursor-pointer hover:text-red-500" onClick={handleCanvasClear}><FaTrash/></div>
          </div>
        </div>
        {/* Canvas */}
        <div className="w-[90%] h-1/2 md:h-3/4 border-4 rounded-xl bg-gray-100 overflow-hidden" style={{ background: `url(${img})` }}>
          <canvas 
            className="touch-none" 
            ref={canvasRef}
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;