import React, { useEffect, useRef } from "react";
import dinoImg from "./assets/dino.jpg"; // Ensure this image is in your public or src folder

export default function DinoRunner() {
  // Refs for managing state and variables in the canvas
  const canvasRef = useRef(null); // Reference to the canvas element
  const dinoY = useRef(360); // Reference to the dino's Y position (starting at 360px)
  const obstacles = useRef([]); // Reference to the list of obstacles
  const jumping = useRef(false); // Reference to check if the dino is jumping
  const isRunning = useRef(false); // Reference to check if the game is running
  const gravity = 4; // Amount of gravity applied to the dino when it falls
  const jumpHeight = 150; // Increased jump height to 150
  const jumpSpeed = 15; // Increased speed of upward movement during the jump
  const dinoImage = useRef(null); // Reference for the dino image

  useEffect(() => {
    // Set up the canvas context when the component mounts
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 1200; // Set canvas width
    canvas.height = 500; // Set canvas height

    let animationFrameId;
    let speed = 7; // Speed at which obstacles move
    let newObstacleTimer = 0; // Timer to generate new obstacles
    let jumpingUp = true; // Flag to check if the dino is going up during a jump
    let jumpY = 360; // Initial Y position of the dino for jumping

    // Load dino image
    dinoImage.current = new Image();
    dinoImage.current.src = dinoImg;

    // Draw the ground line at the bottom of the canvas
    const drawGround = () => {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 420, canvas.width, 5); // Draw the ground line
    };

    // Draw the dino on the canvas
    const drawDino = () => {
      if (dinoImage.current.complete) {
        ctx.drawImage(dinoImage.current, 100, dinoY.current, 80, 80); // Draw dino image at specified position
      } else {
        // Wait until the image is loaded before drawing it
        dinoImage.current.onload = () => {
          ctx.drawImage(dinoImage.current, 100, dinoY.current, 80, 80);
        };
      }
    };

    // Draw all obstacles on the canvas
    const drawObstacles = () => {
      ctx.fillStyle = "red"; // Set obstacle color
      obstacles.current.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width * 2, obs.height * 2); // Draw obstacles with specified width and height
      });
    };

    // Update the position of obstacles and add new ones
    const updateObstacles = () => {
      obstacles.current = obstacles.current
        .map((obs) => ({ ...obs, x: obs.x - speed })) // Move obstacles left by speed amount
        .filter((obs) => obs.x + obs.width > 0); // Remove obstacles that go off-screen

      newObstacleTimer++;
      if (newObstacleTimer > 150) { // Increase this value to make obstacles appear less frequently
        obstacles.current.push({ x: canvas.width, y: 360, width: 25, height: 40 });
        newObstacleTimer = 0; // Reset the timer
      }
    };

    // Check for collision between the dino and obstacles
    const detectCollision = () => {
      for (let obs of obstacles.current) {
        if (
          100 < obs.x + obs.width * 2 &&
          100 + 80 > obs.x &&
          dinoY.current < obs.y + obs.height * 2 &&
          dinoY.current + 80 > obs.y
        ) {
          isRunning.current = false; // Stop the game if collision occurs
        }
      }
    };

    // Main game loop to repeatedly update and redraw the canvas
    const gameLoop = () => {
      if (!isRunning.current) return; // If the game isn't running, stop the loop
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for the next frame
      drawGround(); // Draw the ground
      drawDino(); // Draw the dino
      drawObstacles(); // Draw obstacles
      updateObstacles(); // Update obstacles' position
      detectCollision(); // Check for collisions
      animationFrameId = requestAnimationFrame(gameLoop); // Call the gameLoop function for the next frame
    };

    // Function to make the dino jump
    const jump = () => {
      if (jumping.current) return; // If already jumping, don't jump again
      jumping.current = true; // Set jumping flag to true
      let jumpInterval = setInterval(() => {
        if (jumpingUp) {
          jumpY -= jumpSpeed; // Increase the amount of upward movement
          if (jumpY <= 360 - jumpHeight) jumpingUp = false; // Stop going up when max height is reached
        } else {
          jumpY += gravity; // Apply gravity to bring the dino down
          if (jumpY >= 360) {
            jumpY = 360; // Set dino back to ground level when landing
            clearInterval(jumpInterval); // Stop the jump interval
            jumpingUp = true; // Reset jumping state
            jumping.current = false; // Mark jump as complete
          }
        }
        dinoY.current = jumpY; // Update dino's Y position
      }, 20); // Update every 20ms
    };

    // Handle key events (Space to jump, Enter to start the game)
    const handleKeyDown = (e) => {
      if (e.code === "Space") jump(); // Jump on Space key press
      if (e.code === "Enter" && !isRunning.current) { // Start the game on Enter key press
        obstacles.current = []; // Reset obstacles
        isRunning.current = true; // Start the game
        gameLoop(); // Start the game loop
      }
    };

    // Add event listener for key presses
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); // Clean up event listener on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Dino Runner</h1>
      <canvas ref={canvasRef} className="border border-black" /> {/* The game canvas */}
      <p className="mt-4 text-sm">Press Enter to start, Space to jump</p> {/* Instructions */}
    </div>
  );
}
