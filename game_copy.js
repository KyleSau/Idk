/*
// this is what Player's data would look like in the database

PlayerStore {
    id,
    username,
    passwordHash,
    x,
    y,
    experience
}

Player {
    spriteId,
    x,
    y,
    destinationX,
    destinationY,
    animation // attack, walk, idle

}

// this is what the Mob's data would look like in the client
Mob {
    spriteId,
    x,
    y,
    currentHealth,
    maxHealth,
    destinationX,
    destinationY,
    animation // attack, walk
}
	
	

// Server -> Client JSON from websocket (socket.io server)
panCamera (x, y, speed, maxSpeed) // this will pan the client's camera to the x,y position
setCamera (x, y) // this will set the client's camera to the x,y position
addXp (amount) // amount is the amount added
setXp (amount) // amount is the total xp the player has

// entity updating
move (index, x, y) // this will perform the walk interpolation to the entity's target x,y position
setPosition (index, x, y) // this will immediately move the entity to the given x,y position
playAnimation (index, animationId) // this will play the animation for the provided entity index
applyDamage (index, amount) // this will display the damage on the entity's
*/
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1099bb',
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

const playerAnimations = {
    idle: [
        'content/player/idle/stand1_0.png',
        'content/player/idle/stand1_1.png',
        'content/player/idle/stand1_2.png',
        'content/player/idle/stand1_3.png',
        'content/player/idle/stand1_4.png'
    ],
    attack: [
        'content/player/swingO1_0.png',
        'content/player/swingO1_1.png',
        'content/player/swingO1_2.png'
    ],
    walk: [
        'content/player/walk/walk1_0.png',
        'content/player/walk/walk1_1.png',
        'content/player/walk/walk1_2.png',
        'content/player/walk/walk1_3.png'
    ]
};

const mobAnimations = {
    mush: {
        idle: [
            'content/mobs/mush/idle/stand_0.png',
            'content/mobs/mush/idle/stand_1.png'
        ],
        hit: [
            'content/mobs/mush/hit/hit1_0.png'
        ],
        walk: [
            'content/mobs/mush/walk/move_0.png',
            'content/mobs/mush/walk/move_1.png',
            'content/mobs/mush/walk/move_2.png'
        ],
        die: [
            'content/mobs/mush/die/die1_0.png',
            'content/mobs/mush/die/die1_1.png',
            'content/mobs/mush/die/die1_2.png'
        ]
    }
};

const damageSprites = [
    'content/misc/damageNo/DamageNo.0.png',
    'content/misc/damageNo/DamageNo.1.png',
    'content/misc/damageNo/DamageNo.2.png',
    'content/misc/damageNo/DamageNo.3.png',
    'content/misc/damageNo/DamageNo.4.png',
    'content/misc/damageNo/DamageNo.5.png',
    'content/misc/damageNo/DamageNo.6.png',
    'content/misc/damageNo/DamageNo.7.png',
    'content/misc/damageNo/DamageNo.8.png',
    'content/misc/damageNo/DamageNo.9.png'
];

let playerSprite, mobs, mobHealthBars, xpBar;
let mobHealth = [30, 30];

const player = {
    level: 1,
    xp: 0,
    totalXP: 0,
    skillPoints: 0,
    health: 100,
    walking: false,
    destination: { x: 350, y: 350 },
    get xpToNextLevel() {
        return Math.floor(83 * Math.pow(1.1, this.level - 1));
    },
    get currentXPAtLevel() {
        return this.xp;
    },
    addXP(amount, scene) {
        this.totalXP += amount;
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.skillPoints++;
            showLevelUp(scene);
        }
        updatePlayerStats();
        updateXPBar(this.xp / this.xpToNextLevel);
    }
};

let playerStatsText;

