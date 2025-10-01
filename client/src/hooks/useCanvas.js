import { useState, useRef } from "react";

export const useCanvas = (initialColor = "#ff0000") => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(initialColor);

  const undo = () => {
    if (elements.length === 0) return;
    if (elements.length === 1) {
      setHistory(prev => [...prev, elements[elements.length - 1]]);
      clearCanvas();
    } else {
      setElements(prev => prev.slice(0, -1));
      setHistory(prev => [...prev, elements[elements.length - 1]]);
    }
  };

  const redo = () => {
    if (history.length === 0) return;
    setElements(prev => [...prev, history[history.length - 1]]);
    setHistory(prev => prev.slice(0, -1));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setElements([]);
  };

  const handleMouseDown = (e, tool) => {
    const { offsetX, offsetY } = e.nativeEvent;

    const newElement =
      tool === "pencil"
        ? { type: "pencil", x: offsetX, y: offsetY, path: [[offsetX, offsetY]], stroke: color }
        : tool === "line"
        ? { type: "line", offsetX, offsetY, width: offsetX, height: offsetY, stroke: color }
        : { type: "shape", offsetX, offsetY, width: 0, height: 0, stroke: color };

    setElements(prev => [...prev, newElement]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e, tool) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    setElements(prev =>
      prev.map((ele, index) => {
        if (index !== prev.length - 1) return ele;

        if (tool === "pencil") return { ...ele, path: [...ele.path, [offsetX, offsetY]] };
        if (tool === "line") return { ...ele, width: offsetX, height: offsetY };
        if (tool === "shape") return { ...ele, width: offsetX - ele.offsetX, height: offsetY - ele.offsetY };
        return ele;
      })
    );
  };

  const handleMouseUp = () => setIsDrawing(false);

  return {
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
  };
};
