/*:
 * @plugindesc Membuat efek vignette (bayangan pinggiran layar) di RPG Maker MV.
 * @author AI Collaborator
 *
 * @help
 * Gunakan Plugin Command berikut di dalam Event:
 * 
 * Vignette Set [radius] [opacity] [color]
 * Contoh: Vignette Set 0.7 180 #000000
 * (Radius: 0.1 sampai 1.0, Opacity: 0 sampai 255, Color: Hex color code)
 * 
 * Vignette Clear
 * Menghapus efek vignette dari layar.
 */

(f() {
    let _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command.toLowerCase() === 'vignette') {
            if (args[0] && args[0].toLowerCase() === 'set') {
                let radius = parseFloat(args[1]) || 0.7;
                let opacity = parseInt(args[2]) || 180;
                let color = args[3] || '#000000';
                $gameScreen.setVignette(radius, opacity, color);
            } else if (args[0] && args[0].toLowerCase() === 'clear') {
                $gameScreen.clearVignette();
            }
        }
    };

    function Sprite_Vignette() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Vignette.prototype = Object.create(Sprite.prototype);
    Sprite_Vignette.prototype.constructor = Sprite_Vignette;

    Sprite_Vignette.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this.visible = false;
    };

    Sprite_Vignette.prototype.redraw = function(radius, opacity, color) {
        this.bitmap.clear();
        let width = Graphics.width;
        let height = Graphics.height;
        let ctx = this.bitmap._context;
        
        let x = width / 2;
        let y = height / 2;
        let r1 = Math.max(width, height) * radius;
        let r2 = Math.max(width, height) * 0.9;

        let gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);
        
        let rgb = this.hexToRgb(color);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 255})`);

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        
        this.bitmap._setDirty();
        this.visible = true;
    };

    Sprite_Vignette.prototype.hexToRgb = function(hex) {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    let _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    Spriteset_Map.prototype.createUpperLayer = function() {
        _Spriteset_Map_createUpperLayer.call(this);
        this.createVignetteSprite();
    };

    Spriteset_Map.prototype.createVignetteSprite = function() {
        this._vignetteSprite = new Sprite_Vignette();
        this.addChild(this._vignetteSprite);
        if ($gameScreen.isVignetteActive()) {
            this._vignetteSprite.redraw(
                $gameScreen._vignetteRadius, 
                $gameScreen._vignetteOpacity, 
                $gameScreen._vignetteColor
            );
        }
    };

    let _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        if (this._vignetteSprite && $gameScreen._vignetteDirty) {
            if ($gameScreen.isVignetteActive()) {
                this._vignetteSprite.redraw(
                    $gameScreen._vignetteRadius, 
                    $gameScreen._vignetteOpacity, 
                    $gameScreen._vignetteColor
                );
            } else {
                this._vignetteSprite.bitmap.clear();
                this._vignetteSprite.visible = false;
            }
            $gameScreen._vignetteDirty = false;
        }
    };

    let _Game_Screen_initialize = Game_Screen.prototype.initialize;
    Game_Screen.prototype.initialize = function() {
        _Game_Screen_initialize.call(this);
        this.clearVignette();
    };

    Game_Screen.prototype.clearVignette = function() {
        this._vignetteActive = false;
        this._vignetteRadius = 0.7;
        this._vignetteOpacity = 180;
        this._vignetteColor = '#000000';
        this._vignetteDirty = true;
    };

    Game_Screen.prototype.setVignette = function(radius, opacity, color) {
        this._vignetteActive = true;
        this._vignetteRadius = radius;
        this._vignetteOpacity = opacity;
        this._vignetteColor = color;
        this._vignetteDirty = true;
    };

    Game_Screen.prototype.isVignetteActive = function() {
        return this._vignetteActive;
    };
    
    let _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
    Spriteset_Battle.prototype.createLowerLayer = function() {
        _Spriteset_Battle_createLowerLayer.call(this);
        this._vignetteSprite = new Sprite_Vignette();
        this.addChild(this._vignetteSprite);
        if ($gameScreen.isVignetteActive()) {
            this._vignetteSprite.redraw(
                $gameScreen._vignetteRadius, 
                $gameScreen._vignetteOpacity, 
                $gameScreen._vignetteColor
            );
        }
    };

    let _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        if (this._vignetteSprite && $gameScreen._vignetteDirty) {
            if ($gameScreen.isVignetteActive()) {
                this._vignetteSprite.redraw(
                    $gameScreen._vignetteRadius, 
                    $gameScreen._vignetteOpacity, 
                    $gameScreen._vignetteColor
                );
            } else {
                this._vignetteSprite.bitmap.clear();
                this._vignetteSprite.visible = false;
            }
            $gameScreen._vignetteDirty = false;
        }
    };
})();