function updatePlayerStats() {
    // playerStatsText.setText(`Lv: ${player.level}\nTotal XP: ${player.totalXP}\nCurrent XP: ${player.currentXPAtLevel} / ${player.xpToNextLevel}\nXP %: ${Math.floor((player.currentXPAtLevel / player.xpToNextLevel) * 100)}%\nSkill Points: ${player.skillPoints}\nHealth: ${player.health}`);
}

function showLevelUp(scene) {
    const levelUpText = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'Level Up!', {
        font: '48px Arial',
        fill: 'gold'
    }).setOrigin(0.5);

    scene.tweens.add({
        targets: levelUpText,
        alpha: 0,
        duration: 2000,
        onComplete: () => {
            levelUpText.destroy();
        }
    });
}

function preload() {
    // Load map background
    this.load.image('map', 'content/maps/legendofmushroom1.png');

    // Load player animations
    for (let key in playerAnimations) {
        playerAnimations[key].forEach((frame, index) => {
            this.load.image(`${key}${index}`, frame);
        });
    }

    // Load mob animations
    for (let key in mobAnimations) {
        mobAnimations[key].forEach((frame, index) => {
            this.load.image(`mob_${key}${index}`, frame);
        });
    }

    // Load damage number sprites
    damageSprites.forEach((sprite, index) => {
        this.load.image(`damage${index}`, sprite);
    });

    // Load red health bar assets
    this.load.image('left-cap', 'content/ui/barHorizontal_red_left.png');
    this.load.image('middle', 'content/ui/barHorizontal_red_mid.png');
    this.load.image('right-cap', 'content/ui/barHorizontal_red_right.png');

    this.load.image('left-cap-shadow', 'content/ui/barHorizontal_shadow_left.png');
    this.load.image('middle-shadow', 'content/ui/barHorizontal_shadow_mid.png');
    this.load.image('right-cap-shadow', 'content/ui/barHorizontal_shadow_right.png');

    // Load green XP bar assets
    this.load.image('left-cap-xp', 'content/ui/barHorizontal_green_left.png');
    this.load.image('middle-xp', 'content/ui/barHorizontal_green_mid.png');
    this.load.image('right-cap-xp', 'content/ui/barHorizontal_green_right.png');
    this.load.image('left-cap-xp-shadow', 'content/ui/barHorizontal_shadow_left.png');
    this.load.image('middle-xp-shadow', 'content/ui/barHorizontal_shadow_mid.png');
    this.load.image('right-cap-xp-shadow', 'content/ui/barHorizontal_shadow_right.png');
}

function create() {
    const skybox = this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.height - 300, 0x000000).setOrigin(0, 0);

    this.add.image(0, 300, 'map').setOrigin(0, 0);

    // Pan the camera horizontally while keeping the y-coordinate fixed
    // this.cameras.main.pan(800, this.cameras.main.centerY, 2000);

    // Create the player sprite with the first frame of the idle animation
    playerSprite = this.physics.add.sprite(350, 450, 'idle0');
    playerSprite.setScale(2);
    playerSprite.setFlipX(true); // Flip the player sprite horizontally

    // Create the mob sprites with the first frame of the walk animation
    mobs = [
        this.physics.add.sprite(600, 460, 'mob_walk0').setScale(2),
        // this.physics.add.sprite(650, 300, 'mob_walk0').setScale(2)
    ];

    // Enable physics collision between mobs
    this.physics.add.collider(mobs[0], mobs[1]);

    // Create health bars for the mobs
    mobHealthBars = mobs.map((mob, index) => {
        const healthBar = createHealthBar(this, mob.x - 10, mob.y - 70);
        return healthBar;
    });

    // Create player animations
    for (let key in playerAnimations) {
        this.anims.create({
            key: key,
            frames: playerAnimations[key].map((frame, index) => ({ key: `${key}${index}` })),
            frameRate: 5,
            repeat: -1
        });
    }

    // Create mob animations
    for (let key in mobAnimations) {
        this.anims.create({
            key: `mob_${key}`,
            frames: mobAnimations[key].map((frame, index) => ({ key: `mob_${key}${index}` })),
            frameRate: 5,
            repeat: -1
        });
    }

    // Play the first animations
    playerSprite.play('idle');
    mobs.forEach((mob, index) => {
        mob.play('mob_walk');
        this.physics.moveToObject(mob, playerSprite, 50);
    });

    // Timer for player attack
    this.attackTimer = this.time.addEvent({
        delay: 1000,
        callback: playerAttack,
        callbackScope: this,
        loop: true
    });

    // Create text to display player stats
    /*playerStatsText = this.add.text(this.cameras.main.width - 20, 20, '', {
        font: '16px Arial',
        fill: '#ffffff'
    }).setOrigin(1, 0);*/

    updatePlayerStats(); // Initialize player stats UI

    // Create XP bar
    xpBar = createXPBar(this, this.cameras.main.width - 300, 40);
    updateXPBar(player.xp / player.xpToNextLevel);
}

