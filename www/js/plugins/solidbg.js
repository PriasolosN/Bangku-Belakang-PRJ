/*:
 * @plugindesc Mengubah latar belakang semua window menjadi hitam pekat (100% Opaque).
 * @author Assistant
 */

Window_Base.prototype.standardBackOpacity = function() {
    return 255; // Mengubah opacity dari 192 menjadi 255 (pekat penuh)
};