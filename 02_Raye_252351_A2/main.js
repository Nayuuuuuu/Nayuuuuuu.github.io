// Background transition variables
let currentBackground = 0;
let autoPlayInterval;
const totalBackgrounds = 5;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    startAutoPlay();
    initGame();
});

// Show specific background by index
function showBackground(index) {
    // Remove active class from all backgrounds and dots
    document.querySelectorAll('.bg-layer').forEach(bg => bg.classList.remove('active'));
    document.querySelectorAll('.bg-dot').forEach(dot => dot.classList.remove('active'));

    // Add active class to selected background and dot
    document.querySelector(`[data-bg="${index}"]`).classList.add('active');
    document.querySelectorAll('.bg-dot')[index].classList.add('active');

    currentBackground = index;
}

// Move to next background
function nextBackground() {
    const nextIndex = (currentBackground + 1) % totalBackgrounds;
    showBackground(nextIndex);
}

// Start automatic background transitions
function startAutoPlay() {
    autoPlayInterval = setInterval(nextBackground, 5000); // Change every 5 seconds
}

// Keyboard controls (optional)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        nextBackground();
    }
});

//target all elements to save to constants
const page1btn = document.querySelector("#page1btn");
const page2btn = document.querySelector("#page2btn");
const page3btn = document.querySelector("#page3btn");
const page4btn = document.querySelector("#page4btn");
var allpages = document.querySelectorAll(".page");

//select all subtopic pages
function hideall() { //function to hide all pages
    for (let onepage of allpages) { //go through all subtopic pages
        onepage.style.display = "none"; //hide it
    }
}

function show(pgno) { //function to show selected page no
    hideall();
    //select the page based on the parameter passed in
    let onepage = document.querySelector("#page" + pgno);
    onepage.style.display = "block"; //show the page
}

/*Listen for clicks on the buttons, assign anonymous eventhandler functions to call show function*/
page1btn.addEventListener("click", function () {
    show(1);
});

page2btn.addEventListener("click", function () {
    show(2);
});

page3btn.addEventListener("click", function () {
    show(3);
});

page4btn.addEventListener("click", function () {
    show(4);
});

hideall();

// ===== VOLLEYBALL GAME CODE =====

let canvas, ctx;
let gameRunning = true;
let animationId;

// Game states
let gameState = 'ready'; // 'ready', 'tossed', 'hitting', 'flying'

// Game objects
let ball = {
    x: 180,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 12,
    color: '#ffffff',
    shadowColor: 'rgba(0,0,0,0.3)',
    isHeld: true
};

let player = {
    x: 120,
    y: 280,
    width: 40,
    height: 80,
    color: '#ff4444',
    headRadius: 15,
    // Animation states
    isJumping: false,
    jumpHeight: 0,
    maxJumpHeight: 50,
    jumpSpeed: 0,
    // Arm positions
    leftArmAngle: -0.3,
    rightArmAngle: 0.3,
    armLength: 35,
    // Animation timers
    tossAnimation: 0,
    hitAnimation: 0,
    animationSpeed: 0.15
};

let net = {
    x: 380,
    y: 200,
    width: 6,
    height: 120,
    color: '#8B4513',
    meshColor: '#ffffff'
};

let court = {
    leftBound: 20,
    rightBound: 760,
    ground: 350,
    centerLine: 400
};

let score = {
    successful: 0,
    attempts: 0
};

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Add button event listeners
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('tossBtn').addEventListener('click', tossBall);
    document.getElementById('hitBtn').addEventListener('click', hitBall);

    // Start the game loop
    gameRunning = true;
    gameLoop();
    resetBallToHand();
}

function resetGame() {
    // Reset scores
    score.successful = 0;
    score.attempts = 0;
    updateScore();

    // Reset game state
    resetBallToHand();

    // Reset player animation
    player.isJumping = false;
    player.jumpHeight = 0;
    player.jumpSpeed = 0;
    player.tossAnimation = 0;
    player.hitAnimation = 0;
    player.leftArmAngle = -0.3;
    player.rightArmAngle = 0.3;
}

function resetBallToHand() {
    // Position ball in player's left hand
    const handX = player.x + 20 + Math.cos(player.leftArmAngle) * player.armLength;
    const handY = player.y + 20 - player.jumpHeight + Math.sin(player.leftArmAngle) * player.armLength;

    ball.x = handX;
    ball.y = handY;
    ball.vx = 0;
    ball.vy = 0;
    ball.isHeld = true;
    gameState = 'ready';
}