function update() {
    mobs.forEach((mob, index) => {
        // Prevent mobs from passing each other by checking distance and adjusting velocity
        mobs.forEach((otherMob, otherIndex) => {
            if (otherIndex !== index && Phaser.Math.Distance.Between(mob.x, mob.y, otherMob.x, otherMob.y) < 50) {
                mob.setVelocity(0);
            }
        });

        // Check if mob has reached the player
        if (Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, mob.x, mob.y) < 50) {
            mob.setVelocity(0);
            if (mob.anims.getName() !== 'mob_idle') {
                mob.play('mob_idle'); // Switch to idle animation when reaching the player
            }
        } else {
            // Keep the mob moving towards the player if not close
            this.physics.moveToObject(mob, playerSprite, 50);
        }
    });

    // Update health bar and animation text positions
    mobs.forEach((mob, index) => {
        updateMobHealthBarPosition(mob, index);
    });

    // if (player.walking)
    //     playerSprite.play('walk');
    if (player.destination.x < playerSprite.x) {
        playerSprite.play('idle');
        playerSprite.setVelocity(0);
        player.walking = false;
        resetMob(closestMob.index);
        // this.physics.setVelocity(0);
    }

}

function playerAttack() {
    let closestMob = getClosestMob();
    if (closestMob && Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, closestMob.x, closestMob.y) < 150 && mobHealth[closestMob.index] > 0) {
        playerSprite.play('attack');
        let damage = 1 + Math.floor(Math.random() * 20);
        displayDamage(this, closestMob, damage);

        mobHealth[closestMob.index] -= damage;
        if (mobHealth[closestMob.index] <= 0) {
            mobHealth[closestMob.index] = 0;
            closestMob.play('mob_die', true);
            this.time.delayedCall(1000, () => {

                player.addXP(50, this);
                player.destination = { x: playerSprite.x + 800, y: playerSprite.y }
                this.cameras.main.pan(player.destination.x, this.cameras.main.centerY, 2000);
                player.walking = true;
                playerSprite.play('walk');
                this.physics.moveTo(playerSprite, player.destination.x, playerSprite.y, 200);
                // resetMob(closestMob.index);
            }, [], this);
        } else {
            closestMob.play('mob_hit', true);
            this.time.delayedCall(500, () => {
                closestMob.play('mob_idle', true);
            }, [], this);
        }
        updateMobHealthBar(closestMob.index, mobHealth[closestMob.index] / 30);
    } else {
        playerSprite.play('idle');
    }
}

function startWalkingAndPanning() {
    const targetX = playerSprite.x + 800;
    const walkDuration = 2000; // Duration in milliseconds for the walk and pan

    // Start walking
    playerSprite.play('walk');
    this.tweens.add({
        targets: playerSprite,
        x: targetX,
        duration: walkDuration,
        onComplete: () => {
            playerSprite.play('idle');
            spawnNewMob(targetX + 600); // Spawn new mob 600 pixels to the right
        }
    });

    // Pan the camera
    this.cameras.main.pan(targetX, this.cameras.main.scrollY, walkDuration);
}

