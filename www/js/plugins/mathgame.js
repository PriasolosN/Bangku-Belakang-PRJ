/*:
 * @plugindesc Minigame matematika acak dengan latar blur dan antarmuka transparan.
 * @author Assistant
 *
 * @param ResultSwitch
 * @text Switch Hasil
 * @desc ID Switch yang bernilai ON jika pemain benar dan OFF jika salah.
 * @type switch
 * @default 1
 *
 * @help
 * Perintah Plugin:
 * MathMinigame start
 */

(function() {
    var parameters = PluginManager.parameters('MathMinigame');
    var resultSwitchId = Number(parameters['ResultSwitch'] || 1);

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MathMinigame') {
            if (args[0] === 'start') {
                SceneManager.push(Scene_MathMinigame);
            }
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_MathMinigame
    //-----------------------------------------------------------------------------
    function Scene_MathMinigame() {
        this.initialize.apply(this, arguments);
    }

    Scene_MathMinigame.prototype = Object.create(Scene_Base.prototype);
    Scene_MathMinigame.prototype.constructor = Scene_MathMinigame;

    Scene_MathMinigame.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this.generateQuestion();
    };

    Scene_MathMinigame.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createQuestionWindow();
        this.createChoiceWindow();
    };

    Scene_MathMinigame.prototype.generateQuestion = function() {
        var ops = ['+', '-', '*', '/'];
        this._op = ops[Math.floor(Math.random() * ops.length)];
        
        if (this._op === '+') {
            this._num1 = Math.floor(Math.random() * 50) + 1;
            this._num2 = Math.floor(Math.random() * 50) + 1;
            this._answer = this._num1 + this._num2;
        } else if (this._op === '-') {
            this._num1 = Math.floor(Math.random() * 50) + 10;
            this._num2 = Math.floor(Math.random() * this._num1);
            this._answer = this._num1 - this._num2;
        } else if (this._op === '*') {
            this._num1 = Math.floor(Math.random() * 12) + 1;
            this._num2 = Math.floor(Math.random() * 12) + 1;
            this._answer = this._num1 * this._num2;
        } else if (this._op === '/') {
            this._num2 = Math.floor(Math.random() * 10) + 1;
            this._answer = Math.floor(Math.random() * 10) + 1;
            this._num1 = this._num2 * this._answer;
        }

        this._options = [this._answer];
        while (this._options.length < 4) {
            var fakeOption = this._answer + (Math.floor(Math.random() * 11) - 5);
            if (fakeOption !== this._answer && this._options.indexOf(fakeOption) === -1 && fakeOption >= 0) {
                this._options.push(fakeOption);
            }
        }
        this._options.sort(function() { return Math.random() - 0.5; });
    };

    Scene_MathMinigame.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        // Mengambil snapshot map terakhir dengan efek blur bawaan RPG Maker MV
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    };

    Scene_MathMinigame.prototype.createQuestionWindow = function() {
        var wy = 160;
        var ww = 600;
        var wh = 100;
        var wx = (Graphics.boxWidth - ww) / 2;
        this._questionWindow = new Window_Base(wx, wy, ww, wh);
        this._questionWindow.opacity = 0; // Menghilangkan bingkai & background bawaan
        
        var text = "Berapakah hasil dari:  " + this._num1 + " " + this._op + " " + this._num2 + " = ?";
        this._questionWindow.drawText(text, 0, 10, ww - 36, 'center');
        this.addChild(this._questionWindow);
    };

    Scene_MathMinigame.prototype.createChoiceWindow = function() {
        var wy = 280;
        var ww = 300;
        var wx = (Graphics.boxWidth - ww) / 2;
        this._choiceWindow = new Window_MathChoice(wx, wy, this._options);
        this._choiceWindow.opacity = 0; // Menghilangkan bingkai bawaan
        this._choiceWindow.setHandler('ok', this.onChoiceOk.bind(this));
        this.addChild(this._choiceWindow);
    };

    Scene_MathMinigame.prototype.onChoiceOk = function() {
        var selectedValue = this._choiceWindow.currentExt();
        if (selectedValue === this._answer) {
            $gameSwitches.setValue(resultSwitchId, true);
        } else {
            $gameSwitches.setValue(resultSwitchId, false);
        }
        this.popScene();
    };

    //-----------------------------------------------------------------------------
    // Window_MathChoice
    //-----------------------------------------------------------------------------
    function Window_MathChoice() {
        this.initialize.apply(this, arguments);
    }

    Window_MathChoice.prototype = Object.create(Window_Command.prototype);
    Window_MathChoice.prototype.constructor = Window_MathChoice;

    Window_MathChoice.prototype.initialize = function(x, y, options) {
        this._options = options;
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_MathChoice.prototype.windowWidth = function() {
        return 300;
    };

    Window_MathChoice.prototype.itemTextAlign = function() {
        return 'center';
    };

    Window_MathChoice.prototype.makeCommandList = function() {
        if (!this._options) return;
        for (var i = 0; i < this._options.length; i++) {
            var opt = this._options[i];
            this.addCommand(String(opt), 'choice', true, opt);
        }
    };
})();