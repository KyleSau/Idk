document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high'; // Options are 'low', 'medium', 'high'

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let backgroundImage = new Image();
    backgroundImage.src = 'cache/graphics/tiles/0.png';

    const availableMaps = [0, 1, 10, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 4, 5, 6, 7, 9];

    let mapImages = [];
    availableMaps.forEach(mapId => {
        let img = new Image();
        img.onload = function () {
            mapImages[mapId] = img;
            // Optionally call a function to redraw or update UI after loading if needed
        };
        img.src = `cache/graphics/tiles/${mapId}.png`;
    });

    const inventoryIconImage = new Image();
    inventoryIconImage.src = 'cache/graphics/icons/inventory.png';

    const skillsIconImage = new Image();
    skillsIconImage.src = 'cache/graphics/icons/skills.png';

    const settingsIconImage = new Image();
    settingsIconImage.src = 'cache/graphics/icons/settings.png';

    let currentMessage = '';

    let chatMessages = []; // Array to store chat messages
    const maxChatMessages = 5; // Display only the 5 most recent messages

    function changeMap(newMapId) {
        if (mapImages.hasOwnProperty(newMapId)) {
            console.log('attempting to change map ' + newMapId);
            backgroundImage = mapImages[newMapId]; // Change the background image
            player.mapId = newMapId; // Update the player's mapId
            draw(); // Redraw the scene with the new map
        } else {
            // Push the error message to the chat box
            chatMessages.push("[ERROR] Map ID " + newMapId + " is not available.");
            if (chatMessages.length > maxChatMessages) {
                chatMessages.shift();
            }
            draw(); // Redraw to show updated chat messages
        }
    }



    function drawChatbox() {
        const chatboxX = 10; // Bottom left position
        const chatboxY = canvas.height - 160;
        const chatboxWidth = 380;
        const chatboxHeight = 150;

        // Draw chatbox background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
        ctx.fillRect(chatboxX, chatboxY, chatboxWidth, chatboxHeight);

        // Calculate the starting index to show the 5 most recent messages
        const startMessageIndex = Math.max(chatMessages.length - maxChatMessages, 0);

        // Draw the most recent messages
        ctx.font = '16px Arial';
        for (let i = startMessageIndex; i < chatMessages.length; i++) {
            const messageIndex = i - startMessageIndex;
            ctx.fillStyle = 'white'; // Text color
            ctx.fillText(chatMessages[i], chatboxX + 10, chatboxY + 20 + messageIndex * 18);
        }

        // Draw the current message at the bottom of the chatbox
        ctx.fillStyle = 'lightblue'; // Color for the current message
        ctx.fillText(currentMessage, chatboxX + 10, chatboxY + chatboxHeight - 10);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            if (currentMessage.trim() !== '') {
                // Check for the map change command
                if (currentMessage.startsWith('map ')) {
                    const parts = currentMessage.split(' ');
                    if (parts.length === 2) {
                        const mapId = parseInt(parts[1], 10);
                        if (!isNaN(mapId)) {
                            changeMap(mapId);
                        } else {
                            chatMessages.push("[ERROR] Invalid map ID entered.");
                            if (chatMessages.length > maxChatMessages) {
                                chatMessages.shift();
                            }
                            draw();
                        }
                    }
                } else {
                    chatMessages.push(currentMessage);
                    if (chatMessages.length > maxChatMessages) {
                        chatMessages.shift();
                    }
                }
                currentMessage = '';
                draw();
            }
        } else if (event.key === 'Backspace') {
            currentMessage = currentMessage.slice(0, -1);
        } else if (event.key.length === 1 && event.key.match(/[\w\s]/)) {
            currentMessage += event.key;
        }
    });




    // Define inventory and equipped items
    const inventoryItems = [
        { name: "bronze_boots.png", equipped: false },
        { name: "bronze_helmet.png", equipped: false },
        { name: "bronze_sword.png", equipped: false },
        { name: "bronze_platebody.png", equipped: false },
        { name: "bronze_platelegs.png", equipped: false },
        { name: "bronze_shield.png", equipped: false }
    ];

    const itemSprites = {}; // Holds Image objects for inventory items
    inventoryItems.forEach(item => {
        itemSprites[item.name] = new Image();
        itemSprites[item.name].src = `cache/graphics/items/${item.name}`;
    });

    let playerSprites = {
        head: new Image(),
        body: new Image(),
        legs: [new Image(), new Image()],
        boots: [new Image(), new Image()],
        load() {
            this.head.src = 'cache/graphics/sprites/head1.png'; // default head sprite
            this.body.src = 'cache/graphics/sprites/body1.png'; // default body sprite
            this.legs[0].src = 'cache/graphics/sprites/legs1.png'; // default legs frame 1
            this.legs[1].src = 'cache/graphics/sprites/legs2.png'; // default legs frame 2
            this.boots[0].src = 'cache/graphics/sprites/boots1.png'; // default boots frame 1
            this.boots[1].src = 'cache/graphics/sprites/boots2.png'; // default boots frame 2
        }
    };
    playerSprites.load(); // Make sure this is called to load the images


    // Load equipped item sprites
    const equippedSprites = {
        head: new Image(),
        body: new Image(),
        legs: [new Image(), new Image()],
        boots: [new Image(), new Image()],
        weapon: new Image(),
        shield: new Image()
    };

    function loadEquippedSprites() {
        equippedSprites.head.src = 'cache/graphics/sprites/47.png'; // Bronze helmet
        equippedSprites.body.src = 'cache/graphics/sprites/52.png'; // Bronze platebody
        equippedSprites.legs[0].src = 'cache/graphics/sprites/57_1.png'; // Frame 1 bronze legs
        equippedSprites.legs[1].src = 'cache/graphics/sprites/57_2.png'; // Frame 2 bronze legs
        equippedSprites.boots[0].src = 'cache/graphics/sprites/118_1.png'; // Frame 1 bronze boots
        equippedSprites.boots[1].src = 'cache/graphics/sprites/118_2.png'; // Frame 2 bronze boots
        equippedSprites.weapon.src = 'cache/graphics/sprites/36.png'; // Bronze sword
        equippedSprites.shield.src = 'cache/graphics/sprites/32.png'; // Bronze shield
    }
    loadEquippedSprites();

    let player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 100,
        speed: 1,
        path: [],
        frameIndex: 0,
        frameTime: 0,
        frameDuration: 100, // Reduced frame duration for smoother animation
        facingLeft: false,
        inventoryOpen: false,
        mapId: 0, // Default map id
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
                player.frameTime += 10;
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

    function drawInventory() {

        if (inventory.isOpen) {
            // Draw the inventory background
            ctx.fillStyle = 'lightgray';
            ctx.fillRect(inventoryX, inventoryY, cellSize * columns, cellSize * rows);

            // Fill cells with equipped color or transparent if not
            inventoryItems.forEach((item, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                const cell = inventoryCells[row * columns + col];

                ctx.fillStyle = item.equipped ? 'red' : 'rgba(255, 255, 255, 0)';
                ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
            });

            // Draw all cell borders
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    const cellX = inventoryX + j * cellSize;
                    const cellY = inventoryY + i * cellSize;
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(cellX, cellY, cellSize, cellSize);
                }
            }

            // Draw inventory items within the cells
            inventoryItems.forEach((item, index) => {
                const sprite = itemSprites[item.name];
                if (sprite) {
                    const row = Math.floor(index / columns);
                    const col = index % columns;
                    const cell = inventoryCells[row * columns + col];

                    // Scale and center the item image in the cell
                    const scale = Math.min(cellSize / sprite.width, cellSize / sprite.height);
                    const itemWidth = scale * sprite.width;
                    const itemHeight = scale * sprite.height;
                    const itemX = cell.x + (cell.width - itemWidth) / 2;
                    const itemY = cell.y + (cell.height - itemHeight) / 2;

                    ctx.drawImage(sprite, itemX, itemY, itemWidth, itemHeight);
                }
            });
        }
    }

    function drawMap() {
        if (mapImages[player.mapId] && mapImages[player.mapId].complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(mapImages[player.mapId], 0, 0, canvas.width, canvas.height);
        } else {
            console.log("Map image not available or not loaded for map ID:", player.mapId);
        }
    }


    function draw() {
        drawMap();
        drawPlayer();
        drawInventoryButton();
        drawSkillsButton();
        drawSettingsButton();
        drawInventory();
        drawChatbox();
    }



    function drawPlayer() {
        const headSprite = inventoryItems.find(item => item.name.includes("helmet") && item.equipped) ? equippedSprites.head : playerSprites.head;
        const bodySprite = inventoryItems.find(item => item.name.includes("platebody") && item.equipped) ? equippedSprites.body : playerSprites.body;
        const legsSprite = inventoryItems.find(item => item.name.includes("platelegs") && item.equipped) ? equippedSprites.legs[player.frameIndex] : playerSprites.legs[player.frameIndex];
        const bootsSprite = inventoryItems.find(item => item.name.includes("boots") && item.equipped) ? equippedSprites.boots[player.frameIndex] : playerSprites.boots[player.frameIndex];
        const weaponSprite = inventoryItems.find(item => item.name.includes("sword") && item.equipped) ? equippedSprites.weapon : null;
        const shieldSprite = inventoryItems.find(item => item.name.includes("shield") && item.equipped) ? equippedSprites.shield : null;

        drawSprite(headSprite, player.x, player.y - 85);
        drawSprite(bodySprite, player.x, player.y - 55);
        drawSprite(legsSprite, player.x, player.y - 35);
        drawSprite(bootsSprite, player.x, player.y - 25);
        if (weaponSprite) {
            drawSprite(weaponSprite, player.x + 3, player.y - 57); // Adjust the position as needed
        }
        if (shieldSprite) {
            drawSprite(shieldSprite, player.x + 10, player.y - 50); // Adjust the position as needed
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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(inventory.x, inventory.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(inventory.x, inventory.y, 50, 50);
        ctx.drawImage(inventoryIconImage, inventory.x + 10, inventory.y + 10, 30, 30);
    }

    function drawSkillsButton() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(inventory.x + 55, inventory.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(inventory.x + 55, inventory.y, 50, 50);
        ctx.drawImage(skillsIconImage, inventory.x + 55 + 10, inventory.y + 10, 30, 30);
    }

    function drawSettingsButton() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(inventory.x + 110, inventory.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(inventory.x + 110, inventory.y, 50, 50);
        ctx.drawImage(settingsIconImage, inventory.x + 110 + 10, inventory.y + 10, 30, 30);
    }

    canvas.addEventListener('click', function (event) {
        const mousePos = getMousePos(canvas, event);
        if (inventory.isOpen && isInsideInventory(mousePos)) {
            inventoryCells.forEach((cell, index) => {
                if (mousePos.x >= cell.x && mousePos.x < cell.x + cellSize && mousePos.y >= cell.y && mousePos.y < cell.y + cellSize) {
                    const item = inventoryItems[index];
                    if (item) {
                        item.equipped = !item.equipped; // Toggle equipped state
                    }
                }
            });
            return;
        }
        if (isInsideInventoryButton(mousePos)) {
            inventory.isOpen = !inventory.isOpen;
            return;
        }
        player.path = [mousePos]; // Start player movement
        drawClick(mousePos.x, mousePos.y);
    });

    function isInsideInventory(pos) {
        return pos.x >= inventoryX && pos.x <= inventoryX + cellSize * columns &&
            pos.y >= inventoryY && pos.y <= inventoryY + cellSize * rows;
    }

    function isInsideInventoryButton(pos) {
        return pos.x >= inventory.x && pos.x <= inventory.x + 50 &&
            pos.y >= inventory.y && pos.y <= inventory.y + 50;
    }

    function drawClick(x, y) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
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