function spawnNewMob(xPosition) {
    let newMob = this.physics.add.sprite(xPosition, 460, 'mob_walk0').setScale(2);
    this.physics.add.collider(newMob, playerSprite);
    newMob.play('mob_walk');
    mobs.push(newMob);

    let newHealthBar = createHealthBar(this, newMob.x - 10, newMob.y - 70);
    mobHealthBars.push(newHealthBar);
    mobHealth.push(30); // Initial health for new mob
}

function displayDamage(scene, mob, damage) {
    const digits = damage.toString().split('').map(Number);
    const damageGroup = scene.add.group();

    let xOffset = 0;
    digits.forEach((digit) => {
        const digitSprite = scene.add.image(mob.x + xOffset, mob.y - 50, `damage${digit}`);
        digitSprite.setScale(1); // Increase the scale value to make the sprites bigger
        damageGroup.add(digitSprite);
        xOffset += 44; // Adjust xOffset according to the increased scale to avoid overlapping
    });

    scene.tweens.add({
        targets: damageGroup.getChildren(),
        y: '-=50',
        alpha: 0,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => damageGroup.destroy(true)
    });
}

function getClosestMob() {
    let closestMob = null;
    let minDistance = Infinity;

    mobs.forEach((mob, index) => {
        let distance = Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, mob.x, mob.y);
        if (distance < minDistance) {
            minDistance = distance;
            closestMob = mob;
            closestMob.index = index;
        }
    });

    return closestMob;
}

function resetMob(index) {
    // Reset mob's position and health
    mobs[index].setPosition(playerSprite.x + 600, 455);
    mobHealth[index] = 30;
    updateMobHealthBar(index, 1);
    mobs[index].play('mob_walk');
    // this.physics.moveToObject(mobs[index], playerSprite, 50);
}

function updateMobHealthBar(index, percent) {
    mobHealthBars[index].setMeterPercentageAnimated(percent);
}

function updateMobHealthBarPosition(mob, index) {
    mobHealthBars[index].setPosition(mob.x - 50, mob.y - 80);
}

function createHealthBar(scene, x, y) {
    const fullWidth = 100; // Adjust the width as needed

    // Create shadow bar
    const leftShadowCap = scene.add.image(x, y, 'left-cap-shadow').setOrigin(0, 0.5);
    const middleShadowCap = scene.add.image(leftShadowCap.x + leftShadowCap.width, y, 'middle-shadow').setOrigin(0, 0.5);
    middleShadowCap.displayWidth = fullWidth;
    const rightShadowCap = scene.add.image(middleShadowCap.x + middleShadowCap.displayWidth, y, 'right-cap-shadow').setOrigin(0, 0.5);

    // Create health bar
    const leftCap = scene.add.image(x, y, 'left-cap').setOrigin(0, 0.5);
    const middle = scene.add.image(leftCap.x + leftCap.width, y, 'middle').setOrigin(0, 0.5);
    const rightCap = scene.add.image(middle.x + middle.displayWidth, y, 'right-cap').setOrigin(0, 0.5);

    function setMeterPercentage(percent = 1) {
        const width = fullWidth * percent;
        middle.displayWidth = width;
        rightCap.x = middle.x + middle.displayWidth;
        rightShadowCap.x = middleShadowCap.x + middleShadowCap.displayWidth;
    }

    function setMeterPercentageAnimated(percent = 1, duration = 1000) {
        const width = fullWidth * percent;
        scene.tweens.add({
            targets: middle,
            displayWidth: width,
            duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                rightCap.x = middle.x + middle.displayWidth;
                rightShadowCap.x = middleShadowCap.x + middleShadowCap.displayWidth;
                leftCap.visible = middle.displayWidth > 0;
                middle.visible = middle.displayWidth > 0;
                rightCap.visible = middle.displayWidth > 0;
            }
        });
    }

    // Initialize at full health
    setMeterPercentage(1);

    return {
        setPosition(newX, newY) {
            leftCap.setPosition(newX, newY);
            middle.setPosition(leftCap.x + leftCap.width, newY);
            rightCap.setPosition(middle.x + middle.displayWidth, newY);
            leftShadowCap.setPosition(newX, newY);
            middleShadowCap.setPosition(leftShadowCap.x + leftShadowCap.width, newY);
            rightShadowCap.setPosition(middleShadowCap.x + middleShadowCap.displayWidth, newY);
        },
        setMeterPercentage,
        setMeterPercentageAnimated
    };
}

