import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useCanvas } from "../hooks/useCanvas";
import Title from "../components/Title";
import Toolbar from "../components/Toolbar";

const RoomPage = ({ user, socket }) => {
  const colorInputRef = useRef(null);
  const roughGenerator = rough.generator();

  const {
    canvasRef,
    elements,
    history,
    color,
    setColor,
    undo,
    redo,
    clearCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvas("#000000");

  const [tool, setTool] = useState("pencil");
  const [img, setImg] = useState(null);
  const [userCount, setUserCount] = useState(0);

  const handleColorClick = () => colorInputRef.current.click();
  const handleColorChange = (e) => setColor(e.target.value);

  // Drawing effect
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, { stroke: element.stroke, strokeWidth: 5, roughness: 0 });
      } else if (element.type === "line") {
        roughCanvas.draw(
          roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height, {
            stroke: element.stroke,
            strokeWidth: 5,
            roughness: 0,
          })
        );
      } else if (element.type === "shape") {
        roughCanvas.draw(
          roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height, {
            stroke: element.stroke,
            strokeWidth: 5,
            roughness: 0,
          })
        );
      }
    });

    // Emit canvas image to server
    if (user?.roomId) {
      const canvasImage = canvas.toDataURL();
      socket.emit("whiteboardData", { canvasImage, roomId: user.roomId });
    }
    
  }, [elements, socket, user?.roomId, roughGenerator]);

  // Initialize canvas size
  useEffect(() => {
    if (!user?.presenter) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
  }, [user?.presenter, color, canvasRef]);

  useEffect(() => {
    if (!user?.roomId) return;
  
    // Join the room once
    socket.emit("userJoined", { roomId: user.roomId });
  
    // Listen for updates
    const listener = (data) => {
      if (data.roomId === user.roomId) setImg(data.img);
    };
    socket.on("whiteboardDataResponse", listener);
  
    // Cleanup on unmount or when roomId/socket changes
    return () => socket.off("whiteboardDataResponse", listener);
  }, [socket, user?.roomId]);
  

  return (
    <div className="w-full h-screen flex flex-col items-center">
      {/* Title */}
      <Title userCount={userCount} />

      {/* Toolbar */}
      {user?.presenter && (
        <Toolbar tool={tool} handleColorClick={handleColorClick} handleColorChange={handleColorChange} color={color} colorInputRef={colorInputRef} elements={elements} undo={undo} redo={redo} clearCanvas={clearCanvas} />
      )}

      {/* Canvas */}
      <div className="w-[90%] h-1/2 md:h-3/4 border-4 rounded-xl bg-gray-100 overflow-hidden">
        {user?.presenter ? (
          <canvas ref={canvasRef} onPointerDown={(e) => handleMouseDown(e, tool)} onPointerMove={(e) => handleMouseMove(e, tool)} onPointerUp={handleMouseUp} className="touch-none" />
        ) : (
          img && <img src={img} alt="Realtime Whiteboard" />
        )}
      </div>
    </div>
  );
};

export default RoomPage;
