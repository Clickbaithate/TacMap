import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RoomPage() {

  const { roomId } = useParams();
  const navigate = useNavigate();

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const handlePrevious = () => navigate(-1);
  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setBackgroundImage(imageURL);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center" style={{ backgroundImage: 'url(/src/assets/background.png)' }}>
      <div className="w-full flex items-center justify-between p-12">
        <div className="w-24 h-12 flex items-center justify-center p-2 cursor-pointer rounded-xl font-bold italic border-3 border-transparent hover:border-white bg-purple-700" onClick={handlePrevious}>
          Return
        </div>

        <p className="text-2xl font-bold italic p-2 px-8 rounded-2xl bg-purple-700">Elden Ring: Attack Plans</p>

        <div onClick={handleCopy} className="w-24 h-12 flex items-center justify-center p-2 cursor-pointer rounded-xl font-bold italic border-3 border-transparent hover:border-white bg-purple-700">
          {copied ? "Copied!" : "Copy ID!"}
        </div>
      </div>
      <div className="w-[80%] h-[80%] relative rounded-3xl bg-cover bg-center border-4" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'url(/src/assets/cod.webp)' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload} 
          className="hidden" 
          id="upload-input" 
        />
        <label 
          htmlFor="upload-input" 
          className="absolute bottom-4 right-4 flex items-center justify-center w-24 h-10 rounded-xl font-bold cursor-pointer bg-purple-700"
        >
          Upload!
        </label>
      </div>
    </div>
  );
}

export default RoomPage;
