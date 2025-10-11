import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import rough from "roughjs";
import { useCanvas } from "../hooks/useCanvas";
import Title from "../components/Title";
import Toolbar from "../components/Toolbar";

import temp from "../assets/temp.jpg";

const RoomPage = ({ user, socket }) => {

  const colorInputRef = useRef(null);
  const roughGenerator = useMemo(() => rough.generator(), []);
  const { canvasRef, elements, history, color, setColor, undo, redo, clearCanvas, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvas("#000000");

  const [tool, setTool] = useState("pencil");
  const [img, setImg] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [map, setMap] = useState(temp);
  const [joined, setJoined] = useState(false);
  const [joinee, setJoinee] = useState("");

  // Track CSS and pixel sizes of canvas
  const [canvasSize, setCanvasSize] = useState(() => {
    const dpr = window.devicePixelRatio || 1;
    return { cssWidth: window.innerWidth, cssHeight: window.innerHeight, pixelWidth: window.innerWidth * dpr, pixelHeight: window.innerHeight * dpr, dpr };
  });

  useEffect(() => {
    if (!user?.roomId) return;

    // Emit to userJoined in here for the host so count updates properly
    // Basically if you emit in the homePage, count stays at 0 then updates to 2 instead of 1 => 2
    socket.emit("userJoined", user);

    // Listening for any updates of room user count from server
    // IMPORTANT: CLeanup listener to avoid stacking multiple listeners when roomId changes
    // Show everyone who joined
    const handleCount = ({ roomId, count, name }) => {
      if (roomId === user.roomId) {
        setUserCount(count);
        if (name && name.trim()) {
          setJoinee(name);
          setJoined(true);
          setTimeout(() => setJoined(false), 3000);
        }
      }
    };    
    socket.on("userCountUpdate", handleCount);
    return () => socket.off("userCountUpdate", handleCount);
  }, [socket, user?.roomId]);
  

  // Resize listener (optional, keeps everything responsive)
  useEffect(() => {
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      setCanvasSize({
        cssWidth: window.innerWidth,
        cssHeight: window.innerHeight,
        pixelWidth: window.innerWidth * dpr,
        pixelHeight: window.innerHeight * dpr,
        dpr,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleColorClick = () => colorInputRef.current.click();
  const handleColorChange = (e) => setColor(e.target.value);

  // Drawing effect
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, {
          stroke: element.stroke,
          strokeWidth: 5,
          roughness: 0,
        });
      } else if (element.type === "line") {
        roughCanvas.draw(
          roughGenerator.line(
            element.offsetX,
            element.offsetY,
            element.width,
            element.height,
            {
              stroke: element.stroke,
              strokeWidth: 5,
              roughness: 0,
            }
          )
        );
      } else if (element.type === "shape") {
        roughCanvas.draw(
          roughGenerator.rectangle(
            element.offsetX,
            element.offsetY,
            element.width,
            element.height,
            {
              stroke: element.stroke,
              strokeWidth: 5,
              roughness: 0,
            }
          )
        );
      }
    });

    // Emit canvas image to server
    if (user?.roomId) {
      const canvasImage = canvas.toDataURL();
      socket.emit("whiteboardData", { canvasImage, roomId: user.roomId });
    }
  }, [elements, socket, user?.roomId, roughGenerator]);

  // Initialize canvas with HiDPI scaling
  // This was ChatGPT attemping to solve image scaling issues, not really sure what is happening. It didn't work fully but almost
  useEffect(() => {
    if (!user?.presenter) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { pixelWidth, pixelHeight, cssWidth, cssHeight, dpr } = canvasSize;
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
  }, [user?.presenter, color, canvasRef, canvasSize]);

  // Socket setup for viewers
  useEffect(() => {
    if (!user?.roomId || user?.presenter) return;

    // Once user joins, receive image from server if the room already has an image
    // IMPORTANT: CLeanup listener to avoid stacking multiple listeners when roomId changes
    socket.emit("userJoined", { roomId: user.roomId, name: user.name });
    const listener = (data) => { if (data.roomId === user.roomId) setImg(data.img) };
    socket.on("whiteboardDataResponse", listener);
    return () => socket.off("whiteboardDataResponse", listener);
  }, [socket, user?.roomId]);

  return (
    <div className="w-full h-screen flex flex-col items-center">
      {/* Title */}
      <Title userCount={userCount} />

      {/* Message of who joined */}
      <div className={`fixed top-0 left-0 m-6 p-3 rounded-xl font-lilita shadow-xl border-2 ransform transition-all duration-500 ease-in-out bg-blue-300 ${joined ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>{joinee} has joined the room! </div>

      {/* Toolbar */}
      {user?.presenter && ( <Toolbar tool={tool} setTool={setTool} handleColorClick={handleColorClick} handleColorChange={handleColorChange} color={color} colorInputRef={colorInputRef} elements={elements} history={history} undo={undo} redo={redo} clearCanvas={clearCanvas} /> )}

      {/* Canvas or Viewer Image */}
      {/* If presenter they get interactive canvas, if viewer they get static image */}
      <div className="border-4 w-[98%] mb-12 rounded-xl bg-gray-100 overflow-hidden flex justify-center items-center" >
        {user?.presenter ? (
          <canvas ref={canvasRef} onPointerDown={(e) => handleMouseDown(e, tool)} onPointerMove={(e) => handleMouseMove(e, tool)} onPointerUp={handleMouseUp} className="touch-none" style={{ backgroundImage: `url(${map})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        ) : (
          img && (
            <img src={img} alt="Realtime Whiteboard" style={{ backgroundImage: `url(${map})`, backgroundSize: "cover", backgroundPosition: "center", display: "block", width: `${canvasSize.cssWidth}px`, height: `${canvasSize.cssHeight}px` }} />
          )
        )}
      </div>
    </div>
  );
};

export default RoomPage;
