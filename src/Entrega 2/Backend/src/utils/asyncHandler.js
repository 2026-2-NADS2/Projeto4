function asyncHandler(manipulador) {
    return function (req, res, next) {
        Promise.resolve(manipulador(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
