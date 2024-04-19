document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const backgroundImage = new Image();
    backgroundImage.src = 'cache/graphics/tiles/0.png';

    const inventoryIconImage = new Image();
    inventoryIconImage.src = 'cache/graphics/icons/inventory.png';

    let playerSprites = {
        head: new Image(),
        body: new Image(),
        legs: [new Image(), new Image()],
        boots: [new Image(), new Image()],
        load() {
            this.head.src = 'cache/graphics/sprites/head1.png';
            this.body.src = 'cache/graphics/sprites/body1.png';
            this.legs[0].src = 'cache/graphics/sprites/legs1.png';
            this.legs[1].src = 'cache/graphics/sprites/legs2.png';
            this.boots[0].src = 'cache/graphics/sprites/boots1.png';
            this.boots[1].src = 'cache/graphics/sprites/boots2.png';
        }
    };
    playerSprites.load();

    let player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 100,
        speed: 5,
        path: [],
        frameIndex: 0,
        frameTime: 0,
        frameDuration: 100, // Reduced frame duration for smoother animation
        facingLeft: false,
        inventoryOpen: false,
        updatePosition() {
            const scaleX = canvas.width / this.canvasWidth;
            const scaleY = canvas.height / this.canvasHeight;
            this.x *= scaleX;
            this.y *= scaleY;
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;
        }
    };

    // Initialize player position
    player.canvasWidth = canvas.width;
    player.canvasHeight = canvas.height;

    // Inventory UI
    const inventory = {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        isOpen: false,
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    };

    const inventoryCells = [];
    const cellSize = 40;
    const rows = 5;
    const columns = 5;
    const inventoryX = inventory.x + 0; // Adjusted inventory grid position
    const inventoryY = inventory.y + 55; // Position below the inventory icon

    // Initialize inventory cells
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            inventoryCells.push({
                x: inventoryX + j * cellSize,
                y: inventoryY + i * cellSize,
                width: cellSize,
                height: cellSize
            });
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        player.updatePosition();
        draw(); // Redraw the game whenever the canvas is resized
    }

    window.addEventListener('resize', resizeCanvas);

    function update() {
        if (!player.inventoryOpen && player.path.length > 0) {
            const nextPos = player.path[0];
            const dx = nextPos.x - player.x;
            const dy = nextPos.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > player.speed) {
                player.x += (dx / distance) * player.speed;
                player.y += (dy / distance) * player.speed;
                player.facingLeft = dx < 0;
                player.frameTime += 20;
                if (player.frameTime >= player.frameDuration) {
                    player.frameIndex = (player.frameIndex + 1) % 2;
                    player.frameTime = 0;
                }
            } else {
                player.x = nextPos.x;
                player.y = nextPos.y;
                player.path.shift();
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        // Draw the player components centered around the body's midsection
        drawSprite(playerSprites.head, player.x, player.y - 85);
        drawSprite(playerSprites.body, player.x, player.y - 55);
        drawSprite(playerSprites.legs[player.frameIndex], player.x, player.y - 35);
        drawSprite(playerSprites.boots[player.frameIndex], player.x, player.y - 25);
        drawInventoryButton();

        if (inventory.isOpen) {
            // Set background color for the inventory grid
            ctx.fillStyle = 'lightgray'; // Change to light gray
            ctx.fillRect(inventoryX, inventoryY, cellSize * columns, cellSize * rows);

            inventoryCells.forEach(cell => {
                // Set divider color
                ctx.strokeStyle = 'black'; // Change to black
                ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
            });
        }
    }

    function drawSprite(image, x, y) {
        ctx.save();
        ctx.translate(x, y);
        if (player.facingLeft) {
            ctx.scale(-1, 1); // Flip the sprite horizontally if facing left
        }
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
    }

    function drawInventoryButton() {
        // Draw inventory icon button
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(inventory.x, inventory.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(inventory.x, inventory.y, 50, 50);
        // Draw inventory icon image (assuming it's a square icon)
        ctx.drawImage(inventoryIconImage, inventory.x + 10, inventory.y + 10, 30, 30);
    }
    canvas.addEventListener('click', function (event) {
        const mousePos = getMousePos(canvas, event);
        if (inventory.isOpen) {
            // Handle click inside inventory UI
            if (isInsideInventory(mousePos)) {
                // Handle inventory item clicks
                // Add logic for handling inventory item clicks here
            } else {
                // Prevent clicking through inventory interface
                event.stopPropagation();
                // Start player movement
                player.path = [mousePos];
                // Indication of the click for movement
                drawClick(mousePos.x, mousePos.y);
            }
        }
        // Handle click outside inventory UI
        if (isInsideInventoryButton(mousePos)) {
            // Toggle inventory UI
            console.log('inventory button clicked');
            inventory.isOpen = !inventory.isOpen;
        } else {
            // Start player movement
            player.path = [mousePos];
            // Indication of the click for movement
            drawClick(mousePos.x, mousePos.y);
        }

    });




    function isInsideInventory(pos) {
        // Define inventory area dynamically based on UI position and size
        return pos.x >= inventoryX && pos.x <= inventoryX + cellSize * columns &&
            pos.y >= inventoryY && pos.y <= inventoryY + cellSize * rows;
    }

    function isInsideInventoryButton(pos) {
        // Define inventory button area dynamically based on UI position and size
        return pos.x >= inventory.x && pos.x <= inventory.x + 50 &&
            pos.y >= inventory.y && pos.y <= inventory.y + 50;
    }

    function drawClick(x, y) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow with opacity
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function getMousePos(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
