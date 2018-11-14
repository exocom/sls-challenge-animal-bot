const transformId = function (doc, ret, options) {
  if (ret && ret._id) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
  return ret;
};

const removeVersionKey = function (doc, ret, options) {
  if (ret && ret.hasOwnProperty('__v')) delete ret.__v;
  return ret;
};

export {transformId, removeVersionKey};