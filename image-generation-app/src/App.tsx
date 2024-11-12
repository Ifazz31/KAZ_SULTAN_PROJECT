import React, { useEffect } from "react";
import ImageGenerationForm from "./ImageGenerationForm";

const App: React.FC = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8188/ws");
    console.log("check connectection", socket);

    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    socket.onmessage = (event) => {
      console.log("data", event.data);

      // try {
      //   const message = JSON.parse(event.data);
      //   console.log("WebSocket message:", message);

      //   if (
      //     message.type === "progress" &&
      //     message.data &&
      //     typeof message.data.progress === "number"
      //   ) {
      //     setProgress(message.data.progress);
      //   }
      // } catch (error) {
      //   console.error("Error parsing WebSocket message:", error);
      // }
    };

    socket.onclose = () => {
      console.log("Disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);
  return (
    <div>
      <ImageGenerationForm />
    </div>
  );
};

export default App;
