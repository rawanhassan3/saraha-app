export const BadRequestException = (message) => {
    throw new Error(message, { cause: 400 });
};

export const UnauthorizedException = (message) => {
    throw new Error(message, { cause: 401 });
};

export const NotFoundException = (message) => {
    throw new Error(message, { cause: 404 });
};

export const ConflictException = (message) => {
    throw new Error(message, { cause: 409 });
};

export const ForbiddenException = (message) => {
    throw new Error(message, { cause: 403 });
};