function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    updatePlayer();
    updateBall();
    checkCollisions();
}

function updatePlayer() {
    // Update jumping motion
    if (player.isJumping) {
        player.jumpHeight += player.jumpSpeed;
        player.jumpSpeed -= 2; // Gravity

        if (player.jumpHeight <= 0) {
            player.jumpHeight = 0;
            player.jumpSpeed = 0;
            player.isJumping = false;
        }
    }

    // Update toss animation
    if (player.tossAnimation > 0) {
        player.tossAnimation -= player.animationSpeed;
        player.leftArmAngle = -0.3 - Math.sin(player.tossAnimation * Math.PI) * 1.2;

        if (player.tossAnimation <= 0) {
            player.leftArmAngle = -0.3;
        }
    }

    // Update hit animation
    if (player.hitAnimation > 0) {
        player.hitAnimation -= player.animationSpeed;
        player.rightArmAngle = 0.3 + Math.sin(player.hitAnimation * Math.PI) * 1.8;

        if (player.hitAnimation <= 0) {
            player.rightArmAngle = 0.3;
        }
    }
}

function updateBall() {
    if (!ball.isHeld) {
        // Apply physics
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += 0.25; // Slower gravity

        // Air resistance
        ball.vx *= 0.998; // Slightly more air resistance
        ball.vy *= 0.998;
    } else if (gameState === 'ready') {
        // Keep ball in player's hand
        const handX = player.x + 20 + Math.cos(player.leftArmAngle) * player.armLength;
        const handY = player.y + 20 - player.jumpHeight + Math.sin(player.leftArmAngle) * player.armLength;
        ball.x = handX;
        ball.y = handY;
    }
}

function checkCollisions() {
    // Ball hits ground
    if (ball.y + ball.radius >= court.ground) {
        if (gameState === 'flying') {
            // Check if successful serve (ball crossed net and landed on right side)
            if (ball.x > net.x + net.width) {
                score.successful++;
            }
            score.attempts++;
            updateScore();
        }

        // Reset immediately when ball hits ground
        resetBallToHand();
        return; // Exit early to avoid other collision checks
    }

    // Ball hits net
    if (ball.x + ball.radius >= net.x &&
        ball.x - ball.radius <= net.x + net.width &&
        ball.y + ball.radius >= net.y && ball.y - ball.radius <= net.y + net.height) {

        if (gameState === 'flying') {
            score.attempts++;
            updateScore();
        }

        // Bounce off net
        ball.vx = -Math.abs(ball.vx) * 0.6;
        ball.x = net.x - ball.radius;
    }

    // Ball hits side walls
    if (ball.x - ball.radius <= court.leftBound) {
        ball.x = court.leftBound + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.7;
    }
    if (ball.x + ball.radius >= court.rightBound) {
        ball.x = court.rightBound - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.7;
    }
}

function tossBall() {
    if (gameState === 'ready') {
        ball.isHeld = false;
        ball.vy = -8;  // Slower toss upward
        ball.vx = 0;   // No horizontal motion - straight up

        // Position ball directly above player center
        const playerCenterX = player.x + player.width / 2;
        ball.x = playerCenterX;

        gameState = 'tossed';

        // Start toss animation
        player.tossAnimation = 1.0;
    }
}
const hitSound = new Audio('audio/ballspike.mp3');

function hitBall() {
    if (gameState === 'tossed') {
        // Calculate distance to ball
        const playerCenterX = player.x + 20;
        const playerCenterY = player.y + 20 - player.jumpHeight;
        const distToBall = Math.sqrt(
            Math.pow(ball.x - playerCenterX, 2) +
            Math.pow(ball.y - playerCenterY, 2)
        );

        // Check if ball is within hitting range
        if (distToBall < 80) {
            // Hit the ball with more power to clear the net
            ball.vx = 7 + Math.random() * 3;   // More forward velocity to clear net
            ball.vy = -5 - Math.random() * 2;  // More upward velocity for arc over net
            gameState = 'flying';

            // Start jump and hit animations
            player.isJumping = true;
            player.jumpSpeed = 15;
            player.hitAnimation = 1.0;

            hitSound.play();
        }
    }
}

function draw() {
    // Clear canvas with sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCourt();
    drawNet();
    drawPlayer();
    drawBall();
    drawUI();
}

