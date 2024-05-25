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
};

class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' })
    }

    preload() {
        // Add loading text
        const loadingText = this.add.text(400, 300, 'Loading...', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5)

        // Add loading bar
        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        progressBox.fillStyle(COLOR_DARK, 0.8)
        progressBox.fillRect(240, 270, 320, 50)

        // Display loading progress
        this.load.on('progress', (value) => {
            progressBar.clear()
            progressBar.fillStyle(COLOR_LIGHT, 1)
            progressBar.fillRect(250, 280, 300 * value, 30)
        })

        // Remove loading bar when complete
        this.load.on('complete', () => {
            progressBar.destroy()
            progressBox.destroy()
            loadingText.destroy()
            this.scene.start('LoginScene')
        })

        // Preload assets for GameScene and LoginScene
        this.load.image('user', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/person.png')
        this.load.image('password', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/key.png')
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.57/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        })

        this.load.image('map', 'content/maps/legendofmushroom1.png')

        // Load player animations
        for (let key in playerAnimations) {
            playerAnimations[key].forEach((frame, index) => {
                this.load.image(`${key}${index}`, frame)
            })
        }

        // Load mob animations
        for (let key in mobAnimations) {
            mobAnimations[key].forEach((frame, index) => {
                this.load.image(`mob_${key}${index}`, frame)
            })
        }
    }

    create() {
        // This method is intentionally left empty
        console.log('loading...');
    }
}


const COLOR_PRIMARY = 0x4e342e
const COLOR_LIGHT = 0x7b5e57
const COLOR_DARK = 0x260e04

class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' })
    }

    preload() {
        this.load.image('user', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/person.png')
        this.load.image('password', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/key.png')

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.57/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        })
    }

    create() {
        var print = this.add.text(0, 0, '')

        var loginDialog = this.createLoginDialog({
            x: 400,
            y: 300,
            title: 'Welcome',
            username: '',
            password: ''
        })
            .on('login', (username, password) => {
                print.text += `Username: ${username}\nPassword: ${password}\n`
                // Handle the login logic here
                this.scene.start('GameScene');
                if (username === 'admin' && password === '1234') {
                    console.log('Login successful')
                    // Transition to the next scene
                    this.scene.start('NextScene')
                } else {
                    console.log('Login failed')
                    // Display error message or clear inputs
                }
            })
            .popUp(500)

        this.add.text(0, 560, 'Click username or password field to edit it\nClick Login button to submit')
    }

    createLoginDialog(config) {
        var username = Phaser.Utils.Objects.GetValue(config, 'username', '')
        var password = Phaser.Utils.Objects.GetValue(config, 'password', '')
        var title = Phaser.Utils.Objects.GetValue(config, 'title', 'Welcome')
        var x = Phaser.Utils.Objects.GetValue(config, 'x', 0)
        var y = Phaser.Utils.Objects.GetValue(config, 'y', 0)
        var width = Phaser.Utils.Objects.GetValue(config, 'width', undefined)
        var height = Phaser.Utils.Objects.GetValue(config, 'height', undefined)

        var background = this.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_PRIMARY)
        var titleField = this.add.text(0, 0, title)
        var userNameField = this.rexUI.add.label({
            orientation: 'x',
            background: this.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT),
            icon: this.add.image(0, 0, 'user'),
            text: this.rexUI.add.BBCodeText(0, 0, username, { fixedWidth: 150, fixedHeight: 36, valign: 'center' }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10 }
        })
            .setInteractive()
            .on('pointerdown', () => {
                var config = {
                    onTextChanged: (textObject, text) => {
                        username = text
                        textObject.text = text
                    }
                }
                this.rexUI.edit(userNameField.getElement('text'), config)
            })

        var passwordField = this.rexUI.add.label({
            orientation: 'x',
            background: this.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT),
            icon: this.add.image(0, 0, 'password'),
            text: this.rexUI.add.BBCodeText(0, 0, this.markPassword(password), { fixedWidth: 150, fixedHeight: 36, valign: 'center' }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10 }
        })
            .setInteractive()
            .on('pointerdown', () => {
                var config = {
                    type: 'password',
                    text: password,
                    onTextChanged: (textObject, text) => {
                        password = text
                        textObject.text = this.markPassword(password)
                    }
                }
                this.rexUI.edit(passwordField.getElement('text'), config)
            })

        var loginButton = this.rexUI.add.label({
            orientation: 'x',
            background: this.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_LIGHT),
            text: this.add.text(0, 0, 'Login'),
            space: { top: 8, bottom: 8, left: 8, right: 8 }
        })
            .setInteractive()
            .on('pointerdown', () => {
                loginDialog.emit('login', username, password)
            })

        var loginDialog = this.rexUI.add.sizer({
            orientation: 'y',
            x: x,
            y: y,
            width: width,
            height: height
        })
            .addBackground(background)
            .add(titleField, 0, 'center', { top: 10, bottom: 10, left: 10, right: 10 }, false)
            .add(userNameField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
            .add(passwordField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
            .add(loginButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
            .layout()
        return loginDialog
    }

    markPassword(password) {
        return new Array(password.length + 1).join('•')
    }
}




class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }

    preload() {
        // Preload assets are handled in LoadingScene, no need to load them again here
    }

    create() {
        var playerSprite = this.physics.add.sprite(300, 450, 'idle0')
        playerSprite.setScale(2)
        playerSprite.setFlipX(true)

        // Create player animations
        for (let key in playerAnimations) {
            this.anims.create({
                key: key,
                frames: playerAnimations[key].map((frame, index) => ({ key: `${key}${index}` })),
                frameRate: 5,
                repeat: 0
            })
        }

        for (let key in mobAnimations) {
            this.anims.create({
                key: `mob_${key}`,
                frames: mobAnimations[key].map((frame, index) => ({ key: `mob_${key}${index}` })),
                frameRate: 5,
                repeat: -1
            })
        }

        playerSprite.play('idle')

        playerSprite.on('animationcomplete', function (anim, frame) {
            playerSprite.play('idle')
        }, this)

        this.mobs = []  // Array to store mobs
        this.socket = io()

        this.socket.on('playAnimation', (data) => {
            playerSprite.play('attack')
        })

        this.socket.on('spawnMob', (mob) => {
            const { x, y } = mob
            const mobToSpawn = this.physics.add.sprite(x, y, 'mob_walk0')
            mobToSpawn.play('mob_walk')
            this.physics.moveToObject(mobToSpawn, playerSprite, 50)
            this.mobs.push(mobToSpawn)
        })

        const addButton = this.add.text(100, 550, 'Add Mob', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                const x = Math.random() * 800
                const y = Math.random() * 600
                const mobToAdd = this.physics.add.sprite(x, y, 'mob_walk0')
                mobToAdd.play('mob_walk')
                this.physics.moveToObject(mobToAdd, playerSprite, 50)
                this.mobs.push(mobToAdd)
            })

        const killButton = this.add.text(200, 550, 'Kill Random Mob', { fill: '#f00' })
            .setInteractive()
            .on('pointerdown', () => {
                if (this.mobs.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.mobs.length)
                    const mobToRemove = this.mobs[randomIndex]
                    mobToRemove.destroy()
                    this.mobs.splice(randomIndex, 1)
                }
            })
    }

    update() {
        // TODO
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1099bb',
    parent: 'NeverEnding',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: [LoadingScene, LoginScene, GameScene]
};

const game = new Phaser.Game(config);