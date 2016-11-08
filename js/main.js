var screenWidth = 1080;
var screenHeight = 720;

var cursors;
var baseVelocity = 150;

var sounds = {
    throw: 'sounrdThrow'
};
var sprites = {
    bride: 'imageBride',
    bouquet: 'imageBouquet'
};

var state = {
    preload: function() {
        //game.load.audio('music', ['res/music.mp3']);
        game.load.audio(sounds.throw, ['res/throw.wav']);
        game.load.image(sprites.bride, 'res/bride.png');
        game.load.image(sprites.bouquet, 'res/bouquet.png');
    },
    create: function() {
        game.stage.backgroundColor = '#4488AA';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //game.add.audio('music').play('', 0, 1, true);
        //game.input.onDown.add(go_fullscreen, this);

        //bride
        this.createBride();
    },
    update: function() {
        this.brideUpdate();
        //guestsUpdate();
    },
    createBride: function() {
        this.bride = game.add.sprite(0, game.world.height / 2, sprites.bride);
        game.physics.enable(this.bride);
        this.bride.body.allowGravity = false;
        this.bride.collideWorldBounds = true;
    },
    createBouquet: function() {
        this.bouquet = game.add.sprite(this.bride.body.position.x + 35, this.bride.body.position.y, sprites.bouquet);
        game.physics.enable(this.bouquet);
        this.bouquet.body.allowGravity = false;
        this.bouquet.enableBody = true;
        this.bouquet.events.onOutOfBounds.add(function() {
            this.bouquet.destroy();
        }, this);
        this.bouquet.checkWorldBounds = true;
        this.bouquetUpdate();
    },
    brideUpdate: function() {
        //game.physics.arcade.collide(brides, platforms);

        this.bride.body.velocity.x = 0;
        this.bride.body.velocity.y = 0;

        if(this.cursors.left.isDown) {
            this.bride.body.velocity.x = -baseVelocity;
        }
        if(this.cursors.right.isDown) {
            this.bride.body.velocity.x = baseVelocity;
        }
        if(this.cursors.up.isDown) {
            this.bride.body.velocity.y = -baseVelocity;
        }
        if(this.cursors.down.isDown) {
            this.bride.body.velocity.y = baseVelocity;
        }

        if(this.spaceKey.isDown && (this.bouquet == undefined || this.bouquet.body == null)) {
            game.add.audio(sounds.throw).play();
            this.createBouquet();
        }
    },
    bouquetUpdate: function() {
        this.bouquet.body.velocity.x = 2 * baseVelocity;
    },
    guestsUpdate: function() {
    }
};
/*
function createPlatform() {
    var imgWidth = 64;
    for(var i = 0; i < game.world.width; i += imgWidth) {
        var ground = platforms.create(i, game.world.height - imgWidth, 'brick');
        ground.body.immovable = true;
    }
}

function go_fullscreen() {
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.startFullScreen();
}
*/

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, '', state);