export const findOne = async ({ model, where = {} }) => {
    return await model.findOne(where);
};