function drawCourt() {
    // Draw court ground
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(0, court.ground, canvas.width, canvas.height - court.ground);

    // Draw court lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // Outer boundaries
    ctx.strokeRect(court.leftBound, court.ground - 5,
        court.rightBound - court.leftBound, 5);

    // Center line
    ctx.beginPath();
    ctx.moveTo(court.centerLine, court.ground);
    ctx.lineTo(court.centerLine, court.ground + 20);
    ctx.stroke();
}

function drawNet() {
    // Draw net posts
    ctx.fillStyle = net.color;
    ctx.fillRect(net.x - 3, net.y, net.width + 6, net.height + 10);

    // Draw net mesh
    ctx.strokeStyle = net.meshColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < net.width; x += 3) {
        ctx.beginPath();
        ctx.moveTo(net.x + x, net.y);
        ctx.lineTo(net.x + x, net.y + net.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < net.height; y += 8) {
        ctx.beginPath();
        ctx.moveTo(net.x, net.y + y);
        ctx.lineTo(net.x + net.width, net.y + y);
        ctx.stroke();
    }
}

function drawPlayer() {
    const centerX = player.x + player.width / 2;
    const baseY = player.y - player.jumpHeight;

    ctx.strokeStyle = player.color;
    ctx.fillStyle = player.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Draw head
    ctx.beginPath();
    ctx.arc(centerX, baseY, player.headRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdbac'; // Skin color
    ctx.fill();
    ctx.strokeStyle = player.color;
    ctx.stroke();

    // Draw body
    ctx.strokeStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(centerX, baseY + player.headRadius);
    ctx.lineTo(centerX, baseY + 50);
    ctx.stroke();

    // Draw arms
    const shoulderY = baseY + 18;

    // Left arm (tossing arm)
    const leftHandX = centerX - 10 + Math.cos(player.leftArmAngle) * player.armLength;
    const leftHandY = shoulderY + Math.sin(player.leftArmAngle) * player.armLength;

    ctx.beginPath();
    ctx.moveTo(centerX - 10, shoulderY);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();

    // Right arm (hitting arm)
    const rightHandX = centerX + 10 + Math.cos(player.rightArmAngle) * player.armLength;
    const rightHandY = shoulderY + Math.sin(player.rightArmAngle) * player.armLength;

    ctx.beginPath();
    ctx.moveTo(centerX + 10, shoulderY);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();

    // Draw hands
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(leftHandX, leftHandY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightHandX, rightHandY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs
    const hipY = baseY + 50;
    const legSpread = player.isJumping ? 20 : 15;
    const kneeOffset = player.isJumping ? 15 : 20;

    ctx.strokeStyle = player.color;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX - legSpread / 2, hipY + kneeOffset);
    ctx.lineTo(centerX - legSpread, hipY + 40);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(centerX, hipY);
    ctx.lineTo(centerX + legSpread / 2, hipY + kneeOffset);
    ctx.lineTo(centerX + legSpread, hipY + 40);
    ctx.stroke();

    // Draw feet
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - legSpread - 8, hipY + 40, 16, 6);
    ctx.fillRect(centerX + legSpread - 8, hipY + 40, 16, 6);
}

function drawBall() {
    // Draw ball shadow
    if (!ball.isHeld) {
        ctx.fillStyle = ball.shadowColor;
        ctx.beginPath();
        const shadowY = court.ground - 5;
        const shadowSize = ball.radius * 0.6;
        ctx.ellipse(ball.x, shadowY, shadowSize, shadowSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw main ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball pattern
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw volleyball lines
    ctx.beginPath();
    ctx.moveTo(ball.x - ball.radius, ball.y);
    ctx.lineTo(ball.x + ball.radius, ball.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.7, Math.PI / 2, 3 * Math.PI / 2);
    ctx.stroke();
}

function drawUI() {
    // Draw instructions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';

    let instruction = '';
    switch (gameState) {
        case 'ready':
            instruction = 'Click "Toss Ball" to start your serve!';
            break;
        case 'tossed':
            instruction = 'Ball is in the air! Click "Hit Ball" now!';
            break;
        case 'flying':
            instruction = 'Great serve! Watch the ball fly!';
            break;
    }

    ctx.fillText(instruction, canvas.width / 2, 30);

    // Draw game state indicator
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`State: ${gameState}`, 10, canvas.height - 10);
}

function updateScore() {
    document.getElementById('score1').textContent = score.successful;
    document.getElementById('score2').textContent = score.attempts;
}


