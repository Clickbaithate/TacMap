import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import rough from "roughjs";
import { useCanvas } from "../hooks/useCanvas";
import Title from "../components/Title";
import Toolbar from "../components/Toolbar";

import temp from "../assets/background.png";
import { FaChevronLeft, FaChevronRight, FaPaperPlane } from "react-icons/fa6";

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
  const [chatOpen, setChatOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

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
  
  useEffect(() => {
    const handleMessageHistory = (history) => {
      // set full chat log (initial load)
      setMessages(history);
    };
  
    const handleMessageResponse = (data) => {
      // add a single live message
      if (data.name === user.name) return;
      setMessages((prev) => [...prev, data]);
    };
  
    socket.on("messageHistory", handleMessageHistory);
    socket.on("messageResponse", handleMessageResponse);
  
    // cleanup
    return () => {
      socket.off("messageHistory", handleMessageHistory);
      socket.off("messageResponse", handleMessageResponse);
    };
  }, [socket]);

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
  const handleSend = () => {
    if (text.trim() === "") return;

    socket.emit("message", { roomId: user.roomId, name: user.name, message: text });
    setMessages([...messages, { name: "YOU", message: text }]);
    setText("");
  }  

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
      <div className={`fixed top-0 left-0 m-6 p-3 rounded-xl font-lilita shadow-xl border-2 transform transition-all duration-500 ease-in-out bg-blue-300 ${joined ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>{joinee} has joined the room! </div>
      <div 
        className={`fixed top-0 right-0 z-30 m-6 p-2 border-2 rounded-xl cursor-pointer bg-gray-100 hover:bg-gray-300 transform transition-all duration-500 ease-in-out ${chatOpen ? "-translate-x-[80vw] md:-translate-x-[39vw]" : "translate-x-0"}`}
        onClick={() => setChatOpen(!chatOpen)}
      >
        { chatOpen ? <FaChevronRight/> : <FaChevronLeft/> }
      </div>
      <div className={`fixed top-0 right-0 w-5/6 md:w-2/5 h-screen rounded-tl-3xl rounded-bl-3xl border-2 bg-gray-300 transform transition-all duration-500 ease-in-out ${chatOpen ? "-translate-x-0 opacity-100 z-20" : "translate-x-10 opacity-0 -z-10"}`}>
        <div className="flex items-center justify-center font-lilita p-6 text-xl">Chat Room</div>
        <div className="px-3 space-y-2 h-[90%] rounded-4xl overflow-y-auto flex flex-col pb-22">
          {messages.map((msg, index) => (
            <div key={index} className="p-3 bg-gray-100 rounded-lg shadow-md" >
              <strong className="block text-blue-400 font-bold italic">{msg.name}</strong>
              <p className="text-gray-600 font-lilita">{msg.message}</p>
            </div>
          ))}
          <div className="fixed bottom-0 left-0 w-full flex my-4 items-center justify-center">
            <input className="w-full h-16 border-2 mx-2 ml-3 bg-gray-200 rounded-2xl p-2 font-lilita" placeholder="Start typing..." value={text} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }} onChange={(e) => setText(e.target.value)}/>
            <div className="w-20 h-16 my-4 mr-6 rounded-xl flex items-center justify-center border-2 cursor-pointer hover:bg-blue-300 bg-blue-200" onClick={handleSend}><FaPaperPlane/></div>
          </div>
        </div>
      </div>

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
