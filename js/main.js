var screenWidth = 1080;
var screenHeight = 720;

var cursors;
var baseVelocity = 150;

var sounds = {
    throw: 'sounrdThrow'
};
var sprites = {
    bride: 'imageBride',
    bouquet: 'imageBouquet',
    maid1: 'imageMaid1',
    maid2: 'imageMaid2',
    maid3: 'imageMaid3',
};

var state = {
    preload: function() {
        //game.load.audio('music', ['res/music.mp3']);
        game.load.audio(sounds.throw, ['res/throw.wav']);
        game.load.image(sprites.bride, 'res/bride.png');
        game.load.image(sprites.bouquet, 'res/bouquet.png');
        game.load.image(sprites.maid1, 'res/maid1.png');
        game.load.image(sprites.maid2, 'res/maid2.png');
        game.load.image(sprites.maid3, 'res/maid3.png');
    },
    create: function() {
        game.stage.backgroundColor = '#4488AA';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //game.add.audio('music').play('', 0, 1, true);

        this.createBride();
        this.createMaids();
    },
    update: function() {
        this.brideUpdate();
        this.bouquetUpdate();
    },
    createBride: function() {
        this.bride = game.add.sprite(0, game.world.height / 2, sprites.bride);
        game.physics.arcade.enable(this.bride);
        this.bride.body.allowGravity = false;
        this.bride.collideWorldBounds = true;
    },
    createBouquet: function() {
        this.bouquet = game.add.sprite(this.bride.body.position.x + 35, this.bride.body.position.y, sprites.bouquet);
        game.physics.arcade.enable(this.bouquet);
        this.bouquet.body.allowGravity = false;
        this.bouquet.checkWorldBounds = true;
        
        this.bouquet.events.onOutOfBounds.add(function() {
            this.bouquet.destroy();
        }, this);
    },
    createMaids: function() {
        this.maids = game.add.physicsGroup();

        for(var i = 0; i < 9; i++) {
            this.createMaid();
        }
        this.setMaidCallbacks();
    },
    createMaid: function() {
        var spriteMaid = Phaser.ArrayUtils.getRandomItem([sprites.maid1, sprites.maid2, sprites.maid3]);
        do {
            var posX = game.world.randomX;
        } while(posX < game.world.width/3);
        
        var posY = game.world.randomY;
        var maid = this.maids.create(posX, posY, spriteMaid);
        maid.body.velocity.y = game.rnd.between(100, 300);
        maid.body.mass = -100;
    },
    setMaidCallbacks: function() {
        this.maids.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', function(maid) {
            maid.body.velocity.y = -maid.body.velocity.y;
        }, this);
        this.maids.setAll('checkWorldBounds', true);
    },
    brideUpdate: function() {
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

        if(this.spaceKey.isDown && !this.bouquetExists()) {
            game.add.audio(sounds.throw).play();
            this.createBouquet();
        }
        game.physics.arcade.collide(this.bride, this.maids, function(b,m) { console.log('aa');}, null, this);
    },
    bouquetUpdate: function() {
        if(this.bouquetExists()){
            this.bouquet.body.velocity.x = 5 * baseVelocity;
            this.bouquet.body.velocity.y = 0;
            game.physics.arcade.collide(this.bouquet, this.maids, function(b,m) {
                m.kill();
                alert('score!');
            }, null, this);
        }
    },
    bouquetExists: function() {
        return !(this.bouquet == undefined || this.bouquet.body == null);
    }
};

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'crazy-bride', state);