((app) => {
    const position = {
        getPixelPosition: (position) => {
            return Math.floor(position/app.config.pixelSize) * app.config.pixelSize
        }
    }
    
    app.utils = {} || app.utils;
    app.utils.position = position;
})(app);