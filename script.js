document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreDisplay = document.getElementById("score");
  const timeLeftDisplay = document.getElementById("timeLeft");
  const startButton = document.getElementById("startButton");

  canvas.width = 800;
  canvas.height = 600;

  // --- Game Configuration ---
  const USE_DUCK_IMAGE = true;
  const NEW_DUCK_IMAGE_URL =
    "https://www.shutterstock.com/image-vector/duck-icon-pixel-art-style-600nw-2127060659.jpg";

  const DUCK_BASE_SPEED_Y = 1;
  const DUCK_SPEED_Y_RANDOM_FACTOR = 0.5;
  const DUCK_SPEED_X_FACTOR = 1.5;

  const DUCK_SPAWN_INTERVAL_MS = 2500;
  const INITIAL_DUCK_COUNT = 2;
  // --- End Game Configuration ---

  let score = 0;
  let timeLeft = 60;
  let gameInterval;
  let ducks = [];
  let gameActive = false;
  let spawnInterval;

  const duckImage = new Image();
  let duckImageLoaded = false;
  const duckWidth = 50;
  const duckHeight = 50;

  // Add duck sound effect
  const duckSound = new Audio(
    "https://www.soundjay.com/animal/duck-quack-01.mp3"
  );
  duckSound.volume = 0.5;

  duckImage.onload = () => {
    duckImageLoaded = true;
    console.log("Duck image loaded successfully:", NEW_DUCK_IMAGE_URL);
  };
  duckImage.onerror = () => {
    duckImageLoaded = false;
    console.error(
      "Failed to load duck image from:",
      NEW_DUCK_IMAGE_URL,
      ". Fallback rectangle will be used."
    );
  };

  if (USE_DUCK_IMAGE) {
    duckImage.src = NEW_DUCK_IMAGE_URL;
  }

  class Duck {
    constructor() {
      this.x = Math.random() * (canvas.width - duckWidth);
      this.y = canvas.height;
      this.speedY = -(
        DUCK_BASE_SPEED_Y +
        Math.random() * DUCK_SPEED_Y_RANDOM_FACTOR
      );
      this.speedX = (Math.random() - 0.5) * DUCK_SPEED_X_FACTOR * 2;
      this.width = duckWidth;
      this.height = duckHeight;
      this.isHit = false;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x <= 0 || this.x + this.width >= canvas.width) {
        this.speedX *= -1;
      }
    }

    draw() {
      if (!this.isHit) {
        if (USE_DUCK_IMAGE && duckImageLoaded) {
          ctx.drawImage(duckImage, this.x, this.y, this.width, this.height);
        } else {
          ctx.fillStyle = "yellow";
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      }
    }
  }

  function spawnDuck() {
    if (gameActive) {
      ducks.push(new Duck());
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = ducks.length - 1; i >= 0; i--) {
      const duck = ducks[i];
      duck.update();
      duck.draw();

      if (duck.y + duck.height < 0) {
        ducks.splice(i, 1);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    score = 0;
    timeLeft = 60;
    ducks = [];
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    startButton.disabled = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < INITIAL_DUCK_COUNT; i++) {
      spawnDuck();
    }

    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnDuck, DUCK_SPAWN_INTERVAL_MS);

    gameInterval = setInterval(() => {
      timeLeft--;
      timeLeftDisplay.textContent = timeLeft;
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    if (USE_DUCK_IMAGE && !duckImageLoaded && duckImage.src) {
      console.warn(
        "Duck image is being loaded. Fallback will be used until it loads or if it fails."
      );
    }

    gameLoop();
  }

  function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    startButton.disabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(
      `Game Over! Your score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 - 20
    );
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(
      'Click "Start Game" to play again!',
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  }

  canvas.addEventListener("click", (event) => {
    if (!gameActive) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (let i = ducks.length - 1; i >= 0; i--) {
      const duck = ducks[i];
      if (
        !duck.isHit &&
        clickX >= duck.x &&
        clickX <= duck.x + duck.width &&
        clickY >= duck.y &&
        clickY <= duck.y + duck.height
      ) {
        duck.isHit = true;
        score++;
        scoreDisplay.textContent = score;

        // Play quack sound
        duckSound.currentTime = 0;
        duckSound.play();

        setTimeout(() => {
          const duckIndex = ducks.indexOf(duck);
          if (duckIndex > -1) {
            ducks.splice(duckIndex, 1);
          }
        }, 200);

        break;
      }
    }
  });

  startButton.addEventListener("click", startGame);

  function drawInitialMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(
      'Click "Start Game" to play!',
      canvas.width / 2,
      canvas.height / 2
    );
  }
  drawInitialMessage();
});