function createXPBar(scene, x, y) {
    const fullWidth = 200; // Adjust the width as needed

    // Create shadow bar
    const leftShadowCap = scene.add.image(x, y, 'left-cap-xp-shadow').setOrigin(0, 0.5);
    const middleShadowCap = scene.add.image(leftShadowCap.x + leftShadowCap.width, y, 'middle-xp-shadow').setOrigin(0, 0.5);
    middleShadowCap.displayWidth = fullWidth;
    const rightShadowCap = scene.add.image(middleShadowCap.x + middleShadowCap.displayWidth, y, 'right-cap-xp-shadow').setOrigin(0, 0.5);

    // Create XP bar
    const leftCap = scene.add.image(x, y, 'left-cap-xp').setOrigin(0, 0.5);
    const middle = scene.add.image(leftCap.x + leftCap.width, y, 'middle-xp').setOrigin(0, 0.5);
    const rightCap = scene.add.image(middle.x + middle.displayWidth, y, 'right-cap-xp').setOrigin(0, 0.5);

    // Level Text
    const levelText = scene.add.text(x - 20, y, `Lv: ${player.level}`, { font: '16px Arial', fill: '#ffffff' }).setOrigin(1, 0.5);

    // Total XP Text
    const xpText = scene.add.text(x + fullWidth + 20, y, `${player.totalXP} XP`, { font: '16px Arial', fill: '#ffffff' }).setOrigin(0, 0.5);

    // Current XP Text
    const currentXPText = scene.add.text(x + fullWidth / 2, y, `${player.currentXPAtLevel} / ${player.xpToNextLevel}`, { font: '16px Arial', fill: '#ffffff' }).setOrigin(0.5, 0.5);

    function setMeterPercentage(percent = 1) {
        const width = fullWidth * percent;
        middle.displayWidth = width;
        rightCap.x = middle.x + middle.displayWidth;
        rightShadowCap.x = middleShadowCap.x + middleShadowCap.displayWidth;
    }

    function setMeterPercentageAnimated(percent = 1, duration = 1000) {
        const width = fullWidth * percent;
        scene.tweens.add({
            targets: middle,
            displayWidth: width,
            duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                rightCap.x = middle.x + middle.displayWidth;
                rightShadowCap.x = middleShadowCap.x + middleShadowCap.displayWidth;
                leftCap.visible = middle.displayWidth > 0;
                middle.visible = middle.displayWidth > 0;
                rightCap.visible = middle.displayWidth > 0;
            },
            onComplete: () => {
                xpText.setText(`${player.totalXP} XP`);
                currentXPText.setText(`${player.currentXPAtLevel} / ${player.xpToNextLevel}`);
            }
        });
    }

    // Initialize at full XP
    setMeterPercentage(1);

    return {
        setMeterPercentage,
        setMeterPercentageAnimated,
        updateText: () => {
            levelText.setText(`Lv: ${player.level}`);
            xpText.setText(`${player.totalXP} XP`);
            currentXPText.setText(`${player.currentXPAtLevel} / ${player.xpToNextLevel}`);
        }
    };
}


function updateXPBar(percent) {
    xpBar.setMeterPercentageAnimated(percent);
    xpBar.updateText();
}