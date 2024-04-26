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

    let lastClickPos = null;
    let lastClickTime = Date.now();
    const clickDisplayDuration = 1000;

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


    function getHoveredItem(mousePos) {
        for (let cellIndex = 0; cellIndex < inventoryCells.length; cellIndex++) {
            const cell = inventoryCells[cellIndex];
            if (mousePos.x >= cell.x && mousePos.x <= cell.x + cell.width &&
                mousePos.y >= cell.y && mousePos.y <= cell.y + cell.height) {
                return inventoryItems[cellIndex]; // Return the hovered item
            }
        }
        return null; // No item is hovered
    }

    /*function drawItemTooltip(item, mousePos) {
        const tooltipWidth = 200;
        const tooltipHeight = 100;
        const offsetX = 15; // Offset from mouse position
        const offsetY = 15;
        const x = mousePos.x + offsetX;
        const y = mousePos.y + offsetY;
        const borderRadius = 10;

        // Tooltip background with rounded corners
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.arcTo(x + tooltipWidth, y, x + tooltipWidth, y + borderRadius, borderRadius);
        ctx.arcTo(x + tooltipWidth, y + tooltipHeight, x + tooltipWidth - borderRadius, y + tooltipHeight, borderRadius);
        ctx.arcTo(x, y + tooltipHeight, x, y + tooltipHeight - borderRadius, borderRadius);
        ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
        ctx.closePath();
        ctx.fill();

        // Center the title text
        ctx.font = 'bold 18px Arial';
        const titleWidth = ctx.measureText(item.name).width;
        const titleX = x + (tooltipWidth - titleWidth) / 2;
        ctx.fillStyle = 'goldenrod'; // Color for rarity, this should match the item rarity
        ctx.fillText(item.name, titleX, y + 25);

        // Subtitle text with italics
        ctx.font = 'italic 14px Arial';
        ctx.fillStyle = 'white'; // Default color for text
        ctx.fillText(`Physical Damage`, x + 10, y + 45);

        // Regular text for other stats
        ctx.font = '14px Arial';
        ctx.fillText(`+${item.physicalDamage}`, x + 10, y + 65);

        // Example of additional stats with colors
        ctx.fillStyle = 'lightblue'; // Color for special stats
        ctx.fillText(`+${item.criticalChance}% Crit Chance`, x + 10, y + 85);
        ctx.fillText(`+${item.speed} Speed`, x + 10, y + 105);
    }*/

    const RarityColors = {
        Common: { borderColor: '#918975', background: '#524B3F', font: '#FFFAF7' },
        Rare: { background: '#4b0082', font: 'goldenrod' },
        // Add other rarities as needed
    };

    // function drawItemTooltip(item, mousePos) {
    //     const tooltipWidth = 250;
    //     const tooltipHeight = 150;
    //     const rarityColor = RarityColors[item.rarity] || RarityColors.Common; // Default to COMMON if not found
    //     const offsetX = 15;
    //     const offsetY = 15;
    //     const x = mousePos.x + offsetX;
    //     const y = mousePos.y + offsetY;
    //     const borderWidth = 2; // Width of the border
    //     const borderColor = rarityColor.borderColor; // Color of the border

    //     // Background
    //     ctx.fillStyle = rarityColor.background;
    //     ctx.fillRect(x, y, tooltipWidth, tooltipHeight);

    //     // Border
    //     ctx.strokeStyle = borderColor;
    //     ctx.lineWidth = borderWidth;
    //     ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);

    //     // Name of the item
    //     ctx.font = 'bold 22px Arial';
    //     ctx.fillStyle = rarityColor.font;
    //     const nameWidth = ctx.measureText(item.name).width;
    //     const nameX = x + (tooltipWidth - nameWidth) / 2; // Center the text
    //     ctx.fillText('Bronze Sword', nameX, y + 30);

    //     // Rarity
    //     ctx.font = 'bold 14px Arial';
    //     ctx.fillStyle = '#E0D5C9'; // White color for rarity text
    //     ctx.fillText('COMMON', x + 10, y + 50);

    //     // Stats background
    //     const statsHeight = 30;
    //     const statsY = y + tooltipHeight - statsHeight;
    //     ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //     ctx.fillRect(x, statsY, tooltipWidth, statsHeight);

    //     // Stats text
    //     ctx.font = '14px Arial';
    //     ctx.fillStyle = '#ffffff';
    //     ctx.fillText(`+${item.physicalDamage} Physical Damage`, x + 10, statsY + 20);
    //     ctx.fillText(`+${item.criticalChance}% Crit Chance`, x + 10, statsY + 20);
    //     ctx.fillText(`+${item.speed} Speed`, x + 10, statsY + 20);
    // }

    /*function drawItemTooltip(item, mousePos) {
        const tooltipWidth = 250;
        const tooltipHeight = 150;
        const rarityColor = RarityColors[item.rarity] || RarityColors.Common; // Default to COMMON if not found
        const offsetX = 15;
        const offsetY = 15;
        const x = mousePos.x + offsetX;
        const y = mousePos.y + offsetY;
        const borderWidth = 2; // Width of the border
        const borderColor = rarityColor.borderColor; // Color of the border

        // Background
        ctx.fillStyle = rarityColor.background;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);

        // Gradient shading code goes here
        const sectionHeight = 60; // Adjusted for more space in the rarity section
        const gradientY = y + sectionHeight;
        const gradient = ctx.createLinearGradient(x, y, x, gradientY);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.1, borderColor);
        gradient.addColorStop(0.9, borderColor);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + tooltipWidth, y);
        ctx.lineTo(x + tooltipWidth, gradientY);
        ctx.lineTo(x, gradientY);
        ctx.closePath();
        ctx.stroke();

        // Name of the item
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = rarityColor.font;
        const nameWidth = ctx.measureText(item.name).width;
        const nameX = x + (tooltipWidth - nameWidth) / 2; // Center the text
        ctx.fillText(item.name, nameX, y + 30); // Use the actual item name

        // Rarity
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = rarityColor.font; // Use the font color for rarity
        const rarityText = item.rarity;
        const rarityWidth = ctx.measureText(rarityText).width;
        const rarityX = x + (tooltipWidth - rarityWidth) / 2; // Center the text
        ctx.fillText(rarityText, rarityX, y + 50);

        // Stats background
        const statsHeight = 30; // Height for stats section, adjust as needed
        const statsY = gradientY + 5; // Position below the gradient shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, statsY, tooltipWidth, statsHeight);

        // Stats text
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`+${item.physicalDamage} Physical Damage`, x + 10, statsY + 20);
        ctx.fillText(`+${item.criticalChance}% Crit Chance`, x + 10, statsY + 20);
        ctx.fillText(`+${item.speed} Speed`, x + 10, statsY + 20);
    }*/
    /*function drawItemTooltip(item, mousePos) {
        const tooltipWidth = 250;
        const tooltipHeight = 150;
        const rarityColor = RarityColors[item.rarity] || RarityColors.Common; // Default to COMMON if not found
        const offsetX = 15;
        const offsetY = 15;
        const x = mousePos.x + offsetX;
        const y = mousePos.y + offsetY;
        const borderWidth = 2; // Width of the border
        const borderColor = rarityColor.borderColor; // Color of the border

        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);

        // Background
        ctx.fillStyle = rarityColor.background;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);

        // Gradient shading
        const sectionHeight = 60; // Height for the name and rarity section
        const gradientY = y + sectionHeight; // Y position where the name and rarity section ends
        const gradientStart = 0.05; // Starts closer to the top edge
        const gradientEnd = 0.95;   // Ends closer to the bottom edge

        const gradient = ctx.createLinearGradient(x, y, x, gradientY);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(gradientStart, borderColor);  // Start of the solid color
        gradient.addColorStop(gradientEnd, borderColor);    // End of the solid color
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + tooltipWidth, y);
        ctx.lineTo(x + tooltipWidth, gradientY);
        ctx.lineTo(x, gradientY);
        ctx.closePath();
        ctx.stroke();

        // Text shadow style
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

        // Name of the item
        ctx.font = '22px Arial';
        ctx.fillStyle = rarityColor.font;
        const nameX = x + (tooltipWidth - ctx.measureText('Bronze Sword').width) / 2; // Center the text
        ctx.fillText('Bronze Sword', nameX, y + 30);

        // Rarity
        ctx.font = '14px Arial';
        ctx.fillStyle = '#F7E6D3'; // Specific color for rarity text, adjust as needed
        const rarityX = x + (tooltipWidth - ctx.measureText('COMMON').width) / 2; // Center the text
        ctx.fillText('COMMON', rarityX, y + 50);

        // Remove text shadow for the rest of the text
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // // Stats background
        // const statsHeight = tooltipHeight - gradientY - 10; // Height for stats section
        // const statsY = gradientY + 5; // Position below the gradient shading
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        // ctx.fillRect(x, statsY, tooltipWidth, statsHeight);

        // // Stats text
        // ctx.font = '14px Arial';
        // ctx.fillStyle = '#ffffff';
        // const lineHeight = 18; // Line height for stats
        // const statsStartY = statsY + 18; // Starting Y position for stats
        // ctx.fillText(`+${item.physicalDamage} Physical Damage`, x + 10, statsStartY);
        // ctx.fillText(`+${item.criticalChance}% Crit Chance`, x + 10, statsStartY + lineHeight);
        // ctx.fillText(`+${item.speed} Speed`, x + 10, statsStartY + lineHeight * 2);
    }*/

    function drawItemTooltip(item, mousePos) {
        const tooltipWidth = 250;
        const tooltipTitleHeight = 60; // Height for just the title and rarity
        const tooltipStatsHeight = 90; // Additional height for the stats
        const tooltipHeight = 60; // Adjust the height for just the title and rarity
        const rarityColor = RarityColors[item.rarity] || RarityColors.Common;
        const offsetX = 15;
        const offsetY = 15;
        const x = mousePos.x + offsetX;
        const y = mousePos.y + offsetY;
        const borderWidth = 2;
        const borderColor = '#B3A78B';
        const edgeGradientWidth = tooltipWidth * 0.1;
        const dividerY = y + tooltipTitleHeight; // Y position where the title section ends and stats section begins
        const statsBackgroundColor = '#1A1A1A'; // Dark background for stats section

        // Draw the main background of the tooltip
        ctx.fillStyle = rarityColor.background;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);

        // Draw the top gradient
        let topGradient = ctx.createLinearGradient(x, y, x, y + tooltipHeight * 0.2);
        topGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        topGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = topGradient;
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight * 0.2);

        // Draw the bottom gradient
        let bottomGradient = ctx.createLinearGradient(x, y + tooltipHeight * 0.8, x, y + tooltipHeight);
        bottomGradient.addColorStop(0, 'transparent');
        bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(x, y + tooltipHeight * 0.8, tooltipWidth, tooltipHeight * 0.2);

        // Left gradient
        let leftGradient = ctx.createLinearGradient(x, y, x + edgeGradientWidth, y);
        leftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        leftGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = leftGradient;
        ctx.fillRect(x, y, edgeGradientWidth, tooltipHeight);

        // Right gradient
        let rightGradient = ctx.createLinearGradient(x + tooltipWidth - edgeGradientWidth, y, x + tooltipWidth, y);
        rightGradient.addColorStop(0, 'transparent');
        rightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = rightGradient;
        ctx.fillRect(x + tooltipWidth - edgeGradientWidth, y, edgeGradientWidth, tooltipHeight);

        // Draw the border around the tooltip
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);

        // Text styles
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '22px Arial';
        ctx.fillStyle = rarityColor.font;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

        // Draw the item name in the center
        ctx.fillText('Bronze Sword', x + tooltipWidth / 2, y + 22);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#F7E6D3'; // Specific color for rarity text
        ctx.fillText('COMMON', x + tooltipWidth / 2, y + 40);

        // Remove text shadow for rarity text
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // Main background for stats section
        ctx.fillStyle = statsBackgroundColor;
        ctx.fillRect(x, dividerY, tooltipWidth, tooltipStatsHeight);

        // Stats text
        // Separate the number from the label and use different styles
        const numberFontSize = '26px'; // Larger font size for the number
        ctx.font = `${numberFontSize} Kingthings-Petrock`; // Change to the font that matches the image
        ctx.fillStyle = '#FFFFFF'; // White color for the number
        const damageNumber = '32'; // Replace with your actual dynamic value
        ctx.fillText(damageNumber, x + 20, dividerY + 20);

        // Adjust the position for the label based on the width of the number
        const labelFontSize = '16px'; // Smaller font size for the label
        const numberWidth = ctx.measureText(damageNumber).width;
        /*ctx.font = `${labelFontSize} Arial italic`; // Smaller and italic for the label
        ctx.fillStyle = '#C8C5BD';
        const damageLabel = 'Physical Damage';
        ctx.fillText(damageLabel, x + 20 + numberWidth + 45, dividerY + 22); // Adjust spacing as needed*/
        // Draw each line of stats text
        // statsLines.forEach((line, index) => {
        //     ctx.fillText(line, x + tooltipWidth / 2, statsTextY + lineHeight * index);
        // });
    }

    function drawItemTooltip2(item, mousePos) {
        const tooltipWidth = 250;
        const tooltipTitleHeight = 60; // Height for just the title and rarity
        const tooltipStatsHeight = 90; // Additional height for the stats
        const tooltipTotalHeight = tooltipTitleHeight + tooltipStatsHeight; // Total height of the tooltip
        const rarityColor = RarityColors[item.rarity] || RarityColors.Common;
        const offsetX = 15;
        const offsetY = 15;
        const x = mousePos.x + offsetX;
        const y = mousePos.y + offsetY;
        const dividerY = y + tooltipTitleHeight; // Y position where the title section ends and stats section begins
        const borderWidth = 2;
        const borderColor = '#B3A78B';
        const statsBackgroundColor = '#1A1A1A'; // Dark background for stats section

        // Main background for title section
        ctx.fillStyle = rarityColor.background;
        ctx.fillRect(x, y, tooltipWidth, tooltipTitleHeight);

        // Main background for stats section
        ctx.fillStyle = statsBackgroundColor;
        ctx.fillRect(x, dividerY, tooltipWidth, tooltipStatsHeight);

        // Gradients and borders...

        // Divider line
        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        ctx.moveTo(x, dividerY);
        ctx.lineTo(x + tooltipWidth, dividerY);
        ctx.stroke();

        // Text styles
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '22px Arial';
        ctx.fillStyle = rarityColor.font;

        // Text shadow for title
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

        // Draw the item name in the center of the title section
        ctx.fillText(item.name, x + tooltipWidth / 2, y + tooltipTitleHeight / 2 - 10);

        // Remove text shadow for the rest of the text
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        ctx.font = '14px Arial';
        ctx.fillStyle = '#F7E6D3'; // Specific color for rarity text
        // Draw the rarity centered in the space between the title and the divider
        ctx.fillText(item.rarity, x + tooltipWidth / 2, dividerY - 10);

        // Stats text (as an example, adjust according to your actual data)
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF'; // White color for stats text
        const statsText = `+${item.physicalDamage} Physical Damage\nSmite, Cleave`;
        const statsLines = statsText.split('\n');
        const lineHeight = 20; // Adjust line height as needed
        let statsTextY = dividerY + 20; // Starting y position for stats text

        // Draw each line of stats text
        statsLines.forEach((line, index) => {
            ctx.fillText(line, x + tooltipWidth / 2, statsTextY + lineHeight * index);
        });
    }

    // Make sure to define the RarityColors and item somewhere in the code






    // You might need to adjust the tooltipHeight if you add more stats




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
        if (lastMouseEvent) { // Check if we have a last mouse event
            const mousePos = getMousePos(canvas, lastMouseEvent);
            const hoveredItem = getHoveredItem(mousePos);
            if (hoveredItem) {
                drawItemTooltip(hoveredItem, mousePos);
            }
        }
        if (lastClickPos) {
            const elapsed = Date.now() - lastClickPos.time;
            if (elapsed < clickLifespan) { // Only draw if the click is recent
                drawClick(lastClickPos.x, lastClickPos.y, elapsed);
            } else {
                lastClickPos = null; // Clear the click position after it fades out
            }
        }
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

    let lastMouseEvent = null; // This will store the last mouse event

    canvas.addEventListener('mousemove', function (event) {
        lastMouseEvent = event;
        const mousePos = getMousePos(canvas, event);
        const hoveredItem = getHoveredItem(mousePos);
        if (hoveredItem) {
            drawItemTooltip(hoveredItem, mousePos);
        }
    });

    const clickLifespan = 500;

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
        lastClickPos = { x: event.clientX, y: event.clientY, time: Date.now() };
    });

    function isInsideInventory(pos) {
        return pos.x >= inventoryX && pos.x <= inventoryX + cellSize * columns &&
            pos.y >= inventoryY && pos.y <= inventoryY + cellSize * rows;
    }

    function isInsideInventoryButton(pos) {
        return pos.x >= inventory.x && pos.x <= inventory.x + 50 &&
            pos.y >= inventory.y && pos.y <= inventory.y + 50;
    }

    function drawClick(x, y, elapsed) {
        // Calculate the remaining life of the click indicator as a percentage
        const lifeLeft = Math.max(0, clickLifespan - elapsed) / clickLifespan;
        // Convert this to an alpha value (0.0 - fully transparent, 1.0 - fully opaque)
        const alpha = Math.max(lifeLeft, 0);

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`; // Use the alpha value in the color
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
