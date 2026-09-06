/*:
 * @plugindesc Mematikan fungsi tombol Escape / Batal / Klik Kanan berdasarkan Switch.
 * @author Assistant
 *
 * @param DisableSwitch
 * @text Switch Pemati Escape
 * @desc ID Switch yang jika bernilai ON akan mematikan fungsi tombol Escape / Batal.
 * @type switch
 * @default 1
 *
 * @help
 * PASTI KAN FILE INI DISIMPAN DENGAN NAMA: DisableEscapeSwitch.js
 */

(function() {
    var parameters = PluginManager.parameters('DisableEscapeSwitch');
    var disableSwitchId = Number(parameters['DisableSwitch'] || 2);

    function isEscapeDisabled() {
        return $gameSwitches && $gameSwitches.value(disableSwitchId);
    }

    // Memblokir pencetan tombol sekali tekan
    var _Input_isTriggered = Input.isTriggered;
    Input.isTriggered = function(keyName) {
        if (isEscapeDisabled() && (keyName === 'escape' || keyName === 'cancel' || keyName === 'menu')) {
            return false;
        }
        return _Input_isTriggered.call(this, keyName);
    };

    // Memblokir penahanan tombol
    var _Input_isPressed = Input.isPressed;
    Input.isPressed = function(keyName) {
        if (isEscapeDisabled() && (keyName === 'escape' || keyName === 'cancel' || keyName === 'menu')) {
            return false;
        }
        return _Input_isPressed.call(this, keyName);
    };

    // Memblokir input berulang (Sangat krusial untuk menu Show Choices)
    var _Input_isRepeated = Input.isRepeated;
    Input.isRepeated = function(keyName) {
        if (isEscapeDisabled() && (keyName === 'escape' || keyName === 'cancel' || keyName === 'menu')) {
            return false;
        }
        return _Input_isRepeated.call(this, keyName);
    };

    // Memblokir klik kanan / sentuhan batal
    var _TouchInput_isCancelled = TouchInput.isCancelled;
    TouchInput.isCancelled = function() {
        if (isEscapeDisabled()) {
            return false;
        }
        return _TouchInput_isCancelled.call(this);
    };

    // Mematikan handler batal secara langsung pada window pilihan
    var _Window_ChoiceList_isCancelEnabled = Window_ChoiceList.prototype.isCancelEnabled;
    Window_ChoiceList.prototype.isCancelEnabled = function() {
        if (isEscapeDisabled()) {
            return false;
        }
        return _Window_ChoiceList_isCancelEnabled.call(this);
    };
})();