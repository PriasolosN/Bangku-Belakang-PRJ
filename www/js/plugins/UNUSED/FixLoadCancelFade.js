/*:
 * @plugindesc Menghilangkan efek kedipan hitam saat kembali dari Scene_Load ke peta.
 * @author Assistant
 */
(function() {
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if (SceneManager.isPreviousScene(Scene_Load)) {
            Graphics.frameCount = Graphics.frameCount; // Sinkronisasi frame
            $gameScreen.clearFade();
        }
    };
})();